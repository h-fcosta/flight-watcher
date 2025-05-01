from app.models import Session, Price

def save_price(day, value):
  with Session() as s:
    s.merge(Price(day=day, value=value))
    s.commit()