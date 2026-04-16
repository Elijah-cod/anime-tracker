from datetime import datetime
from typing import List

from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    email: str


class UserRead(BaseModel):
    id: int
    username: str
    email: str
    auth_provider: str
    created_at: datetime | None = None


class UserListResponse(BaseModel):
    items: List[UserRead]


class UserProfileStats(BaseModel):
    tracked_entries: int
    reviews_written: int
    total_episodes_watched: int
    average_score: float | None = None
    watching_entries: int
    completed_entries: int
    account_age_days: int


class UserActivityItem(BaseModel):
    kind: str
    anime_id: int
    anime_title: str
    cover_image: str | None = None
    detail: str
    occurred_at: datetime | None = None


class UserDashboardResponse(BaseModel):
    stats: UserProfileStats
    recent_activity: List[UserActivityItem]
