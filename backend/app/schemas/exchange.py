from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from pydantic import BaseModel, ConfigDict, Field

from .asset import AssetOut, serialize_asset
from .user import UserPublic, serialize_user

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

    from ..models import ExchangeMessage, ExchangeRequest


class ExchangeRequestCreate(BaseModel):
    offered_asset_id: int
    requested_asset_id: int
    message: str = ""


class ExchangeStatusUpdate(BaseModel):
    # Recipient/initiator-driven transitions only.
    # accepted -> records recipient interest; completed -> closes an approved deal.
    status: str = Field(pattern="^(accepted|rejected|cancelled|completed)$")


class ExchangeRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message: str
    status: str
    recipient_accepted: bool
    created_at: datetime

    from_user: UserPublic
    to_user: UserPublic
    offered_asset: AssetOut
    requested_asset: AssetOut

    # The viewer's role in this exchange and whether contact is unlocked for
    # them, so the client can render the right UI without extra requests.
    contact_unlocked: bool = False


class ExchangeMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    body: str
    flagged: bool
    created_at: datetime


class ExchangeMessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


# ----- Admin views -----


class AdminUserDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone: str | None = None
    city: str | None = None
    verification_status: str
    created_at: datetime


class MatchAnalysis(BaseModel):
    value_score: float
    preference_score: float
    location_score: float
    liquidity_score: float
    match_score: float
    value_difference: float


class AdminExchangeRow(BaseModel):
    """One row of the admin Exchange Review table."""

    id: int
    status: str
    created_at: datetime
    from_user_name: str
    to_user_name: str
    offered_asset_title: str
    requested_asset_title: str
    offered_value: float
    requested_value: float
    match_score: float | None = None


class AdminExchangeDetail(BaseModel):
    id: int
    status: str
    recipient_accepted: bool
    message: str
    admin_note: str | None = None
    created_at: datetime
    reviewed_at: datetime | None = None

    from_user: AdminUserDetail
    to_user: AdminUserDetail
    offered_asset: AssetOut
    requested_asset: AssetOut
    messages: list[ExchangeMessageOut]
    match_analysis: MatchAnalysis | None = None


class AdminDecision(BaseModel):
    # approve | reject | request_info | under_review
    action: str = Field(pattern="^(approve|reject|request_info|under_review)$")
    note: str | None = None


class AdminKpis(BaseModel):
    total_requests: int
    pending_approvals: int
    under_review: int
    approved: int
    completed: int
    rejected: int
    total_value_exchanged: float
    average_approval_hours: float | None = None


class FavoriteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    asset: AssetOut


class DashboardStats(BaseModel):
    total_assets: int
    active_exchanges: int
    completed_exchanges: int
    ai_matches: int
    total_value_listed: float


def serialize_exchange(
    req: "ExchangeRequest", db: "Session", viewer_id: int
) -> ExchangeRequestOut:
    """Serialise an exchange for one of its two parties, revealing the
    counterparty's contact info only once the exchange is approved.
    """
    from ..services.privacy import can_view_contact_info

    from_visible = can_view_contact_info(db, viewer_id, req.from_user_id)
    to_visible = can_view_contact_info(db, viewer_id, req.to_user_id)

    out = ExchangeRequestOut.model_validate(req)
    out.from_user = serialize_user(req.from_user, contact_visible=from_visible)
    out.to_user = serialize_user(req.to_user, contact_visible=to_visible)
    out.offered_asset = serialize_asset(req.offered_asset, db, viewer_id)
    out.requested_asset = serialize_asset(req.requested_asset, db, viewer_id)
    out.contact_unlocked = req.status == "approved"
    return out


def serialize_message(msg: "ExchangeMessage") -> ExchangeMessageOut:
    return ExchangeMessageOut.model_validate(msg)
