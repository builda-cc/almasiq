# QG Exchange — AI-Powered Asset Exchange Marketplace

QG Exchange lets users in Kazakhstan / Central Asia **exchange assets without
selling them first**. Owners list assets across five categories and an AI
matching engine scores every possible exchange so users can discover the best
opportunities.

This repository contains the **MVP (Phase 1)**: real authentication, asset
listings, the AI match engine, exchange proposals, and favorites — all running
locally with no external infrastructure required.

---

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Zustand, Axios, React Hook Form |
| Backend  | FastAPI, SQLAlchemy 2, Pydantic v2, python-jose (JWT), passlib (bcrypt) |
| Database | SQLite for local dev (PostgreSQL-ready via `DATABASE_URL`) |
| AI       | Rule-based weighted matching engine (OpenAI hook reserved for later) |

Phase 2/3 targets (Redis, Elasticsearch/OpenSearch, MinIO/S3, WebSockets,
OpenAI valuation, investor marketplace, admin panel) are intentionally out of
scope for this MVP but the schema and architecture leave room for them.

---

## Running locally

Two terminals.

**Backend** (from `backend/`):

```bash
python -m venv .venv          # first time only
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
python -m app.seed            # create tables + sample data + AI matches
uvicorn app.main:app --reload # http://localhost:8000
```

**Frontend** (from `frontend/`):

```bash
npm install                   # first time only
npm run dev                   # http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:8000`.

Sample login (after seeding): `aliya@example.kz` / `password123`.

---

## AI Matching Algorithm

Each asset pair (owned by different users) gets a **Match Score 0–100**:

```
Match Score = Value × 0.40 + Preference × 0.25 + Location × 0.15 + Liquidity × 0.20
```

| Component  | Weight | How it's scored |
|------------|--------|-----------------|
| Value      | 40%    | `100 × (1 − |a−b| / max(a,b))` — closer values score higher |
| Preference | 25%    | Mutual preference satisfaction (both want each other's category = 100) |
| Location   | 15%    | Same city = 100, same region = 75, same country = 50 |
| Liquidity  | 20%    | Average of the two assets' liquidity scores |

Implemented in `backend/app/services/matching.py`. Matches at or above a
threshold are persisted to the `ai_matches` table (with the component
breakdown) and can be rebuilt via `POST /api/matches/recompute`.

---

## API Specification

All routes are prefixed with `/api`. Authenticated routes require a
`Bearer <token>` header.

### Auth
| Method | Path             | Auth | Description |
|--------|------------------|------|-------------|
| POST   | `/auth/register` | —    | Register, returns JWT |
| POST   | `/auth/login`    | —    | Login, returns JWT |
| GET    | `/auth/me`       | ✓    | Current user |

### Categories
| Method | Path          | Auth | Description |
|--------|---------------|------|-------------|
| GET    | `/categories` | —    | Five categories + live asset counts |

### Assets
| Method | Path            | Auth | Description |
|--------|-----------------|------|-------------|
| GET    | `/assets`       | —    | List/search/filter/sort/paginate |
| GET    | `/assets/mine`  | ✓    | Current user's assets |
| GET    | `/assets/{id}`  | —    | Single asset (with owner, images, preferences) |
| POST   | `/assets`       | ✓    | Create asset (images + exchange preferences) |
| PATCH  | `/assets/{id}`  | ✓    | Update (owner only) |
| DELETE | `/assets/{id}`  | ✓    | Delete (owner only) |

`GET /assets` query params: `q`, `category`, `region`, `city`, `min_value`,
`max_value`, `sort` (`newest|oldest|highest|lowest`), `page`, `page_size`.

### Matches
| Method | Path                 | Auth | Description |
|--------|----------------------|------|-------------|
| GET    | `/matches`           | —    | All matches (`min_score`, `limit`) |
| GET    | `/matches/mine`      | ✓    | Matches involving the user's assets |
| POST   | `/matches/recompute` | —    | Rebuild the match table |

### Exchanges
| Method | Path              | Auth | Description |
|--------|-------------------|------|-------------|
| POST   | `/exchanges`      | ✓    | Create a proposal (offered ↔ requested) |
| GET    | `/exchanges`      | ✓    | List by `direction=incoming|outgoing` |
| PATCH  | `/exchanges/{id}` | ✓    | Update status (accept/reject/negotiate/complete) |

### Favorites & Dashboard
| Method | Path                  | Auth | Description |
|--------|-----------------------|------|-------------|
| GET    | `/favorites`          | ✓    | List favorites |
| POST   | `/favorites/{assetId}`| ✓    | Add favorite |
| DELETE | `/favorites/{assetId}`| ✓    | Remove favorite |
| GET    | `/dashboard/stats`    | ✓    | Totals for the dashboard cards |

---

## Database Schema (MVP entities)

- **users** — full_name, email (unique), phone, hashed_password, role, profile.
- **categories** — slug (`apartments|houses|land|vehicles|commercial`), name, icon.
- **assets** — owner_id, category_id, title, description, estimated_value (KZT),
  location (country/region/city/lat/lng), liquidity_score, status.
- **asset_images** — asset_id, url, position.
- **exchange_preferences** — asset_id, category_slug, cash_accepted, notes.
- **exchange_requests** — from/to user, offered/requested asset, message, status.
- **favorites** — user_id + asset_id (unique pair).
- **ai_matches** — asset pair, overall score + 4 component scores, value_difference,
  match_type, explanation.
- **ai_valuations** — reserved for Phase 2 valuation service (market value range,
  recommended value, liquidity).
- **notifications** — reserved for match/exchange/system notifications.

Tables are created on startup (`Base.metadata.create_all`) for local dev;
Alembic is included in requirements for production migrations.

---

## Implementation Plan / Roadmap

- **Phase 1 (this MVP)** — JWT auth, asset CRUD, rule-based AI matching, exchange
  proposals, favorites, dashboard. SQLite, no external services.
- **Phase 2** — AI Valuation service (OpenAI comparables + liquidity), real file
  uploads (MinIO/S3), Elasticsearch/OpenSearch for search, Redis caching,
  WebSocket messaging between users, PostgreSQL + Alembic migrations.
- **Phase 3** — Investor marketplace (investment opportunities matched to asset
  contributions), admin panel (moderation, analytics, KPIs), multi-country
  expansion and cross-border matching.

See `AGENTS.md` for contributor conventions and the exact file layout.
