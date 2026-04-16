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
