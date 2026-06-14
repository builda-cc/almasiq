# Deployment Guide

This project deploys as two services:

- **Backend** (FastAPI) → **Railway** + a Railway Postgres database
- **Frontend** (React + Vite) → **Vercel**

The repo is a monorepo: backend lives in `backend/`, frontend in `frontend/`.
Deploy the backend first so you have its public URL for the frontend's
`VITE_API_BASE_URL`.

---

## 1. Backend → Railway

### 1.1 Create the service
1. In Railway, create a new project → **Deploy from GitHub repo** and pick this repo.
2. Set the service **Root Directory** to `backend`.
   (Railway → service → Settings → Root Directory.)
3. Railway auto-detects Python via Nixpacks and installs `requirements.txt`.
   The start command and health check are defined in `backend/railway.json`:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
   (A `backend/Procfile` provides the same command as a fallback.)

### 1.2 Add a Postgres database
1. In the same Railway project: **New → Database → Add PostgreSQL**.
2. Railway automatically injects a `DATABASE_URL` into your backend service.
   The app normalizes `postgres://` / `postgresql://` to the psycopg 3 driver
   automatically — no manual edit needed.

### 1.3 Environment variables
Set these on the backend service (Railway → Variables):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | (auto-provided by the Railway Postgres plugin) |
| `JWT_SECRET_KEY` | A long random string. Generate: `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `CORS_ORIGINS` | Your Vercel URL, e.g. `https://your-app.vercel.app` (no trailing slash). Add more comma-separated if needed. |
| `DEBUG` | `false` |
| `SEED_ON_STARTUP` | `true` for the first deploy (seeds the 5 categories + demo data), then set to `false`. |
| `OPENAI_API_KEY` | Optional. Leave empty to use the rule-based matcher. |

> `PORT` is provided by Railway automatically — do **not** set it yourself.

### 1.4 Verify
After deploy, open `https://<your-backend>.up.railway.app/api/health` — you
should get `{"status":"ok","service":"QG Exchange API"}`.

The first boot creates the tables and (if `SEED_ON_STARTUP=true`) seeds
categories, sample users, assets, and AI matches. Seeding is idempotent and
never blocks startup.

**Demo login after seeding:** `aliya@example.kz` / `password123`.

---

## 2. Frontend → Vercel

### 2.1 Create the project
1. In Vercel, **Add New → Project** and import this repo.
2. Set the **Root Directory** to `frontend`.
3. Framework preset: **Vite** (auto-detected). Build settings come from
   `frontend/vercel.json`:
   - Build command: `npm run build`
   - Output directory: `dist`
   - SPA rewrites: all routes fall back to `index.html` so React Router deep
     links work on refresh.

### 2.2 Environment variable
Set this on the Vercel project (Settings → Environment Variables, all
environments):

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://<your-backend>.up.railway.app/api` (note the trailing `/api`) |

> Vite inlines `VITE_*` vars at **build time**. After changing it, trigger a
> redeploy.

### 2.3 Verify
Open your Vercel URL. The app should load, list categories/assets from the
backend, and you should be able to log in with the demo account.

---

## 3. Wiring the two together (CORS)

The backend only accepts requests from origins listed in `CORS_ORIGINS`.
After the frontend is deployed:

1. Copy the Vercel production URL (e.g. `https://your-app.vercel.app`).
2. Set `CORS_ORIGINS` on Railway to that exact URL (no trailing slash).
3. If you use Vercel preview deployments and need them to call the API too,
   add their URLs comma-separated as well.
4. Redeploy the backend so the new CORS config takes effect.

---

## 4. Post-deploy checklist

- [ ] `GET /api/health` returns ok on the Railway URL.
- [ ] Frontend loads on Vercel and shows categories/assets.
- [ ] Login with `aliya@example.kz` / `password123` works (no CORS errors in
      the browser console).
- [ ] `JWT_SECRET_KEY` is a strong random value (not the default).
- [ ] `DEBUG=false` on the backend.
- [ ] `SEED_ON_STARTUP` set to `false` after the first successful seed (so the
      demo assets aren't re-evaluated on every restart).
- [ ] `CORS_ORIGINS` contains your real Vercel domain.

---

## Local development

Unchanged. From two terminals:

```bash
# backend/  (SQLite, no setup)
.venv\Scripts\activate
uvicorn app.main:app --reload

# frontend/  (proxies /api -> :8000)
npm run dev
```
