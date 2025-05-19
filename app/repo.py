from datetime import date
from app.models import Session, Route, Price

def add_route(orig, dest, d0, d1):
  with Session.begin() as s:
    r = Route(origin=orig, dest=dest, start=d0, end=d1)
    s.add(r); s.flush()
    return r.id
  
def list_routes():
  with Session() as s:
    return s.query(Route).order_by(Route.id).all()
  
def toggle_route(rid, on):
  with Session.begin() as s:
    r = s.get(Route, rid); r.active = on
    
def delete_route(rid):
  with Session.begin() as s:
    r = s.get(Route, rid); s.delete(r)
    
def save_price(rid, day, price):
  with Session.begin() as s:
    s.merge(Price(route_id=rid, day=day, value=price))