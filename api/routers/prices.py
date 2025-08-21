from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import date, datetime, timedelta

from api.database import get_db
from api.models import Price as PriceModel, Route as RouteModel
from api.schemas import Price, PriceCreate

router = APIRouter()


@router.get("/", response_model=List[Price])
def list_prices(
    route_id: Optional[int] = Query(None, description="Filtrar por rota"),
    start_date: Optional[date] = Query(None, description="Data inicial"),
    end_date: Optional[date] = Query(None, description="Data final"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """
    Lista preços com filtros opcionais
    """
    query = db.query(PriceModel).join(RouteModel)

    if route_id:
        query = query.filter(PriceModel.route_id == route_id)

    if start_date:
        query = query.filter(PriceModel.day >= start_date)

    if end_date:
        query = query.filter(PriceModel.day <= end_date)

    prices = query.order_by(PriceModel.day.desc()).offset(skip).limit(limit).all()
    return prices


@router.get("/route/{route_id}", response_model=List[Price])
def get_route_prices(
    route_id: int,
    days: int = Query(30, ge=1, le=365, description="Últimos N dias"),
    db: Session = Depends(get_db),
):
    """
    Busca preços de uma rota específica
    """
    # Verificar se a rota existe
    route = db.query(RouteModel).filter(RouteModel.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Rota não encontrada")

    # Buscar preços dos últimos N dias
    cutoff_date = datetime.now().date() - timedelta(days=days)

    prices = (
        db.query(PriceModel)
        .filter(and_(PriceModel.route_id == route_id, PriceModel.day >= cutoff_date))
        .order_by(PriceModel.day.desc())
        .all()
    )

    return prices


@router.get("/route/{route_id}/chart")
def get_price_chart_data(
    route_id: int, days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db)
):
    """
    Retorna dados formatados para gráfico de preços
    """
    route = db.query(RouteModel).filter(RouteModel.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Rota não encontrada")

    cutoff_date = datetime.now().date() - timedelta(days=days)

    prices = (
        db.query(PriceModel)
        .filter(and_(PriceModel.route_id == route_id, PriceModel.day >= cutoff_date))
        .order_by(PriceModel.day.asc())
        .all()
    )

    # Formatar dados para gráfico
    chart_data = {
        "route": f"{route.origin} → {route.dest}",
        "dates": [price.day.isoformat() for price in prices],
        "prices": [price.value for price in prices],
        "average": None,
        "min_price": None,
        "max_price": None,
    }

    if prices:
        price_values = [p.value for p in prices]
        chart_data["average"] = sum(price_values) / len(price_values)
        chart_data["min_price"] = min(price_values)
        chart_data["max_price"] = max(price_values)

    return chart_data


@router.get("/summary")
def get_prices_summary(
    days: int = Query(7, ge=1, le=365), db: Session = Depends(get_db)
):
    """
    Resumo de preços por rota nos últimos N dias
    """
    cutoff_date = datetime.now().date() - timedelta(days=days)

    # Agregar preços por rota
    summary = (
        db.query(
            RouteModel.id,
            RouteModel.origin,
            RouteModel.dest,
            RouteModel.active,
            func.count(PriceModel.id).label("total_prices"),
            func.min(PriceModel.value).label("min_price"),
            func.max(PriceModel.value).label("max_price"),
            func.avg(PriceModel.value).label("avg_price"),
            func.max(PriceModel.day).label("last_update"),
        )
        .outerjoin(
            PriceModel,
            and_(PriceModel.route_id == RouteModel.id, PriceModel.day >= cutoff_date),
        )
        .group_by(RouteModel.id)
        .all()
    )

    return [
        {
            "route_id": row.id,
            "route": f"{row.origin} → {row.dest}",
            "active": row.active,
            "total_prices": row.total_prices or 0,
            "min_price": row.min_price,
            "max_price": row.max_price,
            "avg_price": row.avg_price,
            "last_update": row.last_update.isoformat() if row.last_update else None,
        }
        for row in summary
    ]


@router.post("/", response_model=Price)
def create_price(price_data: PriceCreate, db: Session = Depends(get_db)):
    """
    Adiciona um novo preço (usado internamente pelo sistema)
    """
    # Verificar se a rota existe
    route = db.query(RouteModel).filter(RouteModel.id == price_data.route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Rota não encontrada")

    # Verificar se já existe preço para esta data
    existing = (
        db.query(PriceModel)
        .filter(
            and_(
                PriceModel.route_id == price_data.route_id,
                PriceModel.day == price_data.day,
            )
        )
        .first()
    )

    if existing:
        # Atualizar preço existente
        existing.value = price_data.value
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Criar novo preço
        price = PriceModel(
            route_id=price_data.route_id, day=price_data.day, value=price_data.value
        )

        db.add(price)
        db.commit()
        db.refresh(price)
        return price
