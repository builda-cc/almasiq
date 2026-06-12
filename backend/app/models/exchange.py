from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.base import Base, TimestampMixin


class ExchangeRequest(Base, TimestampMixin):
    """A proposal to exchange one asset for another.

    For the MVP a proposal references a single offered asset and a single
    requested asset; multi-asset deals are represented by creating linked
    proposals (the schema is extensible for many-to-many later).
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

    # pending | accepted | rejected | negotiation | completed
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)

    offered_asset = relationship("Asset", foreign_keys=[offered_asset_id])
    requested_asset = relationship("Asset", foreign_keys=[requested_asset_id])
    from_user = relationship("User", foreign_keys=[from_user_id])
    to_user = relationship("User", foreign_keys=[to_user_id])
