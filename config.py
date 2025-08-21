from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path


class Settings(BaseSettings):
    # Configurações do FastAPI
    app_name: str = "Flight Watcher"
    app_version: str = "2.0.0"
    debug: bool = True

    # Configurações do banco de dados
    database_url: str = f"sqlite:///{Path(__file__).parent / 'prices.db'}"

    # Configurações da API Amadeus
    amadeus_client_id: str
    amadeus_client_secret: str
    amadeus_env: str = "test"  # test ou production

    # Configurações do Telegram (opcionais)
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None

    # Configurações do scheduler
    job_interval_hours: int = 6
    job_jitter_seconds: int = 600

    # Configurações de alertas
    deal_threshold_percent: int = 10

    # Configurações do servidor
    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"
        case_sensitive = False


# Instância global das configurações
settings = Settings()
