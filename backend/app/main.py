from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.cache import TrendingAnimeCache

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Middleware service for Anime Tracker.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    app.state.trending_cache = TrendingAnimeCache(ttl_seconds=settings.cache_ttl_seconds)


@app.get("/", tags=["meta"])
async def root() -> dict:
    return {
        "name": settings.app_name,
        "environment": settings.app_env,
        "docs": "/docs",
        "api_prefix": settings.api_v1_prefix,
    }


app.include_router(api_router, prefix=settings.api_v1_prefix)
