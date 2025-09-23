from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import database, models, schemas
from .auth import get_current_user

router = APIRouter()

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user