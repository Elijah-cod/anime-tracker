from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.cache import TrendingAnimeCache
from app.db.base import Base
from app.db.bootstrap import seed_demo_data
from app.db.session import SessionLocal, engine
from app.models import anime_entry, review, user  # noqa: F401

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.trending_cache = TrendingAnimeCache(ttl_seconds=settings.cache_ttl_seconds)
    if settings.should_create_tables_on_startup:
        Base.metadata.create_all(bind=engine)
    if settings.seed_demo_data:
        with SessionLocal() as session:
            seed_demo_data(session)
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Middleware service for Anime Tracker.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["meta"])
async def root() -> dict:
    return {
        "name": settings.app_name,
        "environment": settings.app_env,
        "docs": "/docs",
        "api_prefix": settings.api_v1_prefix,
    }


app.include_router(api_router, prefix=settings.api_v1_prefix)
