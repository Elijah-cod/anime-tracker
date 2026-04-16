from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserListResponse, UserRead

router = APIRouter()


def serialize_user(user: User) -> UserRead:
    return UserRead(
        id=user.id,
        username=user.username,
        email=user.email,
        auth_provider=user.auth_provider,
        created_at=user.created_at,
    )


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
