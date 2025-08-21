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
    
    # Configurações da API Amadeus (compatibilidade com formatos antigos)
    amadeus_client_id: Optional[str] = None
    amadeus_client_secret: Optional[str] = None
    amadeus_key: Optional[str] = None  # Formato antigo
    amadeus_secret: Optional[str] = None  # Formato antigo
    amadeus_env: str = "test"  # test ou production
    
    # Configurações do Telegram (compatibilidade com formatos antigos)
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    telegram_token: Optional[str] = None  # Formato antigo
    tg_chat_id: Optional[str] = None  # Formato antigo
    
    # Configurações de teste
    origin: Optional[str] = "GRU"
    dest: Optional[str] = "JFK"
    
    # Configurações do scheduler
    job_interval_hours: int = 6
    job_jitter_seconds: int = 600
    
    # Configurações de alertas
    deal_threshold_percent: int = 10
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignorar campos extras
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Compatibilidade com formatos antigos
        if not self.amadeus_client_id and self.amadeus_key:
            self.amadeus_client_id = self.amadeus_key
        if not self.amadeus_client_secret and self.amadeus_secret:
            self.amadeus_client_secret = self.amadeus_secret
        if not self.telegram_bot_token and self.telegram_token:
            self.telegram_bot_token = self.telegram_token
        if not self.telegram_chat_id and self.tg_chat_id:
            self.telegram_chat_id = self.tg_chat_id

# Instância global das configurações
settings = Settings()
