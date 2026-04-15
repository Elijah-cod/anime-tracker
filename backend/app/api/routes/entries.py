from decimal import Decimal

from fastapi import APIRouter

from app.schemas.entry import (
    AnimeEntryCreate,
    AnimeEntryListResponse,
    AnimeEntryRead,
    AnimeEntryUpdateProgress,
)

router = APIRouter()


def _demo_entries() -> list:
    return [
        AnimeEntryRead(
            anime_id=16498,
            title="Attack on Titan",
            cover_image="/anime-poster-placeholder.svg",
            status="WATCHING",
            episodes_watched=18,
            total_episodes=25,
            score=Decimal("8.80"),
        ),
        AnimeEntryRead(
            anime_id=1535,
            title="Death Note",
            cover_image="/anime-poster-placeholder.svg",
            status="COMPLETED",
            episodes_watched=37,
            total_episodes=37,
            score=Decimal("9.20"),
        ),
    ]


@router.get("", response_model=AnimeEntryListResponse)
async def list_entries() -> AnimeEntryListResponse:
    return AnimeEntryListResponse(items=_demo_entries())


@router.post("", response_model=AnimeEntryRead, status_code=201)
async def create_entry(payload: AnimeEntryCreate) -> AnimeEntryRead:
    return AnimeEntryRead(**payload.model_dump())


@router.patch("/{anime_id}/progress", response_model=AnimeEntryRead)
async def update_entry_progress(anime_id: int, payload: AnimeEntryUpdateProgress) -> AnimeEntryRead:
    updated_count = payload.episodes_watched
    if payload.increment_by:
        updated_count += payload.increment_by

    return AnimeEntryRead(
        anime_id=anime_id,
        title=payload.title,
        cover_image=payload.cover_image,
        status=payload.status,
        episodes_watched=updated_count,
        total_episodes=payload.total_episodes,
        score=payload.score,
    )
