from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    user_id: int = Field(default=1)
    anime_id: int
    anime_title: Optional[str] = None
    cover_image: Optional[str] = None
    content: str
    is_spoiler: bool = False


class ReviewRead(ReviewCreate):
    id: int
    username: Optional[str] = None
    created_at: Optional[datetime] = None


class ReviewListResponse(BaseModel):
    items: List[ReviewRead]
