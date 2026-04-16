from typing import Dict, List

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.anime_entry import AnimeEntry
from app.models.user import User
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

    async def import_mal_list(self, username: str, user_id: int, db: Session) -> ImportResponse:
        data = await self.jikan_service.fetch_user_anime_list(username=username)
        user = db.scalar(select(User).where(User.id == user_id))
        if user is None:
            raise ValueError("User not found for import")
        items: List[ImportedEntry] = []

        for item in data[:25]:
            node = item.get("anime", {})
            list_status = item.get("status", {})
            anime_id = node.get("mal_id", 0)
            title = node.get("title", "Unknown title")
            cover_image = (
                node.get("images", {})
                .get("jpg", {})
                .get("image_url")
            )
            normalized_status = STATUS_MAP.get(list_status.get("status", "watching"), "WATCHING")
            episodes_watched = list_status.get("episodes_watched", 0)

            existing_entry = db.scalar(
                select(AnimeEntry).where(
                    AnimeEntry.user_id == user.id,
                    AnimeEntry.anime_id == anime_id,
                )
            )
            if existing_entry:
                existing_entry.title = title
                existing_entry.cover_image = cover_image
                existing_entry.status = normalized_status
                existing_entry.episodes_watched = episodes_watched
            else:
                db.add(
                    AnimeEntry(
                        user_id=user.id,
                        anime_id=anime_id,
                        title=title,
                        cover_image=cover_image,
                        status=normalized_status,
                        episodes_watched=episodes_watched,
                    )
                )

            items.append(
                ImportedEntry(
                    anime_id=anime_id,
                    title=title,
                    status=normalized_status,
                    episodes_watched=episodes_watched,
                )
            )

        db.commit()
        return ImportResponse(imported_count=len(items), items=items)
