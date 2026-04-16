from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.anime_entry import AnimeEntry
from app.models.user import User
from app.schemas.entry import (
    AnimeEntryCreate,
    AnimeEntryListResponse,
    AnimeEntryRead,
    AnimeEntryStatusCount,
    AnimeEntryUpdate,
    AnimeEntryUpdateProgress,
    LibrarySummaryResponse,
)

router = APIRouter()


def serialize_entry(entry: AnimeEntry) -> AnimeEntryRead:
    return AnimeEntryRead(
        anime_id=entry.anime_id,
        title=entry.title,
        cover_image=entry.cover_image,
        status=entry.status,
        episodes_watched=entry.episodes_watched,
        total_episodes=entry.total_episodes,
        score=entry.score,
        started_at=entry.started_at,
        finished_at=entry.finished_at,
    )


@router.get("", response_model=AnimeEntryListResponse)
async def list_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnimeEntryListResponse:
    entries = db.scalars(
        select(AnimeEntry)
        .where(AnimeEntry.user_id == current_user.id)
        .order_by(AnimeEntry.updated_at.desc(), AnimeEntry.id.desc())
    ).all()
    db.commit()
    return AnimeEntryListResponse(items=[serialize_entry(entry) for entry in entries])


@router.get("/summary", response_model=LibrarySummaryResponse)
async def get_library_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LibrarySummaryResponse:
    entries = db.scalars(
        select(AnimeEntry)
        .where(AnimeEntry.user_id == current_user.id)
        .order_by(AnimeEntry.updated_at.desc(), AnimeEntry.id.desc())
    ).all()
    db.commit()

    total_entries = len(entries)
    total_episodes_watched = sum(entry.episodes_watched for entry in entries)
    scored_entries = [float(entry.score) for entry in entries if entry.score is not None]
    average_score = (
        round(sum(scored_entries) / len(scored_entries), 2) if scored_entries else None
    )
    completed_entries = sum(1 for entry in entries if entry.status == "COMPLETED")
    watching_entries = sum(1 for entry in entries if entry.status == "WATCHING")
    planning_entries = sum(1 for entry in entries if entry.status == "PLANNING")

    status_counts: dict[str, int] = {}
    for entry in entries:
        status_counts[entry.status] = status_counts.get(entry.status, 0) + 1

    status_breakdown = [
        AnimeEntryStatusCount(status=status, count=count)
        for status, count in sorted(status_counts.items())
    ]

    watch_queue = [
        serialize_entry(entry)
        for entry in entries
        if entry.status in {"WATCHING", "PLANNING"}
    ][:4]

    return LibrarySummaryResponse(
        total_entries=total_entries,
        total_episodes_watched=total_episodes_watched,
        average_score=average_score,
        completed_entries=completed_entries,
        watching_entries=watching_entries,
        planning_entries=planning_entries,
        status_breakdown=status_breakdown,
        watch_queue=watch_queue,
    )


@router.post("", response_model=AnimeEntryRead, status_code=201)
async def create_entry(
    payload: AnimeEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnimeEntryRead:
    existing_entry = db.scalar(
        select(AnimeEntry).where(
            AnimeEntry.user_id == current_user.id,
            AnimeEntry.anime_id == payload.anime_id,
        )
    )

    if existing_entry:
        for field, value in payload.model_dump(exclude={"user_id"}).items():
            setattr(existing_entry, field, value)
        db.commit()
        db.refresh(existing_entry)
        return serialize_entry(existing_entry)

    entry = AnimeEntry(user_id=current_user.id, **payload.model_dump(exclude={"user_id"}))
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return serialize_entry(entry)


@router.patch("/{anime_id}", response_model=AnimeEntryRead)
async def update_entry(
    anime_id: int,
    payload: AnimeEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnimeEntryRead:
    entry = db.scalar(
        select(AnimeEntry).where(
            AnimeEntry.user_id == current_user.id,
            AnimeEntry.anime_id == anime_id,
        )
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Anime entry not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)
    return serialize_entry(entry)


@router.patch("/{anime_id}/progress", response_model=AnimeEntryRead)
async def update_entry_progress(
    anime_id: int,
    payload: AnimeEntryUpdateProgress,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnimeEntryRead:
    entry = db.scalar(
        select(AnimeEntry).where(
            AnimeEntry.user_id == current_user.id,
            AnimeEntry.anime_id == anime_id,
        )
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Anime entry not found")

    entry.title = payload.title
    entry.cover_image = payload.cover_image
    entry.status = payload.status
    entry.episodes_watched = payload.episodes_watched + payload.increment_by
    entry.total_episodes = payload.total_episodes
    entry.score = payload.score

    db.commit()
    db.refresh(entry)
    return serialize_entry(entry)


@router.delete("/{anime_id}", status_code=204)
async def delete_entry(
    anime_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    entry = db.scalar(
        select(AnimeEntry).where(
            AnimeEntry.user_id == current_user.id,
            AnimeEntry.anime_id == anime_id,
        )
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Anime entry not found")

    db.delete(entry)
    db.commit()
