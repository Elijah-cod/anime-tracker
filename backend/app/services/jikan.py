from typing import Any, Dict, List

import httpx

from app.core.config import get_settings


class JikanService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def fetch_user_anime_list(self, username: str) -> List[Dict[str, Any]]:
        url = "{0}/users/{1}/animelist".format(self.settings.jikan_base_url, username)
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            payload = response.json()
            return payload.get("data", [])
