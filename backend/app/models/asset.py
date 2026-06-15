from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from .category import Category
    from .user import User


class Asset(Base, TimestampMixin):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"), index=True, nullable=False
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # Estimated value in KZT (tenge).
    estimated_value: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Location
    country: Mapped[str] = mapped_column(
        String(120), default="Kazakhstan", nullable=False
    )
    region: Mapped[str | None] = mapped_column(String(120), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Liquidity score 0-100 (seeded/estimated; refined by valuation service).
    liquidity_score: Mapped[int] = mapped_column(Integer, default=50, nullable=False)

    # Listing lifecycle: active | exchanged | hidden
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)

    owner: Mapped["User"] = relationship(back_populates="assets")
    category: Mapped["Category"] = relationship()
    images: Mapped[list["AssetImage"]] = relationship(
        back_populates="asset",
        cascade="all, delete-orphan",
        order_by="AssetImage.position",
    )
    preferences: Mapped[list["ExchangePreference"]] = relationship(
        back_populates="asset", cascade="all, delete-orphan"
    )


class AssetImage(Base):
    __tablename__ = "asset_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_id: Mapped[int] = mapped_column(
        ForeignKey("assets.id", ondelete="CASCADE"), index=True, nullable=False
    )
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    asset: Mapped["Asset"] = relationship(back_populates="images")


class ExchangePreference(Base):
    """A category an asset owner is willing to accept in exchange.

    ``cash_accepted`` flags whether the owner will take cash to balance value
    (e.g. "Vehicle + Cash"). ``notes`` stores free-form preferences.
    """

    __tablename__ = "exchange_preferences"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_id: Mapped[int] = mapped_column(
        ForeignKey("assets.id", ondelete="CASCADE"), index=True, nullable=False
    )
    # Desired category slug (e.g. real-estate|land-agro|livestock|
    # auto-equipment|mining-metals|business-industry).
    category_slug: Mapped[str] = mapped_column(String(50), nullable=False)
    cash_accepted: Mapped[bool] = mapped_column(default=False, nullable=False)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)

    asset: Mapped["Asset"] = relationship(back_populates="preferences")
