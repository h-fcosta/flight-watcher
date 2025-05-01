import os, dotenv
dotenv.load_dotenv()
from app.fetcher import cheapest_on
from app.store import save_price
from app.alert import is_deal
from datetime import date

d = date(2025, 7, 20)
p = cheapest_on(d, os.getenv("ORIGIN"), os.getenv("DEST"))
save_price(d, p)

print("Gravado!")

if is_deal(d, p):
  print(">>> NEGÓCIO! Preço abaixo da média")