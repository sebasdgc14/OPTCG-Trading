from fastapi import APIRouter, Depends, Query
from typing import List, Optional, Dict
from db.database import get_db
from sqlalchemy.orm import Session
from repository import cards as cards_repo
from schemas import Card as CardSchema

router = APIRouter(prefix="/cards", tags=["Cards"])


@router.get("", response_model=List[CardSchema])
def get_list_cards(
    page: int = 1,
    limit: int = 48,
    q: Optional[str] = None,
    print_sets: Optional[List[str]] = Query(None),
    card_id: Optional[str] = None,
    rarities: Optional[List[str]] = Query(None),
    name: Optional[str] = None,
    card_type: Optional[str] = None,
    colors: Optional[List[str]] = Query(None),
    blocks: Optional[List[str]] = Query(None),
    attributes: Optional[List[str]] = Query(None),
    power: Optional[str] = Query(
        None, description="numeric filter for power, e.g. '>5000' or '>=3000' or '5000'"
    ),
    cost: Optional[str] = Query(
        None, description="numeric filter for cost, e.g. '<=3' or '3'"
    ),
    counter_values: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
):
    return cards_repo.get_cards(
        db,
        page=page,
        limit=limit,
        q=q,
        print_sets=print_sets,
        card_id=card_id,
        rarities=rarities,
        name=name,
        card_type=card_type,
        colors=colors,
        blocks=blocks,
        attributes=attributes,
        power=power,
        cost=cost,
        counter_values=counter_values,
    )


@router.get("/filters", response_model=Dict[str, List[str]])
def get_cards_filters(db: Session = Depends(get_db)):
    return cards_repo.get_cards_filters(db)
