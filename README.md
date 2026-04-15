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

### Backend

Copy `backend/.env.example` to `backend/.env`.

## Deploy Targets

- Frontend: Vercel
- Backend: Render or Railway
- Database: Neon or Supabase PostgreSQL

## Notes

- The backend includes a clear AniList wrapper service so the frontend does not need to own GraphQL complexity.
- The database schema is designed around user-specific interactions, even though anime metadata comes from AniList.
- Auth and analytics are prepared as future-proof integration points for Clerk or NextAuth.js and Vercel Analytics.
