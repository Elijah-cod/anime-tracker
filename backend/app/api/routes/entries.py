from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.bootstrap import get_or_create_demo_user
from app.db.session import get_db
from app.models.anime_entry import AnimeEntry
from app.schemas.entry import (
    AnimeEntryCreate,
    AnimeEntryListResponse,
    AnimeEntryRead,
    AnimeEntryUpdate,
    AnimeEntryUpdateProgress,
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
async def list_entries(db: Session = Depends(get_db)) -> AnimeEntryListResponse:
    user = get_or_create_demo_user(db)
    entries = db.scalars(
        select(AnimeEntry)
        .where(AnimeEntry.user_id == user.id)
        .order_by(AnimeEntry.updated_at.desc(), AnimeEntry.id.desc())
    ).all()
    db.commit()
    return AnimeEntryListResponse(items=[serialize_entry(entry) for entry in entries])


@router.post("", response_model=AnimeEntryRead, status_code=201)
async def create_entry(payload: AnimeEntryCreate, db: Session = Depends(get_db)) -> AnimeEntryRead:
    user = get_or_create_demo_user(db)
    existing_entry = db.scalar(
        select(AnimeEntry).where(
            AnimeEntry.user_id == user.id,
            AnimeEntry.anime_id == payload.anime_id,
        )
    )

    if existing_entry:
        for field, value in payload.model_dump(exclude={"user_id"}).items():
            setattr(existing_entry, field, value)
        db.commit()
        db.refresh(existing_entry)
        return serialize_entry(existing_entry)

    entry = AnimeEntry(user_id=user.id, **payload.model_dump(exclude={"user_id"}))
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return serialize_entry(entry)


@router.patch("/{anime_id}", response_model=AnimeEntryRead)
async def update_entry(
    anime_id: int,
    payload: AnimeEntryUpdate,
    db: Session = Depends(get_db),
) -> AnimeEntryRead:
    user = get_or_create_demo_user(db)
    entry = db.scalar(
        select(AnimeEntry).where(
            AnimeEntry.user_id == user.id,
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
) -> AnimeEntryRead:
    user = get_or_create_demo_user(db)
    entry = db.scalar(
        select(AnimeEntry).where(
            AnimeEntry.user_id == user.id,
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
