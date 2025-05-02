from sqlalchemy import select, func
from app.models import Session, Price
from app.notifier import send

def is_deal(day, value, drop_pct=10):
  with Session() as s:
    avg = s.scalars(select(func.avg(Price.value))).one() or value
  return value < avg * (1 - drop_pct / 100)

def handle_deal(day, value, avg):
  send(f"*Promo!* {day:%d/%m} - R$ {value:,.0f}\n"
       f"Média: R$ {avg:,.0f}")