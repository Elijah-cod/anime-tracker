from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.anime_entry import AnimeEntry
from app.models.review import Review
from app.models.user import User
from app.schemas.user import (
    UserActivityItem,
    UserCreate,
    UserDashboardResponse,
    UserListResponse,
    UserProfileStats,
    UserRead,
)

router = APIRouter()


def serialize_user(user: User) -> UserRead:
    return UserRead(
        id=user.id,
        username=user.username,
        email=user.email,
        auth_provider=user.auth_provider,
        created_at=user.created_at,
    )


def build_dashboard(db: Session, user: User) -> UserDashboardResponse:
    entries = db.scalars(
        select(AnimeEntry)
        .where(AnimeEntry.user_id == user.id)
        .order_by(AnimeEntry.updated_at.desc(), AnimeEntry.id.desc())
    ).all()
    reviews = db.scalars(
        select(Review)
        .where(Review.user_id == user.id)
        .order_by(Review.created_at.desc(), Review.id.desc())
    ).all()
    entry_map = {entry.anime_id: entry for entry in entries}

    scored_entries = [float(entry.score) for entry in entries if entry.score is not None]
    average_score = (
        round(sum(scored_entries) / len(scored_entries), 2) if scored_entries else None
    )

    created_at = user.created_at or datetime.now(timezone.utc)
    account_age_days = max((datetime.now(timezone.utc) - created_at).days, 0)

    stats = UserProfileStats(
        tracked_entries=len(entries),
        reviews_written=len(reviews),
        total_episodes_watched=sum(entry.episodes_watched for entry in entries),
        average_score=average_score,
        watching_entries=sum(1 for entry in entries if entry.status == "WATCHING"),
        completed_entries=sum(1 for entry in entries if entry.status == "COMPLETED"),
        account_age_days=account_age_days,
    )

    activity: list[UserActivityItem] = []
    for entry in entries[:4]:
        score_text = f" · Score {float(entry.score):.1f}" if entry.score is not None else ""
        activity.append(
            UserActivityItem(
                kind="entry_updated",
                anime_id=entry.anime_id,
                anime_title=entry.title,
                cover_image=entry.cover_image,
                detail=f"{entry.status} · {entry.episodes_watched} episodes logged{score_text}",
                occurred_at=entry.updated_at,
            )
        )

    for review in reviews[:4]:
        related_entry = entry_map.get(review.anime_id)
        spoiler_text = "Spoiler review" if review.is_spoiler else "Review posted"
        activity.append(
            UserActivityItem(
                kind="review_created",
                anime_id=review.anime_id,
                anime_title=related_entry.title if related_entry else f"Anime #{review.anime_id}",
                cover_image=related_entry.cover_image if related_entry else None,
                detail=spoiler_text,
                occurred_at=review.created_at,
            )
        )

    recent_activity = sorted(
        activity,
        key=lambda item: item.occurred_at or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True,
    )[:6]

    return UserDashboardResponse(stats=stats, recent_activity=recent_activity)


@router.get("", response_model=UserListResponse)
async def list_users(db: Session = Depends(get_db)) -> UserListResponse:
    users = db.scalars(select(User).order_by(User.username.asc())).all()
    db.commit()
    return UserListResponse(items=[serialize_user(user) for user in users])


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    normalized_email = payload.email.strip().lower()
    normalized_username = payload.username.strip()

    if not normalized_username or not normalized_email:
        raise HTTPException(status_code=400, detail="Username and email are required")

    existing_email = db.scalar(select(User).where(User.email == normalized_email))
    if existing_email:
        raise HTTPException(status_code=409, detail="Email already exists")

    existing_username = db.scalar(select(User).where(User.username == normalized_username))
    if existing_username:
        raise HTTPException(status_code=409, detail="Username already exists")

    user = User(
        username=normalized_username,
        email=normalized_email,
        auth_provider="local",
        auth_provider_id=f"local:{normalized_email}",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return serialize_user(user)


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)) -> UserRead:
    return serialize_user(current_user)


@router.get("/me/dashboard", response_model=UserDashboardResponse)
async def get_my_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserDashboardResponse:
    dashboard = build_dashboard(db, current_user)
    db.commit()
    return dashboard
