import os
import requests
import dotenv

dotenv.load_dotenv()

TOKEN = os.getenv("TELEGRAM_TOKEN")
CHAT_ID = os.getenv("TG_CHAT_ID")

if not TOKEN or not CHAT_ID:
    raise RuntimeError("TELEGRAM_TOKEN ou TG_CHAT_ID ausente no .env")

MESSAGE = "Bot configurado com sucesso!"

response = requests.get(
    f"https://api.telegram.org/bot{TOKEN}/sendMessage",
    params={"chat_id": CHAT_ID, "text": MESSAGE, "parse_mode": "Markdown"},
)

print("Status HTTP:", response.status_code)
print("Resposta JSON:", response.json())
