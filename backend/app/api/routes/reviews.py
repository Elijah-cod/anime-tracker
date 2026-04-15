from fastapi import APIRouter

from app.schemas.review import ReviewCreate, ReviewRead

router = APIRouter()


@router.post("", response_model=ReviewRead, status_code=201)
async def create_review(payload: ReviewCreate) -> ReviewRead:
    return ReviewRead(id=1, **payload.model_dump())
