from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class AnimeEntryBase(BaseModel):
    anime_id: int
    title: str
    cover_image: Optional[str] = None
    status: str
    episodes_watched: int = 0
    total_episodes: Optional[int] = None
    score: Optional[Decimal] = None
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None


class AnimeEntryCreate(AnimeEntryBase):
    user_id: int = Field(default=1)


class AnimeEntryRead(AnimeEntryBase):
    pass


class AnimeEntryUpdateProgress(BaseModel):
    title: str
    cover_image: Optional[str] = None
    status: str
    episodes_watched: int = 0
    increment_by: int = 0
    total_episodes: Optional[int] = None
    score: Optional[Decimal] = None


class AnimeEntryListResponse(BaseModel):
    items: List[AnimeEntryRead]
