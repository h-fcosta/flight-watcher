from fastapi import FastAPI, Request, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from contextlib import asynccontextmanager

from config import settings
from api.database import create_tables
from api.routers import routes, prices, deals, status
from api.services.scheduler import start_scheduler, stop_scheduler

# Configurar logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerenciar ciclo de vida da aplicação"""
    # Startup
    logger.info("Iniciando Flight Watcher API...")

    # Criar tabelas do banco
    create_tables()
    logger.info("Banco de dados inicializado")

    # Iniciar scheduler de jobs
    start_scheduler()
    logger.info("Scheduler iniciado")

    yield

    # Shutdown
    logger.info("Parando Flight Watcher API...")
    stop_scheduler()
    logger.info("Scheduler parado")


# Criar aplicação FastAPI
app = FastAPI(
    title=settings.app_name,
    description="API para monitoramento de preços de passagens aéreas",
    version=settings.app_version,
    lifespan=lifespan,
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar domínios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Arquivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Incluir routers da API
app.include_router(routes.router, prefix="/api/routes", tags=["Routes"])
app.include_router(prices.router, prefix="/api/prices", tags=["Prices"])
app.include_router(deals.router, prefix="/api/deals", tags=["Deals"])
app.include_router(status.router, prefix="/api/status", tags=["Status"])


# Rotas da interface web
@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Dashboard principal"""
    return templates.TemplateResponse(
        "dashboard.html", {"request": request, "title": "Flight Watcher - Dashboard"}
    )


@app.get("/routes", response_class=HTMLResponse)
async def routes_page(request: Request):
    """Página de gerenciamento de rotas"""
    return templates.TemplateResponse(
        "routes.html", {"request": request, "title": "Gerenciar Rotas"}
    )


@app.get("/deals", response_class=HTMLResponse)
async def deals_page(request: Request):
    """Página de promoções"""
    return templates.TemplateResponse(
        "deals.html", {"request": request, "title": "Promoções Encontradas"}
    )


@app.get("/charts/{route_id}", response_class=HTMLResponse)
async def chart_page(request: Request, route_id: int):
    """Página de gráfico para uma rota específica"""
    return templates.TemplateResponse(
        "chart.html",
        {
            "request": request,
            "title": f"Gráfico - Rota #{route_id}",
            "route_id": route_id,
        },
    )


# Endpoint de informações
@app.get("/info")
async def app_info():
    """Informações sobre a aplicação"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.amadeus_env,
        "debug": settings.debug,
    }


if __name__ == "__main__":
    uvicorn.run(
        "main_api:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info",
    )
