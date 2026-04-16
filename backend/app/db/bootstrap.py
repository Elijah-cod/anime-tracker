from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.anime_entry import AnimeEntry
from app.models.review import Review
from app.models.user import User

DEMO_USER = {
    "username": "demo-user",
    "email": "demo@anime-tracker.local",
    "auth_provider": "demo",
    "auth_provider_id": "demo-user",
}

DEMO_ENTRIES = [
    {
        "anime_id": 16498,
        "title": "Attack on Titan",
        "cover_image": "/api/poster/16498",
        "status": "WATCHING",
        "episodes_watched": 18,
        "total_episodes": 25,
        "score": Decimal("8.80"),
    },
    {
        "anime_id": 21,
        "title": "One Piece",
        "cover_image": "/api/poster/21",
        "status": "WATCHING",
        "episodes_watched": 1091,
        "total_episodes": None,
        "score": Decimal("9.10"),
    },
    {
        "anime_id": 1535,
        "title": "Death Note",
        "cover_image": "/api/poster/1535",
        "status": "COMPLETED",
        "episodes_watched": 37,
        "total_episodes": 37,
        "score": Decimal("9.20"),
    },
]

DEMO_REVIEWS = [
    {
        "anime_id": 16498,
        "content": "Still one of the best pacing curves in anime. Every episode lands.",
        "is_spoiler": False,
    },
    {
        "anime_id": 1535,
        "content": "A classic cat-and-mouse thriller with a very rewatchable first half.",
        "is_spoiler": False,
    },
]


def get_or_create_demo_user(session: Session) -> User:
    user = session.scalar(select(User).where(User.email == DEMO_USER["email"]))
    if user:
        return user

    user = User(**DEMO_USER)
    session.add(user)
    session.flush()
    return user


def seed_demo_data(session: Session) -> None:
    user = get_or_create_demo_user(session)

    existing_entries = session.scalars(
        select(AnimeEntry).where(AnimeEntry.user_id == user.id)
    ).all()
    if not existing_entries:
        for entry_data in DEMO_ENTRIES:
            session.add(AnimeEntry(user_id=user.id, **entry_data))

    existing_reviews = session.scalars(select(Review).where(Review.user_id == user.id)).all()
    if not existing_reviews:
        for review_data in DEMO_REVIEWS:
            session.add(
                Review(
                    user_id=user.id,
                    anime_id=review_data["anime_id"],
                    content=review_data["content"],
                    is_spoiler=review_data["is_spoiler"],
                    created_at=datetime.now(timezone.utc),
                )
            )

    session.commit()
