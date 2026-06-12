"""Seed the database with the five MVP categories and sample data.

Run from the backend/ directory with the virtualenv active:

    python -m app.seed

Idempotent for categories (won't duplicate). Sample users/assets are only
created when the assets table is empty.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from .core.security import hash_password
from .db.base import Base
from .db.session import SessionLocal, engine
from .models import Asset, AssetImage, Category, ExchangePreference, User
from .services.matching import recompute_matches

CATEGORIES = [
    {"slug": "apartments", "name": "Apartments", "icon": "Building2"},
    {"slug": "houses", "name": "Houses", "icon": "Home"},
    {"slug": "land", "name": "Land Plots", "icon": "Map"},
    {"slug": "vehicles", "name": "Vehicles", "icon": "Car"},
    {"slug": "commercial", "name": "Commercial Properties", "icon": "Store"},
]


def _ensure_categories(db: Session) -> dict[str, Category]:
    by_slug: dict[str, Category] = {}
    for data in CATEGORIES:
        existing = db.execute(
            select(Category).where(Category.slug == data["slug"])
        ).scalar_one_or_none()
        if existing is None:
            existing = Category(**data)
            db.add(existing)
        by_slug[data["slug"]] = existing
    db.commit()
    return {slug: db.merge(c) for slug, c in by_slug.items()}


def _ensure_users(db: Session) -> list[User]:
    sample = [
        ("Aliya Nurlanovna", "aliya@example.kz", "+7 701 111 2233"),
        ("Daniyar Serik", "daniyar@example.kz", "+7 702 333 4455"),
        ("Madina Yerlan", "madina@example.kz", "+7 705 555 6677"),
    ]
    users: list[User] = []
    for full_name, email, phone in sample:
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if user is None:
            user = User(
                full_name=full_name,
                email=email,
                phone=phone,
                hashed_password=hash_password("password123"),
                city="Almaty",
            )
            db.add(user)
        users.append(user)
    db.commit()
    return [db.merge(u) for u in users]


def _seed_assets(db: Session, cats: dict[str, Category], users: list[User]) -> None:
    has_assets = db.execute(select(Asset.id).limit(1)).first() is not None
    if has_assets:
        return

    u1, u2, u3 = users
    img = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    land_img = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"
    car_img = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800"

    assets = [
        Asset(
            owner=u1,
            category=cats["apartments"],
            title="3-room apartment in Almaty center",
            description="Bright apartment near Abay metro, 90 sqm, renovated.",
            estimated_value=50_000_000,
            country="Kazakhstan",
            region="Almaty",
            city="Almaty",
            liquidity_score=85,
            images=[AssetImage(url=img, position=0)],
            preferences=[
                ExchangePreference(category_slug="land"),
                ExchangePreference(category_slug="vehicles", cash_accepted=True),
            ],
        ),
        Asset(
            owner=u2,
            category=cats["land"],
            title="Land plot 12 sotok near Almaty",
            description="Flat plot with utilities at the boundary, good for a house.",
            estimated_value=30_000_000,
            country="Kazakhstan",
            region="Almaty",
            city="Almaty",
            liquidity_score=70,
            images=[AssetImage(url=land_img, position=0)],
            preferences=[ExchangePreference(category_slug="apartments")],
        ),
        Asset(
            owner=u3,
            category=cats["vehicles"],
            title="2019 Toyota Camry",
            description="One owner, 60k km, full service history.",
            estimated_value=20_000_000,
            country="Kazakhstan",
            region="Almaty",
            city="Almaty",
            liquidity_score=88,
            images=[AssetImage(url=car_img, position=0)],
            preferences=[
                ExchangePreference(category_slug="apartments", cash_accepted=True)
            ],
        ),
        Asset(
            owner=u2,
            category=cats["houses"],
            title="Cottage in Talgar",
            description="2-storey house, 200 sqm, 8 sotok garden.",
            estimated_value=70_000_000,
            country="Kazakhstan",
            region="Almaty",
            city="Talgar",
            liquidity_score=60,
            images=[AssetImage(url=img, position=0)],
            preferences=[
                ExchangePreference(category_slug="commercial"),
                ExchangePreference(category_slug="apartments"),
            ],
        ),
        Asset(
            owner=u1,
            category=cats["commercial"],
            title="Retail space on Dostyk Ave",
            description="120 sqm street-level retail, high foot traffic.",
            estimated_value=72_000_000,
            country="Kazakhstan",
            region="Almaty",
            city="Almaty",
            liquidity_score=65,
            images=[AssetImage(url=img, position=0)],
            preferences=[ExchangePreference(category_slug="houses")],
        ),
    ]
    db.add_all(assets)
    db.commit()


def main() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        cats = _ensure_categories(db)
        users = _ensure_users(db)
        _seed_assets(db, cats, users)
        count = recompute_matches(db)
    print(f"Seed complete. Computed {count} AI matches.")


if __name__ == "__main__":
    main()
