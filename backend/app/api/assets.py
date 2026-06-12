from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from ..db.session import get_db
from ..models import Asset, AssetImage, Category, ExchangePreference, User
from ..schemas.asset import (
    AssetCreate,
    AssetListResponse,
    AssetOut,
    AssetUpdate,
)
from .deps import get_current_user

router = APIRouter(prefix="/api/assets", tags=["assets"])

_LOAD_OPTS = (
    selectinload(Asset.category),
    selectinload(Asset.owner),
    selectinload(Asset.images),
    selectinload(Asset.preferences),
)


def _get_asset_or_404(db: Session, asset_id: int) -> Asset:
    asset = db.execute(
        select(Asset).where(Asset.id == asset_id).options(*_LOAD_OPTS)
    ).scalar_one_or_none()
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found"
        )
    return asset


def _resolve_category(db: Session, slug: str) -> Category:
    category = db.execute(
        select(Category).where(Category.slug == slug)
    ).scalar_one_or_none()
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown category: {slug}",
        )
    return category


@router.get("", response_model=AssetListResponse)
def list_assets(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None, description="Free-text search on title"),
    category: str | None = Query(default=None, description="Category slug"),
    region: str | None = None,
    city: str | None = None,
    min_value: float | None = Query(default=None, ge=0),
    max_value: float | None = Query(default=None, ge=0),
    sort: str = Query(default="newest", pattern="^(newest|oldest|highest|lowest)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=100),
) -> AssetListResponse:
    stmt = select(Asset).where(Asset.status == "active")

    if q:
        stmt = stmt.where(Asset.title.ilike(f"%{q}%"))
    if category:
        stmt = stmt.join(Category).where(Category.slug == category)
    if region:
        stmt = stmt.where(Asset.region == region)
    if city:
        stmt = stmt.where(Asset.city == city)
    if min_value is not None:
        stmt = stmt.where(Asset.estimated_value >= min_value)
    if max_value is not None:
        stmt = stmt.where(Asset.estimated_value <= max_value)

    if sort == "newest":
        stmt = stmt.order_by(Asset.created_at.desc())
    elif sort == "oldest":
        stmt = stmt.order_by(Asset.created_at.asc())
    elif sort == "highest":
        stmt = stmt.order_by(Asset.estimated_value.desc())
    elif sort == "lowest":
        stmt = stmt.order_by(Asset.estimated_value.asc())

    total = db.execute(
        select(func.count()).select_from(stmt.order_by(None).subquery())
    ).scalar_one()

    items = (
        db.execute(
            stmt.options(*_LOAD_OPTS).offset((page - 1) * page_size).limit(page_size)
        )
        .scalars()
        .all()
    )
    return AssetListResponse(
        items=[AssetOut.model_validate(a) for a in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/mine", response_model=list[AssetOut])
def my_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Asset]:
    return (
        db.execute(
            select(Asset)
            .where(Asset.owner_id == current_user.id)
            .options(*_LOAD_OPTS)
            .order_by(Asset.created_at.desc())
        )
        .scalars()
        .all()
    )


@router.get("/{asset_id}", response_model=AssetOut)
def get_asset(asset_id: int, db: Session = Depends(get_db)) -> Asset:
    return _get_asset_or_404(db, asset_id)


@router.post("", response_model=AssetOut, status_code=status.HTTP_201_CREATED)
def create_asset(
    payload: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Asset:
    category = _resolve_category(db, payload.category_slug)

    asset = Asset(
        owner_id=current_user.id,
        category_id=category.id,
        title=payload.title,
        description=payload.description,
        estimated_value=payload.estimated_value,
        country=payload.country,
        region=payload.region,
        city=payload.city,
        latitude=payload.latitude,
        longitude=payload.longitude,
        liquidity_score=payload.liquidity_score,
    )
    asset.images = [
        AssetImage(url=img.url, position=img.position) for img in payload.images
    ]
    asset.preferences = [
        ExchangePreference(
            category_slug=p.category_slug,
            cash_accepted=p.cash_accepted,
            notes=p.notes,
        )
        for p in payload.preferences
    ]
    db.add(asset)
    db.commit()
    return _get_asset_or_404(db, asset.id)


@router.patch("/{asset_id}", response_model=AssetOut)
def update_asset(
    asset_id: int,
    payload: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Asset:
    asset = _get_asset_or_404(db, asset_id)
    if asset.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your asset"
        )

    data = payload.model_dump(exclude_unset=True)
    images = data.pop("images", None)
    preferences = data.pop("preferences", None)
    for key, value in data.items():
        setattr(asset, key, value)

    if images is not None:
        asset.images = [
            AssetImage(url=i["url"], position=i.get("position", 0)) for i in images
        ]
    if preferences is not None:
        asset.preferences = [
            ExchangePreference(
                category_slug=p["category_slug"],
                cash_accepted=p.get("cash_accepted", False),
                notes=p.get("notes"),
            )
            for p in preferences
        ]

    db.commit()
    return _get_asset_or_404(db, asset.id)


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    asset = _get_asset_or_404(db, asset_id)
    if asset.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your asset"
        )
    db.delete(asset)
    db.commit()
