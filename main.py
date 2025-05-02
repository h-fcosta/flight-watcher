import logging, pathlib
import logging.handlers

logdir = pathlib.Path("logs"); logdir.mkdir(exist_ok=True)
logging.basicConfig(
  level=logging.INFO,
  format="%(asctime)s | %(levelname)s | %(message)s",
  handlers=[
    logging.handlers.RotatingFileHandler(
      logdir / "flightbot.log", maxBytes=200_000, backupCount=3),
    logging.StreamHandler()
  ]
)

import os, dotenv; dotenv.load_dotenv()
from datetime import date, timedelta
from apscheduler.schedulers.blocking import BlockingScheduler

from app.fetcher import cheapest_on
from app.store import save_price
from app.alert import is_deal, handle_deal

origin, dest = os.getenv("ORIGIN"), os.getenv("DEST")
sched =BlockingScheduler()

def job():
  for delta in range(0,5):
    day = date.today() + timedelta(days=delta + 60)
    price = cheapest_on(day, origin, dest)
    if price:
      save_price(day, price)
      if is_deal(day, price):
        handle_deal(day, price, avg=price)

sched.add_job(job, "interval", hours=6, jitter=600)
sched.start()