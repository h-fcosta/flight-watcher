import logging
import requests
from typing import Optional
from config import settings

logger = logging.getLogger(__name__)

class TelegramService:
    def __init__(self):
        self.token = settings.telegram_bot_token
        self.chat_id = settings.telegram_chat_id
        self.enabled = bool(self.token and self.chat_id)
        
        if not self.enabled:
            logger.warning("Telegram não configurado - notificações desabilitadas")
    
    def send_message(self, message: str, parse_mode: str = "Markdown") -> bool:
        """
        Envia uma mensagem via Telegram
        """
        if not self.enabled:
            logger.debug("Telegram desabilitado - mensagem não enviada")
            return False
        
        try:
            url = f"https://api.telegram.org/bot{self.token}/sendMessage"
            
            payload = {
                "chat_id": self.chat_id,
                "text": message,
                "parse_mode": parse_mode
            }
            
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            
            logger.info("Mensagem enviada via Telegram")
            return True
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao enviar mensagem Telegram: {e}")
            return False
        except Exception as e:
            logger.error(f"Erro inesperado no Telegram: {e}")
            return False
    
    def test_connection(self) -> dict:
        """
        Testa a conexão com o Telegram
        """
        if not self.enabled:
            return {
                "success": False,
                "error": "Telegram não configurado"
            }
        
        try:
            # Testar com getMe
            url = f"https://api.telegram.org/bot{self.token}/getMe"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                bot_info = response.json()
                
                # Testar envio de mensagem
                test_message = "🤖 Teste de conexão - Flight Watcher funcionando!"
                send_success = self.send_message(test_message)
                
                return {
                    "success": send_success,
                    "bot_info": bot_info.get("result", {}),
                    "message": "Conexão testada com sucesso" if send_success else "Falha ao enviar mensagem"
                }
            else:
                return {
                    "success": False,
                    "error": f"Token inválido: {response.status_code}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

# Instância global do serviço
telegram_service = TelegramService()
