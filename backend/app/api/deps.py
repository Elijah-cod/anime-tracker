from fastapi import Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.bootstrap import get_or_create_demo_user
from app.db.session import get_db
from app.models.user import User

USER_EMAIL_HEADER = "x-anime-tracker-user-email"


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    raw_email = request.headers.get(USER_EMAIL_HEADER, "").strip().lower()
    if raw_email:
        user = db.scalar(select(User).where(User.email == raw_email))
        if user:
            return user

    return get_or_create_demo_user(db)
