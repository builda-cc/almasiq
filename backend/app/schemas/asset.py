from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from .user import UserPublic


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    icon: str | None = None
    image_url: str | None = None
    asset_count: int = 0


class AssetImageIn(BaseModel):
    url: str
    position: int = 0


class AssetImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    position: int


class ExchangePreferenceIn(BaseModel):
    category_slug: str
    cash_accepted: bool = False
    notes: str | None = None


class ExchangePreferenceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category_slug: str
    cash_accepted: bool
    notes: str | None = None


class AssetCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    category_slug: str
    description: str = ""
    estimated_value: float = Field(ge=0)
    country: str = "Kazakhstan"
    region: str | None = None
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    liquidity_score: int = Field(default=50, ge=0, le=100)
    images: list[AssetImageIn] = Field(default_factory=list, max_length=20)
    preferences: list[ExchangePreferenceIn] = Field(default_factory=list)


class AssetUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    estimated_value: float | None = Field(default=None, ge=0)
    region: str | None = None
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    liquidity_score: int | None = Field(default=None, ge=0, le=100)
    status: str | None = None
    images: list[AssetImageIn] | None = None
    preferences: list[ExchangePreferenceIn] | None = None


class AssetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    estimated_value: float
    country: str
    region: str | None = None
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    liquidity_score: int
    status: str
    created_at: datetime

    category: CategoryOut
    owner: UserPublic
    images: list[AssetImageOut] = Field(default_factory=list)
    preferences: list[ExchangePreferenceOut] = Field(default_factory=list)


class AssetListResponse(BaseModel):
    items: list[AssetOut]
    total: int
    page: int
    page_size: int
