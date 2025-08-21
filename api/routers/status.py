from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from api.database import get_db
from api.models import Route, Price, JobLog
from api.schemas import SystemStats
from api.services.amadeus import amadeus_service
from api.services.telegram import telegram_service

router = APIRouter()


@router.get("/health")
def health_check():
    """
    Endpoint básico de health check
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Flight Watcher API",
    }


@router.get("/stats", response_model=SystemStats)
def get_system_stats(db: Session = Depends(get_db)):
    """
    Estatísticas gerais do sistema
    """
    # Contar rotas
    total_routes = db.query(func.count(Route.id)).scalar() or 0
    active_routes = (
        db.query(func.count(Route.id)).filter(Route.active == True).scalar() or 0
    )

    # Contar preços
    total_prices = db.query(func.count(Price.id)).scalar() or 0

    # Últimos 30 dias - contar como deals (simplificado)
    thirty_days_ago = datetime.now().date() - timedelta(days=30)
    recent_prices = (
        db.query(func.count(Price.id)).filter(Price.day >= thirty_days_ago).scalar()
        or 0
    )

    # Último job
    last_job = db.query(JobLog).order_by(JobLog.started_at.desc()).first()
    last_job_run = last_job.started_at.isoformat() if last_job else None

    # Status do sistema
    amadeus_status = "OK" if amadeus_service.is_client_ready() else "ERROR"
    telegram_status = "OK" if telegram_service.enabled else "DISABLED"

    system_status = "OK" if amadeus_status == "OK" else "DEGRADED"

    return SystemStats(
        total_routes=total_routes,
        active_routes=active_routes,
        total_prices=total_prices,
        total_deals=recent_prices,  # Simplificado
        last_job_run=last_job_run,
        system_status=system_status,
    )


@router.get("/services")
def get_services_status():
    """
    Status detalhado dos serviços
    """
    return {
        "amadeus": {
            "status": "OK" if amadeus_service.is_client_ready() else "ERROR",
            "environment": (
                "test"
                if amadeus_service.client
                and hasattr(amadeus_service.client, "hostname")
                else "production"
            ),
        },
        "telegram": {
            "status": "OK" if telegram_service.enabled else "DISABLED",
            "configured": bool(telegram_service.token and telegram_service.chat_id),
        },
        "database": {
            "status": "OK",  # Se chegou até aqui, DB está funcionando
            "type": "SQLite",
        },
    }


@router.post("/test/telegram")
def test_telegram():
    """
    Testa a conexão com o Telegram
    """
    return telegram_service.test_connection()


@router.post("/test/amadeus")
def test_amadeus(db: Session = Depends(get_db)):
    """
    Testa a conexão com a API Amadeus
    """
    if not amadeus_service.is_client_ready():
        return {"success": False, "error": "Cliente Amadeus não inicializado"}

    try:
        from datetime import date
        from config import settings

        # Usar configurações padrão para teste
        origin = settings.origin or "GRU"
        dest = settings.dest or "JFK"
        test_date = date.today() + timedelta(days=30)

        price = amadeus_service.get_cheapest_price(test_date, origin, dest)

        if price:
            return {
                "success": True,
                "message": f"Teste bem-sucedido: {origin} → {dest} em {test_date}",
                "price": price,
            }
        else:
            return {
                "success": False,
                "error": "Nenhum preço retornado (pode ser normal)",
            }

    except Exception as e:
        return {"success": False, "error": str(e)}
