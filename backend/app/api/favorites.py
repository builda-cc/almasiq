from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..db.session import get_db
from ..models import Asset, Favorite, User
from ..schemas.exchange import FavoriteOut
from .deps import get_current_user

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

_LOAD = (
    selectinload(Favorite.asset).selectinload(Asset.category),
    selectinload(Favorite.asset).selectinload(Asset.owner),
    selectinload(Favorite.asset).selectinload(Asset.images),
    selectinload(Favorite.asset).selectinload(Asset.preferences),
)


@router.get("", response_model=list[FavoriteOut])
def list_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Favorite]:
    return (
        db.execute(
            select(Favorite)
            .where(Favorite.user_id == current_user.id)
            .options(*_LOAD)
            .order_by(Favorite.created_at.desc())
        )
        .scalars()
        .all()
    )


@router.post(
    "/{asset_id}", response_model=FavoriteOut, status_code=status.HTTP_201_CREATED
)
def add_favorite(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Favorite:
    asset = db.get(Asset, asset_id)
    if asset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found"
        )

    existing = db.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id, Favorite.asset_id == asset_id
        )
    ).scalar_one_or_none()
    if existing is not None:
        return db.execute(
            select(Favorite).where(Favorite.id == existing.id).options(*_LOAD)
        ).scalar_one()

    fav = Favorite(user_id=current_user.id, asset_id=asset_id)
    db.add(fav)
    db.commit()
    return db.execute(
        select(Favorite).where(Favorite.id == fav.id).options(*_LOAD)
    ).scalar_one()


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    fav = db.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id, Favorite.asset_id == asset_id
        )
    ).scalar_one_or_none()
    if fav is not None:
        db.delete(fav)
        db.commit()
