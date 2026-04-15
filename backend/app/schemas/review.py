from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    user_id: int = Field(default=1)
    anime_id: int
    content: str
    is_spoiler: bool = False


class ReviewRead(ReviewCreate):
    id: int
    created_at: Optional[datetime] = None
