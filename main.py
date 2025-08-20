import logging, pathlib, logging.handlers
from datetime import date, timedelta, datetime
import os, dotenv
from apscheduler.schedulers.blocking import BlockingScheduler

# LOGGING ROTATIVO
logdir = pathlib.Path("logs")
logdir.mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.handlers.RotatingFileHandler(
            logdir / "flightbot.log", maxBytes=200_000, backupCount=3
        ),
        logging.StreamHandler(),
    ],
)

# CARREGAR VARIÁVEIS & IMPORTS DA APP
dotenv.load_dotenv()

# Validar variáveis de ambiente críticas
required_vars = ["AMADEUS_KEY", "AMADEUS_SECRET"]
missing_vars = [var for var in required_vars if not os.getenv(var)]
if missing_vars:
    logging.error(f"Variáveis de ambiente ausentes: {', '.join(missing_vars)}")
    exit(1)

# Verificar variáveis opcionais do Telegram
telegram_vars = ["TELEGRAM_TOKEN", "TG_CHAT_ID", "TG_ALLOWED_IDS"]
missing_telegram = [var for var in telegram_vars if not os.getenv(var)]
if missing_telegram:
    logging.warning(
        f"Variáveis do Telegram ausentes (bot não funcionará): {', '.join(missing_telegram)}"
    )

from app.fetcher import cheapest_on
from app.alert import is_deal, handle_deal
from app.bot import make_bot
from app.repo import list_routes, save_price

# Inicializar bot em thread separada
import threading

bot_app = make_bot()


def start_bot():
    if bot_app:
        bot_app.run_polling(
            allowed_updates=["message"], stop_signals=None, close_loop=False
        )
    else:
        logging.error("Bot não pôde ser inicializado")


if bot_app:
    bot_thread = threading.Thread(target=start_bot, daemon=True)
    bot_thread.start()
    logging.info("Bot Telegram iniciado em thread separada")
else:
    logging.warning("Bot Telegram não foi iniciado - verifique configurações")

# origin, dest = os.getenv("ORIGIN"), os.getenv("DEST")


# DEFINIR O JOB
def job():
    logging.info("Iniciando job de monitoramento de preços")
    routes_processed = 0
    prices_found = 0
    deals_found = 0

    try:
        routes = list_routes()
        logging.info(f"Processando {len(routes)} rotas")

        for r in routes:
            if not r.active:
                logging.debug(f"Rota #{r.id} {r.origin}-{r.dest} está inativa, pulando")
                continue

            routes_processed += 1
            logging.info(
                f"Processando rota #{r.id}: {r.origin}-{r.dest} ({r.start} a {r.end})"
            )

            for delta in range((r.end - r.start).days + 1):
                day = r.start + timedelta(days=delta)

                try:
                    price = cheapest_on(day, r.origin, r.dest)
                    if price:
                        prices_found += 1
                        save_price(r.id, day, price)
                        logging.debug(f"Preço salvo: {day} = R$ {price:,.2f}")

                        if is_deal(day, price, r.id):
                            deals_found += 1
                            logging.info(f"DEAL encontrado: {day} = R$ {price:,.2f}")
                            handle_deal(r, day, price)
                    else:
                        logging.debug(f"Nenhum preço encontrado para {day}")

                except Exception as e:
                    logging.error(f"Erro ao processar {day} para rota #{r.id}: {e}")

        logging.info(
            f"Job concluído: {routes_processed} rotas, {prices_found} preços, {deals_found} deals"
        )

    except Exception as e:
        logging.error(f"Erro crítico no job: {e}")
        raise

    # for delta in range(0,5):
    #   day = date.today() + timedelta(days=delta + 60)
    #   price = cheapest_on(day, origin, dest)
    #   if not price:
    #     continue
    # save_price(day, price)
    # if is_deal(day, price):
    #   handle_deal(day, price, avg = price)


# AGENDAR: EXEECUÇÃO IMEDIATA + INTERVALO DE 6H
sched = BlockingScheduler()
sched.add_job(
    job, trigger="interval", hours=6, jitter=600, next_run_time=datetime.now()
)
sched.start()
