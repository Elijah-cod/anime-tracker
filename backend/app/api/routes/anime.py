from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.schemas.anime import AnimeCalendarResponse, AnimeListResponse, AnimeSearchResponse
from app.services.anilist import AniListService

router = APIRouter()


def get_anilist_service() -> AniListService:
    return AniListService()


@router.get("/trending", response_model=AnimeListResponse)
async def get_trending_anime(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(6, ge=1, le=20),
    service: AniListService = Depends(get_anilist_service),
) -> AnimeListResponse:
    cache = request.app.state.trending_cache
    cache_key = "trending:{0}:{1}".format(page, per_page)
    cached = cache.get(cache_key)
    if cached:
        return cached

    try:
        payload = await service.fetch_trending(page=page, per_page=per_page)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AniList trending request failed") from exc

    cache.set(cache_key, payload)
    return payload


@router.get("/search", response_model=AnimeSearchResponse)
async def search_anime(
    query: str = Query(..., min_length=2),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=30),
    service: AniListService = Depends(get_anilist_service),
) -> AnimeSearchResponse:
    try:
        return await service.search(query=query, page=page, per_page=per_page)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AniList search request failed") from exc


@router.get("/release-calendar", response_model=AnimeCalendarResponse)
async def get_release_calendar(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=25),
    service: AniListService = Depends(get_anilist_service),
) -> AnimeCalendarResponse:
    try:
        return await service.fetch_release_calendar(page=page, per_page=per_page)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AniList calendar request failed") from exc
