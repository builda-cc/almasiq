from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..models import Asset, Category
from ..schemas.asset import CategoryOut

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)) -> list[CategoryOut]:
    counts = dict(
        db.execute(
            select(Asset.category_id, func.count(Asset.id))
            .where(Asset.status == "active")
            .group_by(Asset.category_id)
        ).all()
    )
    categories = db.execute(select(Category).order_by(Category.id)).scalars().all()
    return [
        CategoryOut(
            id=c.id,
            slug=c.slug,
            name=c.name,
            icon=c.icon,
            image_url=c.image_url,
            asset_count=counts.get(c.id, 0),
        )
        for c in categories
    ]
