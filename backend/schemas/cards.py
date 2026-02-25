from pydantic import BaseModel
from typing import Optional


class Card(BaseModel):
    db_id: Optional[int]
    set_type: Optional[str]
    unique_id: Optional[str]
    unique_img_link: Optional[str]
    print_set: Optional[str]

    card_id: Optional[str]
    rarity: Optional[str]
    name: Optional[str]
    card_type: Optional[str]
    color: Optional[str]
    block: Optional[str]
    attribute: Optional[str]
    power: Optional[str]
    cost: Optional[str]
    counter: Optional[str]
    effect: Optional[str]

    class Config:
        from_attributes = True
