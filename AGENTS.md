# AGENTS.md

Guidance for agentic coding agents working in this repository.

## Project Overview

QG Exchange is an AI-powered asset-exchange marketplace (MVP Phase 1) for
Kazakhstan / Central Asia. Users list assets across six categories and exchange
them directly, guided by an AI matching engine that scores every asset pair.

Stack: React + Vite + TypeScript + Tailwind frontend under `frontend/`, FastAPI
+ SQLAlchemy backend under `backend/` (SQLite for local dev, PostgreSQL-ready).
The frontend uses **React Router** for routing, **TanStack Query** for server
state, **Zustand** for client/auth state, **Axios** (`frontend/src/utils/api.ts`)
for HTTP, **React Hook Form** for forms, and **i18next** with **react-i18next**
for internationalization (en/kk/ru/zh). All data flows through the backend API
(proxied at `/api` in dev — see `frontend/vite.config.ts`); there is no mock
data. Auth is JWT-based (token stored in `localStorage` under key `qg_token`).

## Build / Lint / Test Commands

Frontend (Vite + React + TypeScript; run from `frontend/`):

- Install: `npm install`
- Dev server: `npm run dev` (Vite on port 5173, proxies `/api` → :8000)
- Build: `npm run build` (runs `tsc --noEmit` typecheck + `vite build`)
- Preview build: `npm run preview`
- Typecheck only: `npm run typecheck` (or `npx tsc --noEmit`)
- Lint: `npm run lint` (ESLint, `--max-warnings 0`)
- Lint a single file: `npx eslint src/components/layout/Header.tsx`

> NOTE: No test runner is configured yet. When adding tests, prefer Vitest.
> Expected single-test commands once set up:
> `npx vitest run src/utils/helpers.test.ts`,
> by name `npx vitest run -t "test name"`,
> watch mode `npx vitest src/utils/helpers.test.ts`. Update this file when added.

Backend (FastAPI; run from `backend/`):

- Setup: `python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt`
- Seed DB (creates tables + sample data + AI matches): `python -m app.seed`
- Dev server: `uvicorn app.main:app --reload` (serves on :8000)
- Lint: `ruff check .` / `ruff format .`
- No pytest config exists yet; prefer pytest, single test `pytest tests/test_file.py::test_name`.
- Sample login after seeding: `aliya@example.kz` / `password123`.

## Directory Structure

Frontend paths below are relative to `frontend/`.

- `src/main.tsx` — Vite entry; wraps `App` in `QueryClientProvider` + `BrowserRouter`.
  QueryClient default: `retry: 1`, `refetchOnWindowFocus: false`, `staleTime: 30_000`.
- `src/App.tsx` — declares all routes (React Router) and runs auth `initialize()`.
  Only file in the project with a **default export**.
- `src/pages/` — route components (Home, AssetListing, AssetDetails, AddAsset,
  AIMatches, Dashboard, MyAssets, ExchangeRequests, Favorites, Profile, HowItWorks).
- `src/components/<domain>/` — components grouped by domain (`layout/`, `auth/`,
  `assets/`, `matches/`, `ui/`).
- `src/hooks/queries.ts` — all TanStack Query hooks (the data layer).
- `src/store/` — Zustand stores (`authStore`, `uiStore`).
- `src/types/index.ts` — shared TS interfaces mirroring backend response shapes
  (snake_case preserved). Six category slugs: `real-estate`, `land-agro`,
  `livestock`, `auto-equipment`, `mining-metals`, `business-industry`.
- `src/utils/api.ts` — Axios instance with JWT interceptor + token helpers.
- `src/utils/helpers.ts` — pure formatting/utility functions (KZT, dates, scores).
- `src/i18n/` — i18next config + locale JSON files (en, kk, ru, zh).

Backend (`backend/app/`), domain-driven:

