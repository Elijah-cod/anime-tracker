from typing import List, Optional

from pydantic import BaseModel


class AnimeTitle(BaseModel):
    romaji: str
    english: Optional[str] = None


class AnimeReleaseEpisode(BaseModel):
    episode: Optional[int] = None
    airing_at: Optional[int] = None


class AnimeNode(BaseModel):
    id: int
    title: AnimeTitle
    episodes: Optional[int] = None
    average_score: Optional[int] = None
    cover_image: Optional[str] = None
    next_airing_episode: Optional[AnimeReleaseEpisode] = None


class AnimeListResponse(BaseModel):
    items: List[AnimeNode]


class AnimeSearchResponse(BaseModel):
    items: List[AnimeNode]
    page: int
    per_page: int


class AnimeCalendarItem(BaseModel):
    id: int
    title: AnimeTitle
    cover_image: Optional[str] = None
    airing_at: Optional[int] = None
    episode: Optional[int] = None


class AnimeCalendarResponse(BaseModel):
    items: List[AnimeCalendarItem]
