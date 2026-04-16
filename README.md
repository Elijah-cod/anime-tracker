# Anime Tracker

Anime Tracker is a full-stack anime progress tracker built around a Next.js frontend and a FastAPI backend. The stack follows the architecture in the provided project brief:

- Frontend: Next.js + Tailwind CSS, ready for Vercel
- Backend: FastAPI, ready for Render or Railway
- Database: PostgreSQL via Neon or Supabase
- ORM: SQLAlchemy + Alembic
- External data: AniList GraphQL, with MAL import support through Jikan

## Repository Layout

```text
.
├── backend
│   ├── alembic
│   ├── app
│   ├── pyproject.toml
│   └── tests
├── frontend
│   ├── app
│   ├── components
│   ├── lib
│   ├── public
│   └── package.json
└── README.md
```

## Product Features

- AniList-powered discovery and trending anime data
- User-owned anime library with watch status, scores, and review support
- Optimistic episode progress updates on the dashboard
- Release calendar formatted to the browser's local time
- Dark mode with `next-themes`
- MAL import flow through the FastAPI backend
- Cached trending anime responses to reduce upstream API calls

## Branching Strategy

This repo follows the "Agile Stream" branching model from the brief:

- `main`: production-ready, stable code only
- `develop`: integration branch for completed features
- `feature/*`: temporary feature branches, created from `develop`
- `fix/*`: temporary bug-fix branches, created from `develop`

Current implementation branch:

- `feature/anime-tracker-foundation`

## Local Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload
```

## Environment Variables

### Frontend

Copy `frontend/.env.example` to `frontend/.env.local`.

Required:

- `NEXT_PUBLIC_API_URL`: backend base URL including `/api/v1`

### Backend

Copy `backend/.env.example` to `backend/.env`.

Required:

- `DATABASE_URL`
- `ALLOW_ORIGINS`

Useful:

- `SEED_DEMO_DATA=true` for local demo content
- `SEED_DEMO_DATA=false` for production

## Deploy Targets

- Frontend: Vercel
- Backend: Render or Railway
- Database: Neon or Supabase PostgreSQL

## Deployment

### Preflight

Run this from the repo root before deploying:

```bash
npm run deploy:check
```

### Vercel

Create a Vercel project with the `frontend` directory as the root.

Set:

- `NEXT_PUBLIC_API_URL=https://your-backend-domain.example.com/api/v1`

Recommended settings:

- Framework preset: Next.js
- Root directory: `frontend`
- Install command: `npm install`
- Build command: `npm run build`

### Render

This repo now includes [render.yaml](/Users/elijah/Documents/Projects/anime-tracker/render.yaml:1) for the backend.

If you use the blueprint:

- service root: `backend`
- build command: `pip install -e .`
- start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- health check: `/api/v1/health`

Set these environment variables in Render:

- `DATABASE_URL`
- `ALLOW_ORIGINS=https://your-vercel-domain.vercel.app`
- `APP_ENV=production`
- `SEED_DEMO_DATA=false`

### Railway

Railway can use the root [Procfile](/Users/elijah/Documents/Projects/anime-tracker/Procfile:1) or the same command manually:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT --app-dir backend
```

Use the same backend environment variables as Render.

### Release Order

1. Provision PostgreSQL in Neon or Supabase.
2. Deploy the backend and set `DATABASE_URL`.
3. Copy the backend URL into the frontend `NEXT_PUBLIC_API_URL`.
4. Update backend `ALLOW_ORIGINS` to the final frontend domain.
5. Redeploy the frontend if the API URL changed.

### Production Notes

- The backend still creates tables on startup for this MVP, so the first boot requires a valid database connection.
- Demo seeding is now controlled by `SEED_DEMO_DATA` and should stay `false` in production.
- Backend health endpoint: `/api/v1/health`

## Notes

- The backend includes a clear AniList wrapper service so the frontend does not need to own GraphQL complexity.
- The database schema is designed around user-specific interactions, even though anime metadata comes from AniList.
- Auth and analytics are prepared as future-proof integration points for Clerk or NextAuth.js and Vercel Analytics.
