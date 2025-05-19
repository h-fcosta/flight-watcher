import os, logging
from telegram import Bot
from dotenv import load_dotenv

load_dotenv()

bot = Bot(token=os.getenv("TELEGRAM_TOKEN"))

def send(msg):
  try:
    bot.send_message(chat_id=os.getenv("TG_CHAT_ID"), text=msg)
    logging.info("Alerta enviado ao Telegram")
  except Exception:
    logging.exception("Falha ao enviar alerta")
