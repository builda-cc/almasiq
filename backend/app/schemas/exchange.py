from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from .asset import AssetOut
from .user import UserPublic


class ExchangeRequestCreate(BaseModel):
    offered_asset_id: int
    requested_asset_id: int
    message: str = ""


class ExchangeStatusUpdate(BaseModel):
    # accepted | rejected | negotiation | completed
    status: str = Field(pattern="^(accepted|rejected|negotiation|completed)$")


class ExchangeRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message: str
    status: str
    created_at: datetime

    from_user: UserPublic
    to_user: UserPublic
    offered_asset: AssetOut
    requested_asset: AssetOut


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
