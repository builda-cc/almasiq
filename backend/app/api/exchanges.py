from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..db.session import get_db
from ..models import Asset, ExchangeRequest, User
from ..schemas.exchange import (
    ExchangeRequestCreate,
    ExchangeRequestOut,
    ExchangeStatusUpdate,
)
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


@router.post("", response_model=ExchangeRequestOut, status_code=status.HTTP_201_CREATED)
def create_exchange(
    payload: ExchangeRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExchangeRequest:
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
    )
    db.add(req)
    db.commit()
    return _load_request(db, req.id)


@router.get("", response_model=list[ExchangeRequestOut])
def list_exchanges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    direction: str = Query(default="incoming", pattern="^(incoming|outgoing)$"),
) -> list[ExchangeRequest]:
    stmt = select(ExchangeRequest).options(*_LOAD)
    if direction == "incoming":
        stmt = stmt.where(ExchangeRequest.to_user_id == current_user.id)
    else:
        stmt = stmt.where(ExchangeRequest.from_user_id == current_user.id)
    return db.execute(stmt.order_by(ExchangeRequest.created_at.desc())).scalars().all()


@router.patch("/{request_id}", response_model=ExchangeRequestOut)
def update_exchange_status(
    request_id: int,
    payload: ExchangeStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExchangeRequest:
    req = _load_request(db, request_id)

    # The recipient can accept/reject/negotiate; either party can complete.
    if payload.status in {"accepted", "rejected", "negotiation"}:
        if req.to_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the recipient can respond to this proposal",
            )
    elif payload.status == "completed":
        if current_user.id not in {req.from_user_id, req.to_user_id}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a party to this exchange",
            )

    req.status = payload.status

    # Mark assets exchanged on completion.
    if payload.status == "completed":
        for asset_id in (req.offered_asset_id, req.requested_asset_id):
            asset = db.get(Asset, asset_id)
            if asset is not None:
                asset.status = "exchanged"

    db.commit()
    return _load_request(db, req.id)
