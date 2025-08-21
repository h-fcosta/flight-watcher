from datetime import date
import os
import time
import logging
from typing import Optional
from amadeus import Client, ResponseError
from config import settings

logger = logging.getLogger(__name__)

class AmadeusService:
    def __init__(self):
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Inicializa o cliente Amadeus com as configurações"""
        if not settings.amadeus_client_id or not settings.amadeus_client_secret:
            logger.error("AMADEUS_CLIENT_ID ou AMADEUS_CLIENT_SECRET não configurados")
            return
        
        try:
            client_config = {
                'client_id': settings.amadeus_client_id,
                'client_secret': settings.amadeus_client_secret
            }
            
            if settings.amadeus_env.lower() != "production":
                client_config['hostname'] = 'test'
            
            self.client = Client(**client_config)
            
            env_name = "teste" if settings.amadeus_env.lower() != "production" else "produção"
            logger.info(f"Cliente Amadeus inicializado (ambiente: {env_name})")
            
        except Exception as e:
            logger.error(f"Erro ao inicializar cliente Amadeus: {e}")
            self.client = None
    
    def get_cheapest_price(
        self, 
        day: date, 
        origin: str, 
        dest: str, 
        max_retry: int = 3,
        backoff_base: int = 2
    ) -> Optional[float]:
        """
        Busca o menor preço para uma rota em uma data específica
        """
        if not self.client:
            logger.error("Cliente Amadeus não está inicializado")
            return None
        
        for attempt in range(max_retry):
            try:
                logger.debug(
                    f"Consultando Amadeus {origin} -> {dest} ({day}) - tentativa {attempt + 1}/{max_retry}"
                )
                
                response = self.client.shopping.flight_offers_search.get(
                    originLocationCode=origin,
                    destinationLocationCode=dest,
                    departureDate=day.isoformat(),
                    adults=2,
                    currencyCode="BRL",
                    max=20
                )
                
                if not response.data:
                    logger.info(f"Nenhuma oferta encontrada para {origin}-{dest} em {day}")
                    return None
                
                # Encontrar o menor preço
                prices = [float(offer["price"]["grandTotal"]) for offer in response.data]
                cheapest = min(prices)
                
                logger.debug(f"Menor preço encontrado: R$ {cheapest:.2f}")
                return cheapest
                
            except ResponseError as e:
                wait_time = backoff_base ** attempt
                logger.warning(
                    f"Erro na API Amadeus ({e}). Tentativa {attempt + 1}/{max_retry} - "
                    f"aguardando {wait_time}s"
                )
                
                if attempt < max_retry - 1:
                    time.sleep(wait_time)
                    
            except Exception as e:
                logger.error(f"Erro inesperado na API Amadeus: {e}")
                return None
        
        logger.error(f"API Amadeus indisponível após {max_retry} tentativas")
        return None
    
    def is_client_ready(self) -> bool:
        """Verifica se o cliente está pronto para uso"""
        return self.client is not None

# Instância global do serviço
amadeus_service = AmadeusService()
