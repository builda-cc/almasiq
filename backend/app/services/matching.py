"""AI Matching Engine (rule-based).

Implements the weighted Match Score from the product spec:

    Match Score = (Value   x 0.40)
                + (Pref    x 0.25)
                + (Location x 0.15)
                + (Liquidity x 0.20)

Each component is a 0-100 score. The engine compares every pair of active
assets owned by *different* users and persists matches above a threshold.

This module has no external dependencies (no OpenAI required) so it runs
deterministically in local dev. An OpenAI hook can later enrich
``explanation`` / preference semantics.
"""

from __future__ import annotations

from dataclasses import dataclass
from itertools import combinations

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from ..models import AIMatch, Asset, ExchangePreference

# Component weights (must sum to 1.0).
WEIGHT_VALUE = 0.40
WEIGHT_PREFERENCE = 0.25
WEIGHT_LOCATION = 0.15
WEIGHT_LIQUIDITY = 0.20

# Only persist matches at or above this overall score.
MATCH_THRESHOLD = 50.0


@dataclass
class ScoreBreakdown:
    value: float
    preference: float
    location: float
    liquidity: float
    overall: float
    value_difference: float


def _value_score(value_a: float, value_b: float) -> float:
    """100 when values are equal, decaying as the gap widens.

    Uses relative difference against the larger value so it is scale-free.
    """
    if value_a <= 0 and value_b <= 0:
        return 0.0
    larger = max(value_a, value_b)
    if larger <= 0:
        return 0.0
    diff_ratio = abs(value_a - value_b) / larger
    return round(max(0.0, (1.0 - diff_ratio)) * 100.0, 2)


def _preference_score(
    prefs_a: list[ExchangePreference],
    category_b: str,
    prefs_b: list[ExchangePreference],
    category_a: str,
) -> float:
    """Reward mutual preference satisfaction.

    Full credit (100) when both owners listed the other's category; half
    credit (50) when only one side does; small base (20) when neither side
    expressed preferences yet (so brand-new listings can still match).
    """
    a_wants_b = any(p.category_slug == category_b for p in prefs_a)
    b_wants_a = any(p.category_slug == category_a for p in prefs_b)

    if not prefs_a and not prefs_b:
        return 20.0
    if a_wants_b and b_wants_a:
        return 100.0
    if a_wants_b or b_wants_a:
        return 55.0
    return 10.0


def _location_score(asset_a: Asset, asset_b: Asset) -> float:
    """Geographic compatibility based on city/region/country overlap."""
    if asset_a.city and asset_b.city and asset_a.city == asset_b.city:
        return 100.0
    if asset_a.region and asset_b.region and asset_a.region == asset_b.region:
        return 75.0
    if asset_a.country and asset_b.country and asset_a.country == asset_b.country:
        return 50.0
    return 25.0


def _liquidity_score(asset_a: Asset, asset_b: Asset) -> float:
    """Average of the two assets' liquidity scores (0-100)."""
    return round((asset_a.liquidity_score + asset_b.liquidity_score) / 2.0, 2)


def score_pair(asset_a: Asset, asset_b: Asset) -> ScoreBreakdown:
    value = _value_score(asset_a.estimated_value, asset_b.estimated_value)
    preference = _preference_score(
        asset_a.preferences,
        asset_b.category.slug,
        asset_b.preferences,
        asset_a.category.slug,
    )
    location = _location_score(asset_a, asset_b)
    liquidity = _liquidity_score(asset_a, asset_b)

    overall = (
        value * WEIGHT_VALUE
        + preference * WEIGHT_PREFERENCE
        + location * WEIGHT_LOCATION
        + liquidity * WEIGHT_LIQUIDITY
    )
    return ScoreBreakdown(
        value=value,
        preference=preference,
        location=location,
        liquidity=liquidity,
        overall=round(overall, 2),
        value_difference=round(
            abs(asset_a.estimated_value - asset_b.estimated_value), 2
        ),
    )


def _explain(asset_a: Asset, asset_b: Asset, breakdown: ScoreBreakdown) -> str:
    return (
        f"{asset_a.category.name} ({int(asset_a.estimated_value):,} KZT) "
        f"<-> {asset_b.category.name} ({int(asset_b.estimated_value):,} KZT). "
        f"Value {breakdown.value:.0f}, preference {breakdown.preference:.0f}, "
        f"location {breakdown.location:.0f}, liquidity {breakdown.liquidity:.0f}."
    )


def recompute_matches(db: Session) -> int:
    """Recompute all asset-pair matches. Returns number of matches stored.

    Simple O(n^2) scan suitable for the MVP. For scale this becomes a
    background job backed by vector search / blocking keys.
    """
    assets = (
        db.execute(
            select(Asset)
            .where(Asset.status == "active")
            .options(
                selectinload(Asset.preferences),
                selectinload(Asset.category),
                selectinload(Asset.owner),
                selectinload(Asset.images),
            )
        )
        .scalars()
        .all()
    )

    # Clear existing matches and rebuild.
    db.execute(delete(AIMatch))

    stored = 0
    for asset_a, asset_b in combinations(assets, 2):
        if asset_a.owner_id == asset_b.owner_id:
            continue
        breakdown = score_pair(asset_a, asset_b)
        if breakdown.overall < MATCH_THRESHOLD:
            continue

        # Keep a stable ordering for the unique pair constraint.
        first, second = sorted((asset_a, asset_b), key=lambda a: a.id)
        db.add(
            AIMatch(
                asset_a_id=first.id,
                asset_b_id=second.id,
                match_score=breakdown.overall,
                value_score=breakdown.value,
                preference_score=breakdown.preference,
                location_score=breakdown.location,
                liquidity_score=breakdown.liquidity,
                value_difference=breakdown.value_difference,
                match_type="1to1",
                explanation=_explain(first, second, breakdown),
            )
        )
        stored += 1

    db.commit()
    return stored
