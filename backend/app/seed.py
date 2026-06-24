"""Seed the database with the six MVP categories and sample data.

Run from the backend/ directory with the virtualenv active:

    python -m app.seed

Idempotent for categories (won't duplicate). Sample users/assets are only
created when the assets table is empty.
"""

from __future__ import annotations

from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from .core.security import hash_password
from .db.base import Base
from .db.session import SessionLocal, engine
from .models import Asset, AssetImage, Category, ExchangePreference, User
from .services.matching import recompute_matches

CATEGORIES = [
    {"slug": "real-estate", "name": "Real Estate", "icon": "Building2"},
    {"slug": "land-agro", "name": "Land & Agro", "icon": "Sprout"},
    {"slug": "livestock", "name": "Livestock", "icon": "Beef"},
    {"slug": "auto-equipment", "name": "Auto & Equipment", "icon": "Car"},
    {"slug": "mining-metals", "name": "Mining & Metals", "icon": "Pickaxe"},
    {"slug": "business-industry", "name": "Business & Industry", "icon": "Factory"},
]

# Maps deprecated category slugs to their replacement in the new taxonomy.
# Used to migrate any existing prod data (assets / preferences) off the old
# categories before the old category rows are deleted.
LEGACY_CATEGORY_MAP = {
    "apartments": "real-estate",
    "houses": "real-estate",
    "land": "land-agro",
    "vehicles": "auto-equipment",
    "commercial": "business-industry",
}


def _ensure_categories(db: Session) -> dict[str, Category]:
    by_slug: dict[str, Category] = {}
    for data in CATEGORIES:
        existing = db.execute(
            select(Category).where(Category.slug == data["slug"])
        ).scalar_one_or_none()
        if existing is None:
            existing = Category(**data)
            db.add(existing)
        else:
            # Keep name/icon in sync with the canonical definition.
            existing.name = data["name"]
            existing.icon = data["icon"]
        by_slug[data["slug"]] = existing
    db.commit()
    cats = {slug: db.merge(c) for slug, c in by_slug.items()}
    _prune_legacy_categories(db, cats)
    return cats


def _prune_legacy_categories(db: Session, cats: dict[str, Category]) -> None:
    """Remove categories that are no longer part of the taxonomy.

    Any asset or exchange preference still pointing at a deprecated slug is
    first remapped to its replacement (see ``LEGACY_CATEGORY_MAP``); slugs with
    no known replacement are removed only if nothing references them. Safe to
    run repeatedly — a no-op once the old categories are gone.
    """
    valid_slugs = {data["slug"] for data in CATEGORIES}
    stale = (
        db.execute(select(Category).where(Category.slug.not_in(valid_slugs)))
        .scalars()
        .all()
    )
    if not stale:
        return

    removed: list[str] = []
    for old in stale:
        new_slug = LEGACY_CATEGORY_MAP.get(old.slug)
        if new_slug and new_slug in cats:
            new_cat = cats[new_slug]
            # Reassign assets to the replacement category.
            db.execute(
                update(Asset)
                .where(Asset.category_id == old.id)
                .values(category_id=new_cat.id)
            )
            # Reassign exchange preferences that target the old slug.
            db.execute(
                update(ExchangePreference)
                .where(ExchangePreference.category_slug == old.slug)
                .values(category_slug=new_slug)
            )
        else:
            # No mapping: only safe to drop if nothing still references it.
            in_use = (
                db.execute(
                    select(Asset.id).where(Asset.category_id == old.id).limit(1)
                ).first()
                is not None
            )
            if in_use:
                continue
        db.execute(delete(Category).where(Category.id == old.id))
        removed.append(old.slug)

    if removed:
        db.commit()
        print(f"Pruned legacy categories: {', '.join(removed)}")


