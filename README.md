# Anime Tracker

Anime Tracker is a full-stack anime tracking application built for fast personal workflows: discover shows, add them to a queue, track episode progress, leave anime-specific comments, monitor release times, and manage user-scoped libraries from a clean dashboard.

The project follows the stack and product direction from the original brief:

- Frontend: Next.js + Tailwind CSS
- Backend: FastAPI
- Database: PostgreSQL
- ORM: SQLAlchemy + Alembic-ready structure
- External data: AniList GraphQL + Jikan for MAL imports
- Deployment targets: Vercel for the frontend, Render or Railway for the backend

## Overview

Anime Tracker is designed around two ideas:

1. Fast tracking interactions
   Increment episode progress with a single click, update statuses quickly, and keep queue management lightweight.

2. Clear user scoping
   Each active account has its own entries, comments, imports, and dashboard state, making the app practical for real personal tracking and demos.

## Current Feature Set

### Core Tracking

- Create and scope local user accounts
- Add anime as `WATCHING` or `PLANNING`
- One-click episode progress updates with optimistic UI
- Edit status and score from a dedicated library workspace
- Remove titles from the tracker

### Discovery and Metadata

- Search AniList titles from the dashboard
- Browse trending anime
- Proxy poster images through the frontend with fallback handling
- Show release calendar entries formatted to the user’s local browser time

### Social / Commentary

- Post anime-specific comments
- View comments for the selected anime
- Show broader anime discussion on the main dashboard
- Keep profile-page comments scoped to the active user

### Import / Insights

- Import anime lists from MyAnimeList usernames through Jikan
- Show library totals, score averages, status breakdowns, and queue snapshots
- Surface recent account activity on the profile page

### UX

- Dark mode
- Responsive multi-page app shell
- Safe image fallback behavior
- Cleaner dedicated pages for dashboard, library, calendar, profile, and auth

## Product Structure

### Main Routes

- `/`
  Dashboard for discovery, progress tracking, queue snapshot, trending anime, import flow, and anime comments

- `/library`
  Focused workspace for status management, score cleanup, and library curation

- `/calendar`
  Release schedule plus current watching progress

- `/profile`
  Account management, personal stats, activity timeline, and scoped comments

- `/auth`
  Local account entry flow for selecting or creating a scoped user

## Architecture

### Frontend

The frontend lives in [`frontend`](/Users/elijah/Documents/Projects/anime-tracker/frontend) and uses the Next.js App Router.

Key responsibilities:

- Route-level server rendering for major pages
- Client-side optimistic interactions for progress updates and comments
- Shared app shell and responsive layout
- Proxy-safe image handling and fallback behavior
- User account switching via cookie-backed local session selection

Key frontend areas:

- [`frontend/app`](/Users/elijah/Documents/Projects/anime-tracker/frontend/app)
  App routes and page entry points

- [`frontend/components`](/Users/elijah/Documents/Projects/anime-tracker/frontend/components)
  Reusable panels, cards, navigation, comments, library editing, and activity UI

- [`frontend/lib`](/Users/elijah/Documents/Projects/anime-tracker/frontend/lib)
  API client, session helpers, mock fallback data, and image helpers

### Backend

The backend lives in [`backend`](/Users/elijah/Documents/Projects/anime-tracker/backend) and exposes a REST API on top of:

- AniList GraphQL service wrappers
- MAL/Jikan import sync logic
- PostgreSQL persistence for user-owned data
- Per-user scoping through the active account header

Key backend areas:

- [`backend/app/api`](/Users/elijah/Documents/Projects/anime-tracker/backend/app/api)
  Route handlers and request dependencies

- [`backend/app/models`](/Users/elijah/Documents/Projects/anime-tracker/backend/app/models)
  SQLAlchemy models for users, anime entries, and comments

- [`backend/app/services`](/Users/elijah/Documents/Projects/anime-tracker/backend/app/services)
  AniList, Jikan, and import orchestration

- [`backend/app/schemas`](/Users/elijah/Documents/Projects/anime-tracker/backend/app/schemas)
  Pydantic request and response models

## Data Model

### User

Stores account identity and local auth provider metadata.

Representative fields:

- `id`
- `username`
- `email`
- `auth_provider`
- `auth_provider_id`
- `created_at`

### AnimeEntry

Represents a user-owned anime tracking record.

Representative fields:

- `user_id`
- `anime_id`
- `title`
- `cover_image`
- `status`
- `episodes_watched`
- `total_episodes`
- `score`
- `started_at`
- `finished_at`
- `updated_at`

### Review / Comment

Stores text commentary tied to a specific anime and user.

Representative fields:

- `user_id`
- `anime_id`
- `content`
- `is_spoiler`
- `created_at`

## Repository Layout

```text
.
├── backend
│   ├── alembic
│   ├── app
│   │   ├── api
│   │   ├── core
│   │   ├── db
│   │   ├── models
│   │   ├── schemas
│   │   └── services
│   ├── tests
│   └── pyproject.toml
├── frontend
│   ├── app
│   ├── components
│   ├── lib
│   ├── public
│   ├── next.config.ts
│   └── package.json
├── Procfile
├── render.yaml
├── package.json
└── README.md
```

## Branching Strategy

This repository follows the "Agile Stream" workflow from the project brief:

- `main`
  Production-ready code only

- `develop`
  Integration branch for completed features

- `feature/*`
  Feature work branched from `develop`

- `fix/*`
  Bug-fix work branched from `develop`

Current implementation work has been developed on:

