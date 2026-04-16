from fastapi import APIRouter

from app.api.routes import anime, entries, health, imports, reviews, users

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(anime.router, prefix="/anime", tags=["anime"])
api_router.include_router(entries.router, prefix="/entries", tags=["entries"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(imports.router, prefix="/imports", tags=["imports"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
