# Deployment Guide

> **Important:** Railway and similar PaaS platforms have ephemeral filesystems.
> Files saved to `uploads/` are lost on every redeploy. For persistent uploads,
> use Docker deployment (Section 5) or cloud storage (S3, MinIO).

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
| `SEED_ON_STARTUP` | `true` for the first deploy (seeds the 6 categories + demo data), then set to `false`. Also set this back to `true` for one deploy after a category-taxonomy change — the seeder migrates assets off deprecated categories and prunes the old rows. |
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

---

## Docker deployment (persistent uploads)

For self-hosted deployments (VPS, EC2, DigitalOcean, etc.) where you need
persistent file storage, use Docker with a named volume for uploads.

### 5.1 Prerequisites

- Docker and Docker Compose installed
- A PostgreSQL database (can be a separate Docker service or external)

### 5.2 Environment setup

1. Copy `backend/.env.example` to `backend/.env` and fill in values:

```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

2. Set a strong `JWT_SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

### 5.3 Start with Docker Compose

```bash
# From project root
docker compose up -d --build
```

This starts:
- **Backend** on `http://localhost:8000`
- **Frontend** on `http://localhost:5173` (proxies `/api` to backend)

### 5.4 Persistent uploads volume

The `docker-compose.yml` creates a named volume `uploads_data` mounted at
`/app/uploads` in the backend container. This volume persists across:

- Container rebuilds (`docker compose up -d --build`)
- Container restarts (`docker compose restart`)
- Host machine reboots

**To verify the volume exists:**
```bash
docker volume ls | grep uploads
docker volume inspect qgastana_uploads_data
```

**To backup the volume:**
```bash
docker run --rm -v qgastana_uploads_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup.tar.gz -C /data .
```

**To restore from backup:**
```bash
docker run --rm -v qgastana_uploads_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/uploads-backup.tar.gz -C /data
```

### 5.5 Production considerations

- Set `SEED_ON_STARTUP=false` after initial seed
- Set `DEBUG=false`
- Use a strong `JWT_SECRET_KEY`
- Set `CORS_ORIGINS` to your actual domain
- Consider adding a reverse proxy (Caddy, Traefik) for HTTPS
- The volume stores files on the Docker host's filesystem; for multi-host
  deployments, use a distributed storage backend (S3, MinIO, etc.)