- `feature/anime-tracker-foundation`

## Requirements

### Local Tooling

- Node.js 20+
- npm
- Python 3.11+
- PostgreSQL 15+ recommended

### Recommended Services

- Neon or Supabase PostgreSQL
- Vercel for frontend hosting
- Render or Railway for backend hosting

## Local Development

### 1. Clone and enter the project

```bash
git clone <your-repository-url>
cd anime-tracker
```

### 2. Configure environment files

Frontend:

```bash
cp frontend/.env.example frontend/.env.local
```

Backend:

```bash
cp backend/.env.example backend/.env
```

### 3. Prepare the database

The default local backend example expects:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/anime_tracker
```

Create the database if it does not already exist:

```bash
createdb anime_tracker
```

### 4. Start the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload
```

The API will run at:

- `http://localhost:8000`
- docs: `http://localhost:8000/docs`

### 5. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will run at:

- `http://localhost:3000`

## Environment Variables

### Frontend

Defined in [`frontend/.env.example`](/Users/elijah/Documents/Projects/anime-tracker/frontend/.env.example:1)

- `NEXT_PUBLIC_API_URL`
  Backend base URL including `/api/v1`

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Backend

Defined in [`backend/.env.example`](/Users/elijah/Documents/Projects/anime-tracker/backend/.env.example:1)

- `APP_NAME`
- `APP_ENV`
- `API_V1_PREFIX`
- `DATABASE_URL`
- `ANILIST_GRAPHQL_URL`
- `JIKAN_BASE_URL`
- `CACHE_TTL_SECONDS`
- `ALLOW_ORIGINS`
- `SEED_DEMO_DATA`

Recommended production values:

- `APP_ENV=production`
- `SEED_DEMO_DATA=false`
- `ALLOW_ORIGINS=https://your-frontend-domain.example`

## Useful Scripts

From the repository root:

```bash
npm run frontend:dev
npm run frontend:build
npm run frontend:typecheck
npm run backend:dev
npm run backend:test
npm run backend:check
npm run deploy:check
```

What they do:

- `frontend:dev`
  Starts the Next.js dev server

- `frontend:build`
  Runs a production frontend build

- `frontend:typecheck`
  Runs TypeScript without emitting files

- `backend:dev`
  Starts the FastAPI backend in reload mode

- `backend:test`
  Runs backend tests

- `backend:check`
  Verifies backend modules compile

- `deploy:check`
  Runs the backend compile check, frontend production build, and frontend typecheck

## Verification Checklist

Before deployment or pushing a release branch, verify:

1. The homepage loads without runtime errors.
2. Dark mode toggles cleanly.
3. `Start watching` adds anime into one-click tracking.
4. `Add to queue` updates the queue snapshot.
5. Comments can be posted to a selected anime.
6. The library workspace updates status and score correctly.
7. The release calendar renders without API failures.
8. `npm run deploy:check` passes from the repo root.

## Deployment

## Vercel

Create a Vercel project using the `frontend` directory as the root.

Recommended settings:

- Framework preset: Next.js
- Root directory: `frontend`
- Install command: `npm install`
- Build command: `npm run build`

Required environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.example.com/api/v1
```

## Render

This repository includes a backend blueprint at [render.yaml](/Users/elijah/Documents/Projects/anime-tracker/render.yaml:1).

Backend service settings:

- Root directory: `backend`
- Build command: `python -m pip install -e .`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/api/v1/health`
- Python version: `3.11.11` via repo-level `.python-version`

Required environment variables:

- `DATABASE_URL`
- `ALLOW_ORIGINS=https://your-vercel-domain.vercel.app`
- `APP_ENV=production`
- `SEED_DEMO_DATA=false`

## Railway

This repository includes a root [Procfile](/Users/elijah/Documents/Projects/anime-tracker/Procfile:1) for Railway-style process startup.

Equivalent start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT --app-dir backend
```

Use the same backend environment variables as Render.

## Suggested Release Order

1. Provision PostgreSQL in Neon or Supabase.
2. Deploy the backend and set `DATABASE_URL`.
3. Configure `ALLOW_ORIGINS` for the frontend domain.
4. Deploy the frontend and set `NEXT_PUBLIC_API_URL`.
5. Re-run a smoke test against the deployed URLs.

## Production Notes

- The backend currently creates tables on startup for this MVP.
- Demo seeding is disabled in production with `SEED_DEMO_DATA=false`.
- AniList and Jikan remain upstream runtime dependencies for live metadata and imports.
- The backend health endpoint is available at `/api/v1/health`.

## Project Status

The project is now at a strong MVP stage:

- local development flow is working
- deployment manifests are included
- production preflight checks exist
- user-scoped flows are in place
- core tracking, queue, comments, and calendar features are implemented

## GitHub Readiness

From a repository hygiene perspective, the project is in good shape for GitHub:

- local `.env` files are ignored
- build artifacts are ignored
- the README now documents setup and deployment
- deployment manifests are included
- the application passes the current deployment preflight

Optional improvements before publishing, if you want an even more polished public repo:

- add a `LICENSE`
- add screenshots or a demo GIF to the README
- add explicit backend tests for key API flows
- add CI to run `npm run deploy:check` on pull requests

## Notes

- The frontend intentionally includes fallback mock data for resilience during upstream/API issues.
- The backend includes a clear AniList wrapper so the frontend does not need to manage GraphQL queries directly.
- The account flow is currently local-profile based and intentionally leaves room for future Clerk or NextAuth integration.
