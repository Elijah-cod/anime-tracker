from typing import Any, Dict, List

import httpx

from app.core.config import get_settings
from app.schemas.anime import (
    AnimeCalendarItem,
    AnimeCalendarResponse,
    AnimeListResponse,
    AnimeNode,
    AnimeReleaseEpisode,
    AnimeSearchResponse,
    AnimeTitle,
)

TRENDING_QUERY = """
query TrendingAnime($page: Int!, $perPage: Int!) {
  Page(page: $page, perPage: $perPage) {
    media(sort: TRENDING_DESC, type: ANIME) {
      id
      episodes
      averageScore
      title {
        romaji
        english
      }
      coverImage {
        extraLarge
      }
      nextAiringEpisode {
        episode
        airingAt
      }
    }
  }
}
"""

SEARCH_QUERY = """
query SearchAnime($page: Int!, $perPage: Int!, $search: String!) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, search: $search) {
      id
      episodes
      averageScore
      title {
        romaji
        english
      }
      coverImage {
        extraLarge
      }
      nextAiringEpisode {
        episode
        airingAt
      }
    }
  }
}
"""

CALENDAR_QUERY = """
query AiringAnime($page: Int!, $perPage: Int!) {
  Page(page: $page, perPage: $perPage) {
    airingSchedules(notYetAired: false, sort: TIME_DESC) {
      episode
      airingAt
      media {
        id
        title {
          romaji
          english
        }
        coverImage {
          extraLarge
        }
      }
    }
  }
}
"""


class AniListService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def _request(self, query: str, variables: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                self.settings.anilist_graphql_url,
                json={"query": query, "variables": variables},
                headers={"Content-Type": "application/json", "Accept": "application/json"},
            )
            response.raise_for_status()
            return response.json()

    def _map_media(self, media_nodes: List[Dict[str, Any]]) -> List[AnimeNode]:
        mapped = []
        for media in media_nodes:
            next_airing = media.get("nextAiringEpisode") or {}
            mapped.append(
                AnimeNode(
                    id=media["id"],
                    title=AnimeTitle(
                        romaji=media["title"]["romaji"],
                        english=media["title"].get("english"),
                    ),
                    episodes=media.get("episodes"),
                    average_score=media.get("averageScore"),
                    cover_image=(media.get("coverImage") or {}).get("extraLarge"),
                    next_airing_episode=AnimeReleaseEpisode(
                        episode=next_airing.get("episode"),
                        airing_at=next_airing.get("airingAt"),
                    )
                    if next_airing
                    else None,
                )
            )
        return mapped

    async def fetch_trending(self, page: int, per_page: int) -> AnimeListResponse:
        payload = await self._request(TRENDING_QUERY, {"page": page, "perPage": per_page})
        media = payload["data"]["Page"]["media"]
        return AnimeListResponse(items=self._map_media(media))

    async def search(self, query: str, page: int, per_page: int) -> AnimeSearchResponse:
        payload = await self._request(
            SEARCH_QUERY,
            {"page": page, "perPage": per_page, "search": query},
        )
        media = payload["data"]["Page"]["media"]
        return AnimeSearchResponse(items=self._map_media(media), page=page, per_page=per_page)

    async def fetch_release_calendar(self, page: int, per_page: int) -> AnimeCalendarResponse:
        payload = await self._request(CALENDAR_QUERY, {"page": page, "perPage": per_page})
        schedules = payload["data"]["Page"]["airingSchedules"]
        items = []
        for schedule in schedules:
            media = schedule["media"]
            items.append(
                AnimeCalendarItem(
                    id=media["id"],
                    title=AnimeTitle(
                        romaji=media["title"]["romaji"],
                        english=media["title"].get("english"),
                    ),
                    cover_image=(media.get("coverImage") or {}).get("extraLarge"),
                    airing_at=schedule.get("airingAt"),
                    episode=schedule.get("episode"),
                )
            )
        return AnimeCalendarResponse(items=items)
