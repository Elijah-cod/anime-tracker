from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.anime_entry import AnimeEntry
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewListResponse, ReviewRead

router = APIRouter()


def serialize_review(
    review: Review,
    related_entry: AnimeEntry | None = None,
    author: User | None = None,
) -> ReviewRead:
    return ReviewRead(
        id=review.id,
        user_id=review.user_id,
        anime_id=review.anime_id,
        anime_title=related_entry.title if related_entry else None,
        cover_image=related_entry.cover_image if related_entry else None,
        content=review.content,
        is_spoiler=review.is_spoiler,
        username=author.username if author else None,
        created_at=review.created_at,
    )


@router.get("", response_model=ReviewListResponse)
async def list_reviews(
    scope: str = Query("mine", pattern="^(mine|all)$"),
    anime_id: int | None = Query(default=None, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReviewListResponse:
    query = select(Review)
    if scope == "mine":
        query = query.where(Review.user_id == current_user.id)
    if anime_id is not None:
        query = query.where(Review.anime_id == anime_id)

    reviews = db.scalars(query.order_by(Review.created_at.desc(), Review.id.desc())).all()

    anime_ids = sorted({review.anime_id for review in reviews})
    user_ids = sorted({review.user_id for review in reviews})

    entries = (
        db.scalars(select(AnimeEntry).where(AnimeEntry.anime_id.in_(anime_ids))).all()
        if anime_ids
        else []
    )
    users = (
        db.scalars(select(User).where(User.id.in_(user_ids))).all()
        if user_ids
        else []
    )

    entry_map: dict[int, AnimeEntry] = {}
    for entry in entries:
        entry_map.setdefault(entry.anime_id, entry)

    user_map = {user.id: user for user in users}
    db.commit()
    return ReviewListResponse(
        items=[
            serialize_review(
                review,
                entry_map.get(review.anime_id),
                user_map.get(review.user_id),
            )
            for review in reviews
        ]
    )


@router.post("", response_model=ReviewRead, status_code=201)
async def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReviewRead:
    review = Review(
        user_id=current_user.id,
        anime_id=payload.anime_id,
        content=payload.content,
        is_spoiler=payload.is_spoiler,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    related_entry = db.scalar(
        select(AnimeEntry).where(
            AnimeEntry.user_id == current_user.id,
            AnimeEntry.anime_id == payload.anime_id,
        )
    )
    return serialize_review(review, related_entry, current_user)
