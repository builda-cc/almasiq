"""Contact-privacy authorization.

The platform acts as a trusted intermediary: a user's private contact channels
(phone, email, WhatsApp, Telegram, address) are never exposed to other users
until an administrator approves an exchange request between the two parties.

``can_view_contact_info`` is the single source of truth used by the API layer
when deciding whether to serialise contact fields on a ``UserPublic`` payload.
"""

from __future__ import annotations

from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from ..models import ExchangeRequest


def can_view_contact_info(db: Session, viewer_id: int | None, target_id: int) -> bool:
    """Return True if ``viewer`` is allowed to see ``target``'s contact info.

    Rules:
    * Anonymous viewers can never see contact info.
    * A user can always see their own contact info.
    * Otherwise the two users must be the parties of an ``approved`` exchange.
    """
    if viewer_id is None:
        return False
    if viewer_id == target_id:
        return True

    pair = or_(
        and_(
            ExchangeRequest.from_user_id == viewer_id,
            ExchangeRequest.to_user_id == target_id,
        ),
        and_(
            ExchangeRequest.from_user_id == target_id,
            ExchangeRequest.to_user_id == viewer_id,
        ),
    )
    approved = db.execute(
        select(ExchangeRequest.id)
        .where(pair, ExchangeRequest.status == "approved")
        .limit(1)
    ).first()
    return approved is not None
