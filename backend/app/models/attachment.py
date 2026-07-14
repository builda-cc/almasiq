from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.base import Base

if TYPE_CHECKING:
    from .asset import Asset


class AssetAttachment(Base):
    __tablename__ = "asset_attachments"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_id: Mapped[int] = mapped_column(
        ForeignKey("assets.id", ondelete="CASCADE"), index=True, nullable=False
    )
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(127), default="", nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    asset: Mapped["Asset"] = relationship(back_populates="attachments")
