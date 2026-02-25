from typing import Any, Dict, List, Optional, Sequence, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
import re
import models


def _model_to_dict(obj: models.Cards) -> Dict[str, Any]:
    data: Dict[str, Any] = {}
    for col in obj.__table__.columns:
        data[col.name] = getattr(obj, col.name)
    return data


def _extract_first_int(s: Optional[str]) -> Optional[int]:
    if not s:
        return None
    m = re.search(r"-?\d+", str(s))
    if not m:
        return None
    try:
        return int(m.group(0))
    except Exception:
        return None


def get_distinct_values(db: Session, column) -> List[str]:
    """Return distinct non-null string values for a given model column."""
    rows = db.query(column).distinct().all()
    vals: List[str] = []
    for r in rows:
        # handle single-value tuples/lists returned by some DB drivers
        if isinstance(r, (tuple, list)):
            v = r[0]
        else:
            v = r
        if v is None:
            continue
        if isinstance(v, bytes):
            v = v.decode()
        s = str(v).strip()
        # clean common tuple-like string forms: "('value',)" for easier fetching of distinct values from DB when they are stored as tuples or have extra characters. This is a bit hacky but handles some common cases.
        # remove surrounding parentheses and trailing commas
        s = re.sub(r"^[\(\s]*", "", s)
        s = re.sub(r"[\)\s,]*$", "", s)
        # remove surrounding quotes if present
        if (s.startswith("'") and s.endswith("'")) or (
            s.startswith('"') and s.endswith('"')
        ):
            s = s[1:-1]
        s = s.strip()
        if s:
            vals.append(s)
    return vals


def get_unique_print_sets(db: Session) -> List[str]:
    return get_distinct_values(db, models.Cards.print_set)


def get_unique_rarities(db: Session) -> List[str]:
    return get_distinct_values(db, models.Cards.rarity)


def get_unique_blocks(db: Session) -> List[str]:
    return get_distinct_values(db, models.Cards.block)


def get_unique_attributes(db: Session) -> List[str]:
    return get_distinct_values(db, models.Cards.attribute)


def get_unique_colors(db: Session) -> List[str]:
    return get_distinct_values(db, models.Cards.color)


def _parse_numeric_filter(expr: Optional[str]) -> Optional[Tuple[str, int]]:
    """Parse expressions like '>5000', '>= 3000', '5000' into (op, value).

    Allowed ops returned: 'gt','gte','lt','lte','eq'
    """
    if not expr:
        return None
    expr = str(expr).strip()
    m = re.match(r"^\s*(>=|<=|>|<|==|=)?\s*(-?\d+)\s*$", expr)
    if not m:
        return None
    op_raw = m.group(1) or "="
    val = int(m.group(2))
    mapping = {
        ">": "gt",
        "<": "lt",
        ">=": "gte",
        "<=": "lte",
        "=": "eq",
        "==": "eq",
    }
    op = mapping.get(op_raw, "eq")
    return (op, val)


def get_cards(
    db: Session,
    page: int = 1,
    limit: int = 48,
    q: Optional[str] = None,
    print_sets: Optional[Sequence[str]] = None,
    card_id: Optional[str] = None,
    rarities: Optional[Sequence[str]] = None,
    name: Optional[str] = None,
    card_type: Optional[str] = None,
    colors: Optional[Sequence[str]] = None,
    blocks: Optional[Sequence[str]] = None,
    attributes: Optional[Sequence[str]] = None,
    power: Optional[str] = None,
    cost: Optional[str] = None,
    counter_values: Optional[Sequence[str]] = None,
) -> List[Dict[str, Any]]:
    """Return a list of cards filtered by the provided parameters.

    Note: power and cost comparisons are applied in Python after fetching matching rows
    for other filters (this avoids DB-specific casting issues). Pagination is applied
    after all filters.
    """
    if page < 1:
        page = 1
    offset = (page - 1) * limit

    query = db.query(models.Cards)

    # Basic text search (name or card_id)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (models.Cards.name.ilike(like)) | (models.Cards.card_id.ilike(like))
        )

    # Exact/select filters
    if print_sets:
        query = query.filter(models.Cards.print_set.in_(list(print_sets)))

    if card_id:
        query = query.filter(models.Cards.card_id.ilike(f"%{card_id}%"))

    if rarities:
        query = query.filter(models.Cards.rarity.in_(list(rarities)))

    if name:
        query = query.filter(models.Cards.name.ilike(f"%{name}%"))

    if card_type:
        query = query.filter(models.Cards.card_type.ilike(f"%{card_type}%"))

    if colors:
        # match any of the provided colors as substring
        color_conds = [models.Cards.color.ilike(f"%{c}%") for c in colors]
        query = query.filter(or_(*color_conds))

    if blocks:
        query = query.filter(models.Cards.block.in_(list(blocks)))

    if attributes:
        query = query.filter(models.Cards.attribute.in_(list(attributes)))

    if counter_values:
        query = query.filter(models.Cards.counter.in_(list(counter_values)))

    # At this point, if power/cost filters provided, fetch unpaginated results and apply
    # numeric filtering in Python. Otherwise, use offset/limit in DB.
    # parse numeric expressions if provided (e.g. ">5000")
    power_filter = _parse_numeric_filter(power)
    cost_filter = _parse_numeric_filter(cost)

    needs_python_filter = power_filter is not None or cost_filter is not None

    rows = (
        query.all() if needs_python_filter else query.offset(offset).limit(limit).all()
    )

    items: List[Dict[str, Any]] = [_model_to_dict(r) for r in rows]

    def apply_numeric_filter(
        items_list: List[Dict[str, Any]], field: str, filt: Tuple[str, int]
    ) -> List[Dict[str, Any]]:
        op, val = filt
        out: List[Dict[str, Any]] = []
        for it in items_list:
            num = _extract_first_int(it.get(field))
            if num is None:
                continue
            if op == "gt" and num > val:
                out.append(it)
            elif op == "gte" and num >= val:
                out.append(it)
            elif op == "lt" and num < val:
                out.append(it)
            elif op == "lte" and num <= val:
                out.append(it)
            elif op == "eq" and num == val:
                out.append(it)
        return out

    if power_filter:
        items = apply_numeric_filter(items, "power", power_filter)

    if cost_filter:
        items = apply_numeric_filter(items, "cost", cost_filter)

    # After python filtering, if we previously loaded all rows, apply pagination now
    if needs_python_filter:
        start = offset
        end = offset + limit
        items = items[start:end]

    return items


def get_cards_filters(db: Session):
    """Return all distinct filter option lists in one response."""
    return {
        "print_sets": get_unique_print_sets(db),
        "rarities": get_unique_rarities(db),
        "blocks": get_unique_blocks(db),
        "attributes": get_unique_attributes(db),
        "colors": get_unique_colors(db),
    }
