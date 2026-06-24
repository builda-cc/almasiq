from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.base import Base, TimestampMixin

# Canonical workflow states for an exchange request.
# pending -> under_review -> approved -> completed
# pending -> rejected
# (cancelled is reachable by the initiator before approval)
EXCHANGE_STATES = (
    "pending",
    "under_review",
    "approved",
    "rejected",
    "cancelled",
    "completed",
)


class ExchangeRequest(Base, TimestampMixin):
    """A proposal to exchange one asset for another.

    For the MVP a proposal references a single offered asset and a single
    requested asset; multi-asset deals are represented by creating linked
    proposals (the schema is extensible for many-to-many later).

    Contact information of the two parties stays hidden until an administrator
    moves the request to ``approved`` (see ``ContactUnlock`` and
    ``services/privacy.py``).
    """

    __tablename__ = "exchange_requests"

    id: Mapped[int] = mapped_column(primary_key=True)

    from_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    to_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )

    offered_asset_id: Mapped[int] = mapped_column(
        ForeignKey("assets.id", ondelete="CASCADE"), nullable=False
    )
    requested_asset_id: Mapped[int] = mapped_column(
        ForeignKey("assets.id", ondelete="CASCADE"), nullable=False
    )

    message: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # pending | under_review | approved | rejected | cancelled | completed
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)

    # Whether the recipient (to_user) has expressed interest. The admin can
    # only approve a request once the recipient has accepted.
    recipient_accepted: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )

    # Admin moderation fields.
    admin_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    admin_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    offered_asset = relationship("Asset", foreign_keys=[offered_asset_id])
    requested_asset = relationship("Asset", foreign_keys=[requested_asset_id])
    from_user = relationship("User", foreign_keys=[from_user_id])
    to_user = relationship("User", foreign_keys=[to_user_id])
    admin = relationship("User", foreign_keys=[admin_id])

    messages = relationship(
        "ExchangeMessage",
        back_populates="exchange_request",
        cascade="all, delete-orphan",
        order_by="ExchangeMessage.created_at",
    )
    contact_unlock = relationship(
        "ContactUnlock",
        back_populates="exchange_request",
        uselist=False,
        cascade="all, delete-orphan",
    )


class ExchangeMessage(Base, TimestampMixin):
    """A single in-platform chat message tied to an exchange request.

    Free-form contact details are masked at write time (see
    ``services/moderation.py``); ``original_body`` preserves the raw text for
    admin review and ``flagged`` marks messages that attempted to share
    contact information.
    """

    __tablename__ = "exchange_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    exchange_request_id: Mapped[int] = mapped_column(
        ForeignKey("exchange_requests.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    sender_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )

    # Sanitised body shown to users.
    body: Mapped[str] = mapped_column(Text, default="", nullable=False)
    # Raw body kept for admin auditing only.
    original_body: Mapped[str] = mapped_column(Text, default="", nullable=False)
    flagged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    exchange_request = relationship("ExchangeRequest", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])


class ContactUnlock(Base, TimestampMixin):
    """Records that the two parties of an exchange may see each other's
    contact information, granted when an admin approves the exchange.
    """

    __tablename__ = "contact_unlocks"

    id: Mapped[int] = mapped_column(primary_key=True)
    exchange_request_id: Mapped[int] = mapped_column(
        ForeignKey("exchange_requests.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    user_a_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user_b_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    approved_by_admin: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    exchange_request = relationship("ExchangeRequest", back_populates="contact_unlock")


class ViolationLog(Base, TimestampMixin):
    """Anti-circumvention audit trail: logged when a chat message attempts to
    share contact information before an exchange is approved.
    """

    __tablename__ = "violation_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    exchange_request_id: Mapped[int] = mapped_column(
        ForeignKey("exchange_requests.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    # phone | email | telegram | whatsapp
    kind: Mapped[str] = mapped_column(String(20), nullable=False)
    original_text: Mapped[str] = mapped_column(Text, default="", nullable=False)

    user = relationship("User", foreign_keys=[user_id])
