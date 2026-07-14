"""SQLAlchemy ORM models for QG Exchange.

Importing this package registers every model on ``Base.metadata`` so that
``create_all`` / Alembic can see them.
"""

from .ai_match import AIMatch
from .ai_valuation import AIValuation
from .asset import Asset, AssetImage, AssetVideo, ExchangePreference
from .attachment import AssetAttachment
from .category import Category
from .exchange import (
    ContactUnlock,
    ExchangeMessage,
    ExchangeRequest,
    ViolationLog,
)
from .favorite import Favorite
from .notification import Notification
from .user import User

__all__ = [
    "AIMatch",
    "AIValuation",
    "Asset",
    "AssetAttachment",
    "AssetImage",
    "AssetVideo",
    "ExchangePreference",
    "Category",
    "ContactUnlock",
    "ExchangeMessage",
    "ExchangeRequest",
    "ViolationLog",
    "Favorite",
    "Notification",
    "User",
]