def _ensure_admin(db: Session) -> None:
    """Ensure a dedicated administrator account exists for the Approval Center.

    Login: admin@example.kz / password123
    """
    admin = db.execute(
        select(User).where(User.email == "admin@example.kz")
    ).scalar_one_or_none()
    if admin is None:
        db.add(
            User(
                full_name="Platform Admin",
                email="admin@example.kz",
                phone="+7 700 000 0000",
                hashed_password=hash_password("password123"),
                city="Astana",
                role="admin",
                verification_status="premium",
            )
        )
        db.commit()
    elif admin.role != "admin":
        admin.role = "admin"
        db.commit()


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
                verification_status="verified",
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
    livestock_img = "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800"
    mining_img = "https://images.unsplash.com/photo-1605557202138-097f4d9c33f7?w=800"
    industry_img = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800"

    assets = [
        Asset(
            owner=u1,
            category=cats["real-estate"],
            title="3-room apartment in Almaty center",
            description="Bright apartment near Abay metro, 90 sqm, renovated.",
            estimated_value=50_000_000,
            country="Kazakhstan",
            region="Almaty",
            city="Almaty",
            liquidity_score=85,
            images=[AssetImage(url=img, position=0)],
            preferences=[
                ExchangePreference(category_slug="land-agro"),
                ExchangePreference(category_slug="auto-equipment", cash_accepted=True),
            ],
        ),
        Asset(
            owner=u2,
            category=cats["land-agro"],
            title="Farmland 50 ha near Almaty",
            description="Irrigated agricultural land with road access, ready to cultivate.",
            estimated_value=30_000_000,
            country="Kazakhstan",
            region="Almaty",
            city="Almaty",
            liquidity_score=70,
            images=[AssetImage(url=land_img, position=0)],
            preferences=[ExchangePreference(category_slug="real-estate")],
        ),
        Asset(
            owner=u3,
            category=cats["auto-equipment"],
            title="2019 Toyota Camry",
            description="One owner, 60k km, full service history.",
            estimated_value=20_000_000,
            country="Kazakhstan",
            region="Almaty",
            city="Almaty",
            liquidity_score=88,
            images=[AssetImage(url=car_img, position=0)],
            preferences=[
                ExchangePreference(category_slug="real-estate", cash_accepted=True)
            ],
        ),
        Asset(
            owner=u2,
            category=cats["livestock"],
            title="Herd of 40 Hereford cattle",
            description="Healthy breeding herd, vaccinated, documented pedigree.",
            estimated_value=18_000_000,
            country="Kazakhstan",
            region="Almaty",
            city="Talgar",
            liquidity_score=60,
            images=[AssetImage(url=livestock_img, position=0)],
            preferences=[
                ExchangePreference(category_slug="land-agro"),
                ExchangePreference(category_slug="auto-equipment"),
            ],
        ),
        Asset(
            owner=u1,
            category=cats["mining-metals"],
            title="Stake in a sand & gravel quarry",
            description="Operating quarry license with extraction equipment included.",
            estimated_value=120_000_000,
            country="Kazakhstan",
            region="Almaty",
            city="Almaty",
            liquidity_score=55,
            images=[AssetImage(url=mining_img, position=0)],
            preferences=[ExchangePreference(category_slug="business-industry")],
        ),
        Asset(
            owner=u3,
            category=cats["business-industry"],
            title="Small food-processing plant",
            description="Turnkey workshop with equipment and existing client base.",
            estimated_value=72_000_000,
            country="Kazakhstan",
            region="Almaty",
            city="Almaty",
            liquidity_score=65,
            images=[AssetImage(url=industry_img, position=0)],
            preferences=[ExchangePreference(category_slug="real-estate")],
        ),
    ]
    db.add_all(assets)
    db.commit()


def main() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        cats = _ensure_categories(db)
        _ensure_admin(db)
        users = _ensure_users(db)
        _seed_assets(db, cats, users)
        count = recompute_matches(db)
    print(f"Seed complete. Computed {count} AI matches.")


if __name__ == "__main__":
    main()
