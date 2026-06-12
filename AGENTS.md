# AGENTS.md

Guidance for agentic coding agents working in this repository.

## Project Overview

QG Exchange is an AI-powered asset-exchange marketplace (MVP Phase 1) for
Kazakhstan / Central Asia. Users list assets across five categories
(apartments, houses, land, vehicles, commercial) and exchange them directly,
guided by an AI matching engine that scores every asset pair.

Stack: React + Vite + TypeScript + Tailwind frontend under `frontend/`, FastAPI
+ SQLAlchemy backend under `backend/` (SQLite for local dev, PostgreSQL-ready).
The frontend uses **React Router** for routing, **TanStack Query** for server
state, **Zustand** for client/auth state, **Axios** (`frontend/src/utils/api.ts`)
for HTTP, and **React Hook Form** for forms. All data flows through the backend
API (proxied at `/api` in dev — see `frontend/vite.config.ts`); there is no
mock data. Auth is JWT-based (token stored in `localStorage`).

## Build / Lint / Test Commands

Frontend (Vite + React + TypeScript; run from `frontend/`):

- Install: `npm install`
- Dev server: `npm run dev` (Vite on port 5173, proxies `/api` → :8000)
- Build: `npm run build` (runs `tsc --noEmit` typecheck + `vite build`)
- Preview build: `npm run preview`
- Typecheck only: `npm run typecheck` (or `npx tsc --noEmit`)
- Lint: `npm run lint` (ESLint, `--max-warnings 0`)
- Lint a single file: `npx eslint src/components/layout/Header.tsx`

> NOTE: There is no test runner configured yet (no Vitest/Jest, no test files).
> When adding tests, prefer Vitest. Expected single-test commands once set up:
> `npx vitest run src/utils/helpers.test.ts`, by name `npx vitest run -t "name"`,
> watch `npx vitest src/utils/helpers.test.ts`. Update this file when added.

Backend (FastAPI; run from `backend/`):

- Setup: `python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt`
- Seed DB (creates tables + sample data + AI matches): `python -m app.seed`
- Dev server: `uvicorn app.main:app --reload` (serves on :8000)
- A `.ruff_cache/` exists, so lint Python with `ruff check .` / `ruff format .`.
- No pytest config exists yet; prefer pytest, single test `pytest path::test_name`.
- Sample login after seeding: `aliya@example.kz` / `password123`.

## Directory Structure

Frontend paths below are relative to `frontend/`.

- `src/main.tsx` — Vite entry; wraps `App` in `QueryClientProvider` + `BrowserRouter`.
- `src/App.tsx` — declares all routes (React Router) and runs auth `initialize()`.
- `src/pages/` — route components (Home, AssetListing, AssetDetails, AddAsset,
  AIMatches, Dashboard, MyAssets, ExchangeRequests, Favorites, Profile, HowItWorks).
- `src/components/<domain>/` — components grouped by domain (`layout/`, `auth/`,
  `assets/`, `matches/`, `ui/`).
- `src/hooks/queries.ts` — all TanStack Query hooks (the data layer).
- `src/store/` — Zustand stores (`authStore`, `uiStore`).
- `src/types/index.ts` — shared TS interfaces mirroring backend response shapes
  (snake_case preserved).
- `src/utils/api.ts` — Axios instance with JWT interceptor + token helpers.
- `src/utils/helpers.ts` — pure formatting/utility functions (KZT, dates, scores).

Backend (`backend/app/`), domain-driven:

- `main.py` — FastAPI app, CORS, router includes, `create_all` on startup.
- `config.py` — pydantic-settings `Settings` (DB URL, JWT, CORS, OpenAI).
- `core/security.py` — password hashing (passlib) + JWT (python-jose).
- `db/base.py` / `db/session.py` — declarative `Base`, engine, `get_db` dep.
- `models/` — SQLAlchemy models (User, Category, Asset, AssetImage,
  ExchangePreference, ExchangeRequest, Favorite, AIMatch, AIValuation, Notification).
- `schemas/` — Pydantic request/response models.
- `services/matching.py` — rule-based AI Match engine (weighted formula).
- `api/` — routers: `auth`, `categories`, `assets`, `matches`, `exchanges`,
  `favorites`, `dashboard`; `deps.py` holds the auth dependencies.
- `seed.py` — seeds categories, sample users/assets, recomputes matches.

