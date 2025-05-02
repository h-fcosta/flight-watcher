import os, logging
from telegram import Bot
from dotenv import load_dotenv

load_dotenv()

_bot = Bot(token=os.getenv("TELEGRAM_TOKEN"))
_CHAT = os.getenv("TG_CHAT_ID")

def send(msg: str):
  try:
    _bot.send_message(chat_id=os.getenv("TG_CHAT_ID"), text=msg)
    logging.info("Enviada notificação Telegram")
  except Exception:
    logging.exception("Falha ao enviar ao Telegram")