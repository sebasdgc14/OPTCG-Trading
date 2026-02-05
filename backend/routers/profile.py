from fastapi import Depends, APIRouter
import schemas
from db.database import get_db
from sqlalchemy.orm import Session
from repository import deck as deck_repo
from repository.security import oauth2

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=schemas.ProfileUser)
def get_profile(current_user=Depends(oauth2.get_current_user)):
    return current_user


@router.get("/decks", response_model=list[schemas.DeckOut])
def list_user_decks(
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    return deck_repo.get_user_decks(user_id=current_user.id, db=db)


@router.post("/decks")
def create_user_deck(
    request: schemas.CreateDeck,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    return deck_repo.create_deck(
        user_id=current_user.id,
        name=request.name,
        is_wishlist=request.is_wishlist,
        db=db,
    )


@router.get("/decks/{deck_id}", response_model=schemas.DeckOut)
def get_deck_details(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    return deck_repo.get_user_deck_details(
        deck_id=deck_id,
        user_id=current_user.id,
        db=db,
    )


@router.post("/decks/{deck_id}/cards")
def add_card_to_user_deck(
    deck_id: int,
    request: schemas.AddCardToDeck,
    db: Session = Depends(get_db),
    current_user=Depends(oauth2.get_current_user),
):
    return deck_repo.add_card_to_user_deck(
        deck_id=deck_id,
        card_id=request.card_id,
        quantity=request.quantity,
        user_id=current_user.id,
        db=db,
    )
