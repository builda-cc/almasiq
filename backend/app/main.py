import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import (
    assets,
    auth,
    categories,
    dashboard,
    exchanges,
    favorites,
    matches,
)
from .config import settings
from .db.base import Base
from .db.session import engine

# Import models so they are registered on Base.metadata before create_all.
from . import models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (for local/SQLite dev; use Alembic in prod).
    Base.metadata.create_all(bind=engine)

    # Optionally seed categories + sample data so a freshly-provisioned
    # production database is immediately usable. Idempotent: categories are
    # never duplicated and sample assets are only added when the table is empty.
    if settings.seed_on_startup:
        try:
            from .seed import main as seed_main

            seed_main()
        except Exception as exc:  # noqa: BLE001 - never block startup on seeding
            logging.getLogger("uvicorn.error").warning(
                "Startup seeding skipped: %s", exc
            )

    yield


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    """Health check used to verify the backend is reachable."""
    return {"status": "ok", "service": settings.app_name}


app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(assets.router)
app.include_router(matches.router)
app.include_router(exchanges.router)
app.include_router(favorites.router)
app.include_router(dashboard.router)
