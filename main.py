import logging, pathlib, logging.handlers
from datetime import date, timedelta, datetime
import os, dotenv
from apscheduler.schedulers.blocking import BlockingScheduler

#LOGGING ROTATIVO
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

#CARREGAR VARIÁVEIS & IMPORTS DA APP
dotenv.load_dotenv()
from app.fetcher import cheapest_on
from app.store import save_price
from app.alert import is_deal, handle_deal

origin, dest = os.getenv("ORIGIN"), os.getenv("DEST")

#DEFINIR O JOB
def job():
  for delta in range(0,5):
    day = date.today() + timedelta(days=delta + 60)
    price = cheapest_on(day, origin, dest)
    if not price:
      continue
  save_price(day, price)
  if is_deal(day, price):
    handle_deal(day, price, avg = price)
    
#AGENDAR: EXEECUÇÃO IMEDIATA + INTERVALO DE 6H
sched = BlockingScheduler()
sched.add_job(
  job, 
  trigger="interval", 
  hours=6, 
  jitter=600,
  next_run_time=datetime.now()
)
sched.start()