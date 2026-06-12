from __future__ import annotations

from sqlalchemy import Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.base import Base, TimestampMixin


class AIMatch(Base, TimestampMixin):
    """A computed exchange opportunity between two assets.

    Stores the overall score plus the four component scores from the
    matching formula so the UI can show a breakdown.
    """

    __tablename__ = "ai_matches"
    __table_args__ = (UniqueConstraint("asset_a_id", "asset_b_id", name="asset_pair"),)

    id: Mapped[int] = mapped_column(primary_key=True)

    asset_a_id: Mapped[int] = mapped_column(
        ForeignKey("assets.id", ondelete="CASCADE"), index=True, nullable=False
    )
    asset_b_id: Mapped[int] = mapped_column(
        ForeignKey("assets.id", ondelete="CASCADE"), index=True, nullable=False
    )

    match_score: Mapped[float] = mapped_column(Float, nullable=False)
    value_score: Mapped[float] = mapped_column(Float, nullable=False)
    preference_score: Mapped[float] = mapped_column(Float, nullable=False)
    location_score: Mapped[float] = mapped_column(Float, nullable=False)
    liquidity_score: Mapped[float] = mapped_column(Float, nullable=False)

    value_difference: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Optional AI-generated explanation (or rule-based summary).
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)

    # 1to1 | 1tomany | manytomany
    match_type: Mapped[str] = mapped_column(String(20), default="1to1", nullable=False)

    asset_a = relationship("Asset", foreign_keys=[asset_a_id])
    asset_b = relationship("Asset", foreign_keys=[asset_b_id])
