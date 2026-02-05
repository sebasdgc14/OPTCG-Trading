from fastapi import Depends, APIRouter
import schemas
from db.database import get_db
from sqlalchemy.orm import Session
from repository import user

router = APIRouter(prefix="/users", tags=["User"])


@router.post("", response_model=schemas.ShowUser)
def create_user(request: schemas.User, db: Session = Depends(get_db)):
    return user.create_user(request, db)


@router.get("/username/{username}", response_model=schemas.ShowUser)
def get_user_by_username(username: str, db: Session = Depends(get_db)):
    return user.get_user_username(username, db)
