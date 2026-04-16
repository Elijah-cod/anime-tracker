from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.bootstrap import get_or_create_demo_user
from app.db.session import get_db
from app.models.anime_entry import AnimeEntry
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewListResponse, ReviewRead

router = APIRouter()

def serialize_review(review: Review, related_entry: AnimeEntry | None = None) -> ReviewRead:
    return ReviewRead(
        id=review.id,
        user_id=review.user_id,
        anime_id=review.anime_id,
        anime_title=related_entry.title if related_entry else None,
        cover_image=related_entry.cover_image if related_entry else None,
        content=review.content,
        is_spoiler=review.is_spoiler,
        created_at=review.created_at,
    )


@router.get("", response_model=ReviewListResponse)
async def list_reviews(db: Session = Depends(get_db)) -> ReviewListResponse:
    user = get_or_create_demo_user(db)
    reviews = db.scalars(
        select(Review).where(Review.user_id == user.id).order_by(Review.created_at.desc(), Review.id.desc())
    ).all()
    entries = db.scalars(select(AnimeEntry).where(AnimeEntry.user_id == user.id)).all()
    entry_map = {entry.anime_id: entry for entry in entries}
    db.commit()
    return ReviewListResponse(
        items=[serialize_review(review, entry_map.get(review.anime_id)) for review in reviews]
    )


@router.post("", response_model=ReviewRead, status_code=201)
async def create_review(payload: ReviewCreate, db: Session = Depends(get_db)) -> ReviewRead:
    user = get_or_create_demo_user(db)
    review = Review(
        user_id=user.id,
        anime_id=payload.anime_id,
        content=payload.content,
        is_spoiler=payload.is_spoiler,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    related_entry = db.scalar(
        select(AnimeEntry).where(
            AnimeEntry.user_id == user.id,
            AnimeEntry.anime_id == payload.anime_id,
        )
    )
    return serialize_review(review, related_entry)
