from fastapi import Depends, status, HTTPException, APIRouter
import models
import schemas
from db.database import get_db
from sqlalchemy.orm import Session
from .security.hashing import Hash

router = APIRouter(prefix="/user", tags=["user"])


def create_user(request: schemas.User, db: Session = Depends(get_db)):
    user_check = user_email_exists(request.email, db)
    username_check = user_username_exists(request.username, db)
    if user_check:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    if username_check:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this username already exists",
        )
    hashedPassword = Hash.get_password_hash(request.password)
    new_user = models.User(
        email=request.email, username=request.username, password=hashedPassword
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def user_email_exists(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    return bool(user)


def user_username_exists(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    return bool(user)


def get_user(id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {id} not found"
        )
    return user


def get_user_email(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="email not found"
        )
    return user


def get_user_username(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="username not found"
        )
    return user
