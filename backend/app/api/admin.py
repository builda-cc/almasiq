"""Admin Exchange Approval Center.

Administrators review every exchange proposal and decide whether the two
parties may exchange contact information. Approval is the only event that
unlocks contacts (see ``services/privacy.py`` and ``ContactUnlock``).
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from ..db.base import utcnow
from ..db.session import get_db
from ..models import (
    AIMatch,
    Asset,
    ContactUnlock,
    ExchangeMessage,
    ExchangeRequest,
    User,
)
from ..schemas.asset import AssetOut
from ..schemas.exchange import (
    AdminDecision,
    AdminExchangeDetail,
    AdminExchangeRow,
    AdminKpis,
    AdminUserDetail,
    MatchAnalysis,
    serialize_message,
)
from ..schemas.user import VerificationDecision
from ..services.notifications import notify
from .deps import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])

_LOAD = (
    selectinload(ExchangeRequest.from_user),
    selectinload(ExchangeRequest.to_user),
    selectinload(ExchangeRequest.offered_asset).selectinload(Asset.category),
    selectinload(ExchangeRequest.offered_asset).selectinload(Asset.owner),
    selectinload(ExchangeRequest.offered_asset).selectinload(Asset.images),
    selectinload(ExchangeRequest.offered_asset).selectinload(Asset.preferences),
    selectinload(ExchangeRequest.requested_asset).selectinload(Asset.category),
    selectinload(ExchangeRequest.requested_asset).selectinload(Asset.owner),
    selectinload(ExchangeRequest.requested_asset).selectinload(Asset.images),
    selectinload(ExchangeRequest.requested_asset).selectinload(Asset.preferences),
    selectinload(ExchangeRequest.messages).selectinload(ExchangeMessage.sender),
)


def _match_analysis(db: Session, req: ExchangeRequest) -> MatchAnalysis | None:
    a, b = sorted((req.offered_asset_id, req.requested_asset_id))
    match = db.execute(
        select(AIMatch).where(AIMatch.asset_a_id == a, AIMatch.asset_b_id == b)
    ).scalar_one_or_none()
    if match is None:
        return None
    return MatchAnalysis(
        value_score=match.value_score,
        preference_score=match.preference_score,
        location_score=match.location_score,
        liquidity_score=match.liquidity_score,
        match_score=match.match_score,
        value_difference=match.value_difference,
    )


@router.get("/kpis", response_model=AdminKpis)
def admin_kpis(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> AdminKpis:
    def count(*conds) -> int:
        return db.execute(
            select(func.count(ExchangeRequest.id)).where(*conds)
        ).scalar_one()

    total = db.execute(select(func.count(ExchangeRequest.id))).scalar_one()
    pending = count(ExchangeRequest.status == "pending")
    under_review = count(ExchangeRequest.status == "under_review")
    approved = count(ExchangeRequest.status == "approved")
    completed = count(ExchangeRequest.status == "completed")
    rejected = count(ExchangeRequest.status == "rejected")

    # Total value exchanged across completed deals (sum of both assets).
    completed_reqs = (
        db.execute(
            select(ExchangeRequest)
            .where(ExchangeRequest.status.in_(["approved", "completed"]))
            .options(
                selectinload(ExchangeRequest.offered_asset),
                selectinload(ExchangeRequest.requested_asset),
            )
        )
        .scalars()
        .all()
    )
    total_value = sum(
        (r.offered_asset.estimated_value if r.offered_asset else 0)
        + (r.requested_asset.estimated_value if r.requested_asset else 0)
        for r in completed_reqs
    )

    # Average approval time (created_at -> reviewed_at) for approved requests.
    reviewed = db.execute(
        select(ExchangeRequest.created_at, ExchangeRequest.reviewed_at).where(
            ExchangeRequest.status == "approved",
            ExchangeRequest.reviewed_at.is_not(None),
        )
    ).all()
    avg_hours: float | None = None
    if reviewed:
        spans = [
            (r.reviewed_at - r.created_at).total_seconds() / 3600.0 for r in reviewed
        ]
        avg_hours = round(sum(spans) / len(spans), 2)

    return AdminKpis(
        total_requests=total,
        pending_approvals=pending,
        under_review=under_review,
        approved=approved,
        completed=completed,
        rejected=rejected,
        total_value_exchanged=float(total_value),
        average_approval_hours=avg_hours,
    )


@router.get("/exchanges", response_model=list[AdminExchangeRow])
def admin_list_exchanges(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    status_filter: str | None = Query(default=None, alias="status"),
) -> list[AdminExchangeRow]:
    stmt = select(ExchangeRequest).options(*_LOAD)
    if status_filter:
        stmt = stmt.where(ExchangeRequest.status == status_filter)
    reqs = db.execute(stmt.order_by(ExchangeRequest.created_at.desc())).scalars().all()

    rows: list[AdminExchangeRow] = []
    for r in reqs:
        analysis = _match_analysis(db, r)
        rows.append(
            AdminExchangeRow(
                id=r.id,
                status=r.status,
                created_at=r.created_at,
                from_user_name=r.from_user.full_name,
                to_user_name=r.to_user.full_name,
                offered_asset_title=r.offered_asset.title,
                requested_asset_title=r.requested_asset.title,
                offered_value=r.offered_asset.estimated_value,
                requested_value=r.requested_asset.estimated_value,
                match_score=analysis.match_score if analysis else None,
            )
        )
    return rows


def _load_admin_request(db: Session, request_id: int) -> ExchangeRequest:
    req = db.execute(
        select(ExchangeRequest).where(ExchangeRequest.id == request_id).options(*_LOAD)
    ).scalar_one_or_none()
    if req is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Request not found"
        )
    return req


def _admin_detail(db: Session, req: ExchangeRequest) -> AdminExchangeDetail:
    return AdminExchangeDetail(
        id=req.id,
        status=req.status,
        recipient_accepted=req.recipient_accepted,
        message=req.message,
        admin_note=req.admin_note,
        created_at=req.created_at,
        reviewed_at=req.reviewed_at,
        from_user=AdminUserDetail.model_validate(req.from_user),
        to_user=AdminUserDetail.model_validate(req.to_user),
        offered_asset=AssetOut.model_validate(req.offered_asset),
        requested_asset=AssetOut.model_validate(req.requested_asset),
        messages=[serialize_message(m) for m in req.messages],
        match_analysis=_match_analysis(db, req),
    )


@router.get("/exchanges/{request_id}", response_model=AdminExchangeDetail)
def admin_exchange_detail(
    request_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> AdminExchangeDetail:
    req = _load_admin_request(db, request_id)
    return _admin_detail(db, req)


@router.post("/exchanges/{request_id}/decision", response_model=AdminExchangeDetail)
def admin_decide(
    request_id: int,
    payload: AdminDecision,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
) -> AdminExchangeDetail:
    req = _load_admin_request(db, request_id)
    if req.status in {"completed", "cancelled"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This exchange can no longer be moderated",
        )

    req.admin_id = admin.id
    req.admin_note = payload.note

    if payload.action == "under_review":
        req.status = "under_review"

    elif payload.action == "request_info":
        req.status = "under_review"
        for uid in (req.from_user_id, req.to_user_id):
            notify(
                db,
                user_id=uid,
                type="exchange",
                title="More information requested",
                body=payload.note
                or "An administrator requested more information about your exchange.",
            )

    elif payload.action == "reject":
        req.status = "rejected"
        req.reviewed_at = utcnow()
        for uid in (req.from_user_id, req.to_user_id):
            notify(
                db,
                user_id=uid,
                type="exchange",
                title="Exchange not approved",
                body=payload.note
                or "Your exchange request was not approved by an administrator.",
            )

    elif payload.action == "approve":
        req.status = "approved"
        req.reviewed_at = utcnow()
        _unlock_contacts(db, req, admin.id)
        for uid in (req.from_user_id, req.to_user_id):
            notify(
                db,
                user_id=uid,
                type="exchange",
                title="Exchange approved",
                body="Your exchange request has been approved. Contact "
                "information is now available.",
            )

    db.commit()
    return _admin_detail(db, _load_admin_request(db, req.id))


def _unlock_contacts(db: Session, req: ExchangeRequest, admin_id: int) -> None:
    existing = db.execute(
        select(ContactUnlock).where(ContactUnlock.exchange_request_id == req.id)
    ).scalar_one_or_none()
    now = utcnow()
    if existing is None:
        db.add(
            ContactUnlock(
                exchange_request_id=req.id,
                user_a_id=req.from_user_id,
                user_b_id=req.to_user_id,
                approved_by_admin=admin_id,
                approved_at=now,
            )
        )
    else:
        existing.approved_by_admin = admin_id
        existing.approved_at = now


# ----- KYC verification -----


@router.get("/users", response_model=list[AdminUserDetail])
def admin_list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[User]:
    return db.execute(select(User).order_by(User.created_at.desc())).scalars().all()


@router.post("/users/{user_id}/verification", response_model=AdminUserDetail)
def admin_set_verification(
    user_id: int,
    payload: VerificationDecision,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    user.verification_status = payload.verification_status
    notify(
        db,
        user_id=user.id,
        type="system",
        title="Verification updated",
        body=f"Your account is now '{payload.verification_status}'.",
    )
    db.commit()
    db.refresh(user)
    return user
