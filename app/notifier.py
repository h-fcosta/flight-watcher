import os, logging, asyncio
import requests
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("TELEGRAM_TOKEN")
CHAT_ID = os.getenv("TG_CHAT_ID")


def send(msg):
    try:
        response = requests.post(
            f"https://api.telegram.org/bot{TOKEN}/sendMessage",
            json={"chat_id": CHAT_ID, "text": msg, "parse_mode": "Markdown"},
        )
        response.raise_for_status()
        logging.info("Alerta enviado ao Telegram")
    except Exception as e:
        logging.exception(f"Falha ao enviar alerta: {e}")
