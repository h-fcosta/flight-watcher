import os, dotenv; dotenv.load_dotenv()
from datetime import date, timedelta
from apscheduler.schedulers.blocking import BlockingScheduler

from app.fetcher import cheapest_on
from app.store import save_price
from app.alert import is_deal

origin, dest = os.getenv("ORIGIN"), os.getenv("DEST")
sched =BlockingScheduler()

def job():
  for delta in range(0,5):
    day = date.today() + timedelta(days=delta + 60)
    price = cheapest_on(day, origin, dest)
    if price:
      save_price(day, price)
      if is_deal(day, price):
        print(f">>>{day} preço bom: R$ {price:.0f}")

sched.add_job(job, "interval", hours=6, jitter=600)
sched.start()