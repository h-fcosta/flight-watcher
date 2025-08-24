from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from api.database import get_db
from api.schemas import Deal
from api.services.alerts import alert_service

router = APIRouter()


@router.get("/", response_model=List[Deal])
def list_deals(
    days: int = Query(30, ge=1, le=365, description="Últimos N dias"),
    limit: int = Query(50, ge=1, le=200, description="Limite de resultados"),
    db: Session = Depends(get_db),
):
    """
    Lista as promoções encontradas nos últimos dias
    """
    deals = alert_service.get_recent_deals(db, days=days, limit=limit)
    return deals


@router.get("/summary")
def get_deals_summary(
    days: int = Query(7, ge=1, le=365), db: Session = Depends(get_db)
):
    """
    Resumo de promoções por período
    """
    deals = alert_service.get_recent_deals(db, days=days, limit=1000)

    if not deals:
        return {
            "total_deals": 0,
            "best_deal": None,
            "avg_discount": 0,
            "routes_with_deals": 0,
        }

    # Calcular estatísticas
    discounts = [deal.discount_percent for deal in deals]
    routes = set(deal.route.id for deal in deals)
    best_deal = max(deals, key=lambda d: d.discount_percent)

    return {
        "total_deals": len(deals),
        "best_deal": {
            "route": f"{best_deal.route.origin} → {best_deal.route.dest}",
            "day": best_deal.day.isoformat(),
            "price": best_deal.price,
            "discount_percent": best_deal.discount_percent,
        },
        "avg_discount": sum(discounts) / len(discounts),
        "routes_with_deals": len(routes),
    }
