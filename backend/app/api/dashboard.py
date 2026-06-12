from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from ..db.session import get_db
from ..models import AIMatch, Asset, ExchangeRequest, User
from ..schemas.exchange import DashboardStats
from .deps import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardStats:
    my_asset_ids = (
        db.execute(select(Asset.id).where(Asset.owner_id == current_user.id))
        .scalars()
        .all()
    )

    total_assets = len(my_asset_ids)
    total_value = db.execute(
        select(func.coalesce(func.sum(Asset.estimated_value), 0.0)).where(
            Asset.owner_id == current_user.id
        )
    ).scalar_one()

    active_exchanges = db.execute(
        select(func.count(ExchangeRequest.id)).where(
            or_(
                ExchangeRequest.from_user_id == current_user.id,
                ExchangeRequest.to_user_id == current_user.id,
            ),
            ExchangeRequest.status.in_(["pending", "negotiation", "accepted"]),
        )
    ).scalar_one()

    completed_exchanges = db.execute(
        select(func.count(ExchangeRequest.id)).where(
            or_(
                ExchangeRequest.from_user_id == current_user.id,
                ExchangeRequest.to_user_id == current_user.id,
            ),
            ExchangeRequest.status == "completed",
        )
    ).scalar_one()

    ai_matches = 0
    if my_asset_ids:
        ai_matches = db.execute(
            select(func.count(AIMatch.id)).where(
                or_(
                    AIMatch.asset_a_id.in_(my_asset_ids),
                    AIMatch.asset_b_id.in_(my_asset_ids),
                )
            )
        ).scalar_one()

    return DashboardStats(
        total_assets=total_assets,
        active_exchanges=active_exchanges,
        completed_exchanges=completed_exchanges,
        ai_matches=ai_matches,
        total_value_listed=float(total_value),
    )
