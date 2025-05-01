from sqlalchemy import select, func
from app.models import Session, Price

def is_deal(day, value, drop_pct=10):
  with Session() as s:
    avg = s.scalars(select(func.avg(Price.value))).one() or value
  return value < avg * (1 - drop_pct / 100)