## Code Style Guidelines

### Imports
- Use ESM `import`/`export` only.
- Use `import type { Foo }` for type-only imports (see Header.tsx, queries.ts).
- Order: React/external libs first, then local modules; use relative paths
  (`./`, `../../`). No path aliases are configured.
- Import icons individually from `lucide-react`
  (e.g. `import { Menu, X } from 'lucide-react'`).

### Formatting
- 2-space indentation; semicolons required.
- Single quotes for strings/imports; use template literals for interpolation
  and for conditional Tailwind class strings.
- Keep JSX attributes multi-line when more than ~2 props.

### Types
- TypeScript everywhere; `.tsx` for components, `.ts` for logic/types.
- Define shared domain types in `src/types/index.ts` as `interface`.
- Use string-literal union types for enums/variants
  (e.g. `'login' | 'register'`, `status: 'pending' | 'accepted' | ...`).
- Annotate function return types on utilities (`: string`, etc.).
- Type component props with a dedicated `interface <Name>Props`.
- Mark optional fields with `?`; avoid `any`.

### Naming Conventions
- Components: PascalCase, named exports (`export function Header(...)`).
  `App.tsx` is the only default export.
- Files: PascalCase for components (`Header.tsx`), camelCase for utils
  (`helpers.ts`, `queries.ts`).
- Functions/variables: camelCase. Event handlers prefixed with `handle`
  (`handleNavigate`); prop callbacks prefixed with `on` (`onNavigate`).
- Interfaces: PascalCase, no `I` prefix.
- Boolean state: `is`/`has` prefix (`isAuthenticated`, `isFavorite`).

### Components & State
- Functional components only, with hooks.
- Co-locate the props `interface` directly above the component.
- Server state lives in TanStack Query hooks (`src/hooks/queries.ts`); global
  client state (auth, UI modals) lives in Zustand stores (`src/store/`). Do not
  re-introduce prop-drilling of global state.
- Early-return for conditional rendering (`if (!isOpen) return null;`).
- Keep components presentational; put formatting logic in `src/utils/helpers.ts`.

### Styling
- Tailwind CSS utility classes inline via `className`.
- Build conditional classes with template literals (see Header.tsx nav items).
- Primary accent color is `emerald` (e.g. `bg-emerald-600`); neutrals use
  `slate`. Reuse these palettes for consistency.

### Error Handling
- Use React Hook Form for forms; it calls `preventDefault` for you via
  `handleSubmit`. Validate with the `register` options (`required`, `minLength`).
- Route all HTTP through the Axios instance in `src/utils/api.ts` (it injects
  the JWT and clears it on 401). Prefer the typed hooks in `src/hooks/queries.ts`
  over calling `api` directly in components.
- Surface API errors from `error.response.data.detail` (see AuthModal).
- Avoid throwing in render; prefer guarded early returns and sane defaults
  (see the `default` case in `getStatusColor`).
- Backend: type FastAPI handlers' return values; raise `HTTPException` with a
  clear `detail`; read config via the `settings` singleton, never `os.environ`.

## Conventions for Agents
- Match the existing style exactly. The stack is fixed (React Router, TanStack
  Query, Zustand, Axios, React Hook Form); don't swap these out without being asked.
- Keep new shared types in `src/types/index.ts`; mirror backend response shapes
  (snake_case). Backend Pydantic schemas use `from_attributes=True`.
- After changing assets/preferences, the match table is stale — call
  `POST /api/matches/recompute` (exposed via the "Recompute" button) to refresh.
- Do not create files unless necessary; prefer editing existing ones.
- There are no Cursor (`.cursor/rules/`, `.cursorrules`) or Copilot
  (`.github/copilot-instructions.md`) rule files in this repo.

Summary
Run these in two separate terminals:
Terminal 1 — Backend (from backend/):
.venv\Scripts\activate
uvicorn app.main:app --reload
.venv already exists, so no need to reinstall. Serves on http://localhost:8000.
Terminal 2 — Frontend (from frontend/):
npm run dev
Serves on http://localhost:5173 (open this in your browser).
Verify it's wired up: visit http://localhost:8000/api/health — you should get {"status":"ok",...}. The frontend reaches the backend via Vite's /api proxy.
 .venv\Scripts\python.exe -m uvicorn app.main:app --reload