from typing import List

from pydantic import BaseModel


class ImportRequest(BaseModel):
    username: str
    user_id: int = 1


class ImportedEntry(BaseModel):
    anime_id: int
    title: str
    status: str
    episodes_watched: int


class ImportResponse(BaseModel):
    imported_count: int
    items: List[ImportedEntry]
