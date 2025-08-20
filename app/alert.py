from sqlalchemy import select, func
from app.models import Session, Price
from app.notifier import send


def is_deal(day, value, route_id, drop_pct=10):
    with Session() as s:
        avg = (
            s.scalars(
                select(func.avg(Price.value)).where(Price.route_id == route_id)
            ).one()
            or value
        )
    return value < avg * (1 - drop_pct / 100)


def handle_deal(route, day, value):
    with Session() as s:
        avg = (
            s.scalars(
                select(func.avg(Price.value)).where(Price.route_id == route.id)
            ).one()
            or value
        )
    send(
        f"*Promo!* {route.origin}-{route.dest} {day:%d/%m} - R$ {value:,.0f}\n"
        f"Média: R$ {avg:,.0f}"
    )
