from datetime import datetime, timezone
from itertools import count

from fastapi import APIRouter

from app.schemas.review import ReviewCreate, ReviewListResponse, ReviewRead

router = APIRouter()

_review_ids = count(start=3)
_review_store = [
    ReviewRead(
        id=1,
        user_id=1,
        anime_id=16498,
        anime_title="Attack on Titan",
        cover_image="/api/poster/16498",
        content="Still one of the best pacing curves in anime. Every episode lands.",
        is_spoiler=False,
        created_at=datetime.now(timezone.utc),
    ),
    ReviewRead(
        id=2,
        user_id=1,
        anime_id=1535,
        anime_title="Death Note",
        cover_image="/api/poster/1535",
        content="A classic cat-and-mouse thriller with a very rewatchable first half.",
        is_spoiler=False,
        created_at=datetime.now(timezone.utc),
    ),
]


@router.get("", response_model=ReviewListResponse)
async def list_reviews() -> ReviewListResponse:
    return ReviewListResponse(items=_review_store)


@router.post("", response_model=ReviewRead, status_code=201)
async def create_review(payload: ReviewCreate) -> ReviewRead:
    review = ReviewRead(
        id=next(_review_ids),
        created_at=datetime.now(timezone.utc),
        **payload.model_dump(),
    )
    _review_store.insert(0, review)
    return review
