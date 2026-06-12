from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from ..db.session import get_db
from ..models import AIMatch, Asset, User
from ..schemas.match import MatchOut
from ..services.matching import recompute_matches
from .deps import get_current_user

router = APIRouter(prefix="/api/matches", tags=["matches"])

_LOAD = (
    selectinload(AIMatch.asset_a).selectinload(Asset.category),
    selectinload(AIMatch.asset_a).selectinload(Asset.owner),
    selectinload(AIMatch.asset_a).selectinload(Asset.images),
    selectinload(AIMatch.asset_a).selectinload(Asset.preferences),
    selectinload(AIMatch.asset_b).selectinload(Asset.category),
    selectinload(AIMatch.asset_b).selectinload(Asset.owner),
    selectinload(AIMatch.asset_b).selectinload(Asset.images),
    selectinload(AIMatch.asset_b).selectinload(Asset.preferences),
)


@router.post("/recompute")
def recompute(db: Session = Depends(get_db)) -> dict[str, int]:
    """Rebuild the match table across all active assets."""
    count = recompute_matches(db)
    return {"matches": count}


@router.get("", response_model=list[MatchOut])
def list_matches(
    db: Session = Depends(get_db),
    min_score: float = Query(default=0, ge=0, le=100),
    limit: int = Query(default=50, ge=1, le=200),
) -> list[AIMatch]:
    return (
        db.execute(
            select(AIMatch)
            .where(AIMatch.match_score >= min_score)
            .options(*_LOAD)
            .order_by(AIMatch.match_score.desc())
            .limit(limit)
        )
        .scalars()
        .all()
    )


@router.get("/mine", response_model=list[MatchOut])
def my_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(default=50, ge=1, le=200),
) -> list[AIMatch]:
    """Matches that involve one of the current user's assets."""
    my_asset_ids = (
        db.execute(select(Asset.id).where(Asset.owner_id == current_user.id))
        .scalars()
        .all()
    )
    if not my_asset_ids:
        return []
    return (
        db.execute(
            select(AIMatch)
            .where(
                or_(
                    AIMatch.asset_a_id.in_(my_asset_ids),
                    AIMatch.asset_b_id.in_(my_asset_ids),
                )
            )
            .options(*_LOAD)
            .order_by(AIMatch.match_score.desc())
            .limit(limit)
        )
        .scalars()
        .all()
    )
