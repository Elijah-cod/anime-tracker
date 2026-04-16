from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.import_job import ImportRequest, ImportResponse
from app.services.sync import ImportSyncService

router = APIRouter()


def get_sync_service() -> ImportSyncService:
    return ImportSyncService()


@router.post("/mal", response_model=ImportResponse)
async def import_from_mal(
    payload: ImportRequest,
    service: ImportSyncService = Depends(get_sync_service),
    db: Session = Depends(get_db),
) -> ImportResponse:
    try:
        return await service.import_mal_list(
            username=payload.username,
            user_id=payload.user_id,
            db=db,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="MAL import failed") from exc