- `main.py` — FastAPI app, CORS, router includes, lifespan (create_all + seed).
- `config.py` — pydantic-settings `Settings` (DB URL, JWT, CORS, OpenAI).
- `core/security.py` — password hashing (passlib) + JWT (python-jose).
- `db/base.py` / `db/session.py` — declarative `Base`, `TimestampMixin`, engine, `get_db` dep.
- `models/` — SQLAlchemy models with `Mapped` typing, `from __future__ import annotations`.
- `schemas/` — Pydantic v2 request/response models (`from_attributes=True`).
- `services/matching.py` — rule-based AI Match engine (weighted formula).
- `api/` — routers: `auth`, `categories`, `assets`, `matches`, `exchanges`,
  `favorites`, `dashboard`; `deps.py` holds auth deps (`get_current_user`,
  `get_optional_user`, `require_admin`).
- `seed.py` — seeds categories, sample users/assets, recomputes matches.

## Code Style Guidelines

### Imports
- Use ESM `import`/`export` only.
- Use `import type { Foo }` for type-only imports (see Header.tsx, queries.ts).
- Order: React/external libs first, then local modules; use relative paths
  (`./`, `../../`). No path aliases are configured.
- Import icons individually from `lucide-react`
  (e.g. `import { Menu, X } from 'lucide-react'`).
- Backend: `from __future__ import annotations` at top of every file.
  Use relative imports (e.g. `from ..config import settings`).
  Use `if TYPE_CHECKING` guards for circular model imports.

### Formatting
- 2-space indentation; semicolons required.
- Single quotes for strings/imports; use template literals for interpolation
  and for conditional Tailwind class strings.
- Keep JSX attributes multi-line when more than ~2 props.
- Backend: format with `ruff format .` (no Black/autopep8).
- Use `void` operator to explicitly mark floating promises: `void initialize();`.

### Types
- TypeScript everywhere; `.tsx` for components, `.ts` for logic/types.
- Define shared domain types in `src/types/index.ts` as `interface`.
- Use string-literal union types for enums/variants
  (e.g. `'login' | 'register'`, `status: 'pending' | 'accepted' | ...`).
- Annotate function return types on utilities (`: string`, etc.).
- Type component props with a dedicated `interface <Name>Props` (no `I` prefix).
- Mark optional fields with `?`; avoid `any`.
- Backend: type FastAPI handler return values; use `Mapped[...]` on model columns.

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
- Tailwind CSS via `className`. Use the custom color palette:
  - `gold` for brand/primary (gradients, CTAs, prices)
  - `beige` for surfaces, backgrounds, body text (beige-900 body, beige-600 headings)
  - `silver` for secondary/outline elements
  - `tertiary` for cool blue accents
  - `error` for destructive states
  - Legacy `emerald`/`slate` classes still work (remapped to gold/beige in tailwind.config.js).
- Custom font sizes available: `label-sm`, `label-md`, `body-md`, `body-lg`,
  `title-md`, `headline-md`, `headline-lg`, `headline-xl`, `display-lg`.
- Custom background gradients: `bg-gold-gradient`, `bg-gold-gradient-hover`.
- Build conditional classes with template literals.

### Error Handling
- Use React Hook Form for forms; it calls `preventDefault` for you via
  `handleSubmit`. Validate with the `register` options (`required`, `minLength`).
- Route all HTTP through the Axios instance in `src/utils/api.ts` (it injects
  the JWT and clears it on 401). Prefer the typed hooks in `src/hooks/queries.ts`
  over calling `api` directly in components.
- Surface API errors from `error.response?.data?.detail` (see AuthModal).
- Avoid throwing in render; prefer guarded early returns and sane defaults.
- Backend: raise `HTTPException` with a clear `detail` and proper status code;
  read config via the `settings` singleton, never `os.environ`.

## Conventions for Agents
- Match the existing style exactly. The stack is fixed (React Router, TanStack
  Query, Zustand, Axios, React Hook Form, i18next); don't swap these out.
- Keep new shared types in `src/types/index.ts`; mirror backend response shapes
  (snake_case). Backend Pydantic schemas use `from_attributes=True`.
- After changing assets/preferences, the match table is stale — call
  `POST /api/matches/recompute` (exposed via the "Recompute" button) to refresh.
- Do not create files unless necessary; prefer editing existing ones.
- There are no Cursor (`.cursor/rules/`, `.cursorrules`) or Copilot
  (`.github/copilot-instructions.md`) rule files in this repo.
