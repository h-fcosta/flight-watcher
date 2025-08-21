from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from api.database import get_db
from api.models import Route as RouteModel, Price as PriceModel
from api.schemas import Route, RouteCreate, RouteUpdate, SuccessResponse, RouteStats
from sqlalchemy import func

router = APIRouter()


@router.get("/", response_model=List[Route])
def list_routes(
    skip: int = Query(0, ge=0, description="Pular N registros"),
    limit: int = Query(100, ge=1, le=1000, description="Limitar resultado"),
    active_only: bool = Query(False, description="Apenas rotas ativas"),
    db: Session = Depends(get_db),
):
    """
    Lista todas as rotas cadastradas
    """
    query = db.query(RouteModel)

    if active_only:
        query = query.filter(RouteModel.active == True)

    routes = query.offset(skip).limit(limit).all()
    return routes


@router.get("/{route_id}", response_model=Route)
def get_route(route_id: int, db: Session = Depends(get_db)):
    """
    Busca uma rota específica pelo ID
    """
    route = db.query(RouteModel).filter(RouteModel.id == route_id).first()

    if not route:
        raise HTTPException(status_code=404, detail="Rota não encontrada")

    return route


@router.post("/", response_model=Route)
def create_route(route_data: RouteCreate, db: Session = Depends(get_db)):
    """
    Cria uma nova rota
    """
    # Validar códigos IATA
    if len(route_data.origin) != 3 or len(route_data.dest) != 3:
        raise HTTPException(
            status_code=400, detail="Códigos IATA devem ter exatamente 3 caracteres"
        )

    # Validar datas
    if route_data.start > route_data.end:
        raise HTTPException(
            status_code=400, detail="Data de início deve ser anterior à data de fim"
        )

    if route_data.start < date.today():
        raise HTTPException(
            status_code=400, detail="Data de início não pode ser no passado"
        )

    # Verificar se já existe rota similar
    existing = (
        db.query(RouteModel)
        .filter(
            RouteModel.origin == route_data.origin.upper(),
            RouteModel.dest == route_data.dest.upper(),
            RouteModel.start == route_data.start,
            RouteModel.end == route_data.end,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409, detail="Já existe uma rota com os mesmos parâmetros"
        )

    # Criar nova rota
    route = RouteModel(
        origin=route_data.origin.upper(),
        dest=route_data.dest.upper(),
        start=route_data.start,
        end=route_data.end,
        active=route_data.active,
    )

    db.add(route)
    db.commit()
    db.refresh(route)

    return route


@router.put("/{route_id}", response_model=Route)
def update_route(route_id: int, route_data: RouteUpdate, db: Session = Depends(get_db)):
    """
    Atualiza uma rota existente
    """
    route = db.query(RouteModel).filter(RouteModel.id == route_id).first()

    if not route:
        raise HTTPException(status_code=404, detail="Rota não encontrada")

    # Atualizar apenas campos fornecidos
    update_data = route_data.dict(exclude_unset=True)

    for field, value in update_data.items():
        if field in ["origin", "dest"] and value:
            value = value.upper()
        setattr(route, field, value)

    db.commit()
    db.refresh(route)

    return route


@router.delete("/{route_id}", response_model=SuccessResponse)
def delete_route(route_id: int, db: Session = Depends(get_db)):
    """
    Deleta uma rota (e todos os preços associados)
    """
    route = db.query(RouteModel).filter(RouteModel.id == route_id).first()

    if not route:
        raise HTTPException(status_code=404, detail="Rota não encontrada")

    db.delete(route)
    db.commit()

    return SuccessResponse(message=f"Rota #{route_id} deletada com sucesso")


@router.post("/{route_id}/toggle", response_model=Route)
def toggle_route(route_id: int, db: Session = Depends(get_db)):
    """
    Alterna o status ativo/inativo da rota
    """
    route = db.query(RouteModel).filter(RouteModel.id == route_id).first()

    if not route:
        raise HTTPException(status_code=404, detail="Rota não encontrada")

    route.active = not route.active
    db.commit()
    db.refresh(route)

    return route


@router.get("/{route_id}/stats", response_model=RouteStats)
def get_route_stats(route_id: int, db: Session = Depends(get_db)):
    """
    Retorna estatísticas de uma rota
    """
    route = db.query(RouteModel).filter(RouteModel.id == route_id).first()

    if not route:
        raise HTTPException(status_code=404, detail="Rota não encontrada")

    # Calcular estatísticas
    stats_query = db.query(
        func.count(PriceModel.id).label("total"),
        func.min(PriceModel.value).label("min_price"),
        func.max(PriceModel.value).label("max_price"),
        func.avg(PriceModel.value).label("avg_price"),
        func.max(PriceModel.day).label("last_update"),
    ).filter(PriceModel.route_id == route_id)

    stats = stats_query.first()

    return RouteStats(
        route_id=route_id,
        route=route,
        total_prices=stats.total or 0,
        min_price=stats.min_price,
        max_price=stats.max_price,
        avg_price=stats.avg_price,
        last_update=stats.last_update,
    )
