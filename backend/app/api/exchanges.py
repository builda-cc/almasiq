from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..db.session import get_db
from ..models import (
    Asset,
    ExchangeMessage,
    ExchangeRequest,
    User,
    ViolationLog,
)
from ..schemas.exchange import (
    ExchangeMessageCreate,
    ExchangeMessageOut,
    ExchangeRequestCreate,
    ExchangeRequestOut,
    ExchangeStatusUpdate,
    serialize_exchange,
    serialize_message,
)
from ..services.moderation import sanitize_message
from ..services.notifications import notify, notify_admins
from .deps import get_current_user

router = APIRouter(prefix="/api/exchanges", tags=["exchanges"])

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
)


def _load_request(db: Session, request_id: int) -> ExchangeRequest:
    req = db.execute(
        select(ExchangeRequest).where(ExchangeRequest.id == request_id).options(*_LOAD)
    ).scalar_one_or_none()
    if req is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Request not found"
        )
    return req


def _ensure_party(req: ExchangeRequest, user: User) -> None:
    if user.id not in {req.from_user_id, req.to_user_id}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a party to this exchange",
        )


@router.post("", response_model=ExchangeRequestOut, status_code=status.HTTP_201_CREATED)
def create_exchange(
    payload: ExchangeRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExchangeRequestOut:
    offered = db.get(Asset, payload.offered_asset_id)
    requested = db.get(Asset, payload.requested_asset_id)
    if offered is None or requested is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found"
        )
    if offered.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only offer assets you own",
        )
    if requested.owner_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot request your own asset",
        )

    req = ExchangeRequest(
        from_user_id=current_user.id,
        to_user_id=requested.owner_id,
        offered_asset_id=offered.id,
        requested_asset_id=requested.id,
        message=payload.message,
        status="pending",
    )
    db.add(req)
    db.flush()

    # Notify the recipient that they have a new proposal.
    notify(
        db,
        user_id=requested.owner_id,
        type="exchange",
        title="New exchange proposal",
        body=f"{current_user.full_name} proposed an exchange for '{requested.title}'.",
    )
    db.commit()
    return serialize_exchange(_load_request(db, req.id), db, current_user.id)


@router.get("", response_model=list[ExchangeRequestOut])
def list_exchanges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    direction: str = Query(default="incoming", pattern="^(incoming|outgoing)$"),
) -> list[ExchangeRequestOut]:
    stmt = select(ExchangeRequest).options(*_LOAD)
    if direction == "incoming":
        stmt = stmt.where(ExchangeRequest.to_user_id == current_user.id)
    else:
        stmt = stmt.where(ExchangeRequest.from_user_id == current_user.id)
    reqs = db.execute(stmt.order_by(ExchangeRequest.created_at.desc())).scalars().all()
    return [serialize_exchange(r, db, current_user.id) for r in reqs]


@router.get("/{request_id}", response_model=ExchangeRequestOut)
def get_exchange(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExchangeRequestOut:
    req = _load_request(db, request_id)
    _ensure_party(req, current_user)
    return serialize_exchange(req, db, current_user.id)


@router.patch("/{request_id}", response_model=ExchangeRequestOut)
def update_exchange_status(
    request_id: int,
    payload: ExchangeStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExchangeRequestOut:
    req = _load_request(db, request_id)
    _ensure_party(req, current_user)

    if payload.status == "accepted":
        # The recipient signals interest. This moves the request into the
        # admin's queue (under_review); contact stays hidden until approval.
        if req.to_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the recipient can accept this proposal",
            )
        if req.status not in {"pending", "under_review"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Proposal can no longer be accepted",
            )
        req.recipient_accepted = True
        req.status = "under_review"
        notify_admins(
            db,
            type="exchange",
            title="Review required",
            body=f"Review required for exchange request #{req.id}.",
        )

    elif payload.status == "rejected":
        if req.to_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the recipient can reject this proposal",
            )
        req.status = "rejected"
        notify(
            db,
            user_id=req.from_user_id,
            type="exchange",
            title="Proposal declined",
            body="Your exchange proposal was declined.",
        )

    elif payload.status == "cancelled":
        # The initiator can withdraw before the deal is approved/completed.
        if req.from_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the initiator can cancel this proposal",
            )
        if req.status in {"approved", "completed"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel an approved exchange",
            )
        req.status = "cancelled"

    elif payload.status == "completed":
        if req.status != "approved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only an approved exchange can be completed",
            )
        req.status = "completed"
        for asset_id in (req.offered_asset_id, req.requested_asset_id):
            asset = db.get(Asset, asset_id)
            if asset is not None:
                asset.status = "exchanged"

    db.commit()
    return serialize_exchange(_load_request(db, req.id), db, current_user.id)


# ----- In-platform messaging -----


@router.get("/{request_id}/messages", response_model=list[ExchangeMessageOut])
def list_messages(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ExchangeMessageOut]:
    req = _load_request(db, request_id)
    _ensure_party(req, current_user)
    msgs = (
        db.execute(
            select(ExchangeMessage)
            .where(ExchangeMessage.exchange_request_id == request_id)
            .order_by(ExchangeMessage.created_at.asc())
        )
        .scalars()
        .all()
    )
    return [serialize_message(m) for m in msgs]


@router.post(
    "/{request_id}/messages",
    response_model=ExchangeMessageOut,
    status_code=status.HTTP_201_CREATED,
)
def send_message(
    request_id: int,
    payload: ExchangeMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExchangeMessageOut:
    req = _load_request(db, request_id)
    _ensure_party(req, current_user)
    if req.status in {"rejected", "cancelled"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This exchange is closed",
        )

    # Anti-circumvention: mask any contact info shared before approval. After
    # approval the parties already have each other's contacts, so leave it.
    if req.status == "approved":
        result_body = payload.body
        flagged = False
        violations: list[tuple[str, str]] = []
    else:
        result = sanitize_message(payload.body)
        result_body = result.body
        flagged = result.flagged
        violations = result.violations

    msg = ExchangeMessage(
        exchange_request_id=req.id,
        sender_id=current_user.id,
        body=result_body,
        original_body=payload.body,
        flagged=flagged,
    )
    db.add(msg)

    for kind, text in violations:
        db.add(
            ViolationLog(
                exchange_request_id=req.id,
                user_id=current_user.id,
                kind=kind,
                original_text=text,
            )
        )

    # Notify the counterparty of the new message.
    other_id = (
        req.to_user_id if current_user.id == req.from_user_id else req.from_user_id
    )
    notify(
        db,
        user_id=other_id,
        type="exchange",
        title="New message",
        body=f"You have a new message in exchange #{req.id}.",
    )

    db.commit()
    db.refresh(msg)
    return serialize_message(msg)
