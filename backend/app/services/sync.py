from typing import Dict, List

from app.schemas.import_job import ImportResponse, ImportedEntry
from app.services.jikan import JikanService


STATUS_MAP: Dict[str, str] = {
    "watching": "WATCHING",
    "completed": "COMPLETED",
    "on_hold": "PAUSED",
    "dropped": "DROPPED",
    "plan_to_watch": "PLANNING",
}


class ImportSyncService:
    def __init__(self) -> None:
        self.jikan_service = JikanService()

    async def import_mal_list(self, username: str, user_id: int) -> ImportResponse:
        data = await self.jikan_service.fetch_user_anime_list(username=username)
        items: List[ImportedEntry] = []

        for item in data[:25]:
            node = item.get("anime", {})
            list_status = item.get("status", {})
            items.append(
                ImportedEntry(
                    anime_id=node.get("mal_id", 0),
                    title=node.get("title", "Unknown title"),
                    status=STATUS_MAP.get(list_status.get("status", "watching"), "WATCHING"),
                    episodes_watched=list_status.get("episodes_watched", 0),
                )
            )

        return ImportResponse(imported_count=len(items), items=items)
