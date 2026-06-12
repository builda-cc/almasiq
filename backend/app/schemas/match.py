from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from .asset import AssetOut


class MatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    match_score: float
    value_score: float
    preference_score: float
    location_score: float
    liquidity_score: float
    value_difference: float
    match_type: str
    explanation: str | None = None

    asset_a: AssetOut
    asset_b: AssetOut
