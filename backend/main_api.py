from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from contextlib import asynccontextmanager

from config import settings
from api.database import create_tables
from api.routers import routes, prices, deals, status, offers
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
    description="""
    ## Flight Watcher - Sistema de Monitoramento de Preços de Passagens Aéreas

    Esta API permite monitorar preços de passagens aéreas em tempo real, criando alertas quando 
    encontra preços abaixo do esperado.

    ### Principais Funcionalidades:
    * 🛫 **Gerenciamento de Rotas**: Cadastro e controle de rotas aéreas para monitoramento
    * 💰 **Busca Automática de Preços**: Integração com API Amadeus para obter preços em tempo real
    * 📊 **Histórico de Preços**: Armazenamento e visualização do histórico de preços
    * 🔔 **Sistema de Alertas**: Notificações quando preços atingem limites desejados
    * 📈 **Dashboard Web**: Interface completa para gerenciamento via navegador
    
    ### Tecnologias Utilizadas:
    * **Backend**: FastAPI + SQLAlchemy + SQLite
    * **Frontend**: Bootstrap 5 + JavaScript
    * **API Externa**: Amadeus API para dados de voos
    * **Agendamento**: APScheduler para execução automática
    * **Notificações**: Telegram Bot (opcional)
    
    ### Versão: 1.0.0
    Primeira versão estável com todas as funcionalidades básicas implementadas.
    """,
    version="1.0.0",
    lifespan=lifespan,
    contact={
        "name": "Flight Watcher",
        "url": "https://github.com/h-fcosta/flight-watcher",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",  # Em produção, especificar apenas domínios necessários
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers da API
app.include_router(routes.router, prefix="/api/routes", tags=["Routes"])
app.include_router(prices.router, prefix="/api/prices", tags=["Prices"])
app.include_router(deals.router, prefix="/api/deals", tags=["Deals"])
app.include_router(status.router, prefix="/api/status", tags=["Status"])
app.include_router(offers.router, prefix="/api", tags=["Flight Offers"])


# Endpoint raiz apenas para verificação da API
@app.get("/")
async def root():
    """Endpoint raiz da API"""
    return {
        "message": "Flight Watcher API v2.0",
        "status": "running",
        "docs": "/docs",
        "frontend": "React app served separately on port 5173",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main_api:app", host="0.0.0.0", port=8001, reload=True, log_level="info"
    )
