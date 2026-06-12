from __future__ import annotations

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.base import Base, TimestampMixin


class AIValuation(Base, TimestampMixin):
    """Stored output of the valuation service (Phase 2).

    Kept in the schema now so valuation history can be recorded as soon as
    the service is implemented.
    """

    __tablename__ = "ai_valuations"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_id: Mapped[int | None] = mapped_column(
        ForeignKey("assets.id", ondelete="SET NULL"), index=True, nullable=True
    )

    market_value_low: Mapped[float] = mapped_column(Float, nullable=False)
    market_value_high: Mapped[float] = mapped_column(Float, nullable=False)
    recommended_value: Mapped[float] = mapped_column(Float, nullable=False)
    liquidity_score: Mapped[int] = mapped_column(Integer, default=50, nullable=False)

    # How the estimate was produced: rule | openai
    source: Mapped[str] = mapped_column(String(20), default="rule", nullable=False)

    asset = relationship("Asset")
