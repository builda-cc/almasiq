from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base


class Category(Base):
    """One of the six MVP asset categories.

    ``slug`` is the canonical key used by the matching engine and frontend:
    real-estate | land-agro | livestock | auto-equipment | mining-metals |
    business-industry
    """

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
