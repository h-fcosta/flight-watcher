import os, logging, re
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
from telegram import Update, constants
from telegram.ext import Application, CommandHandler, ContextTypes

from app.repo import add_route, list_routes, toggle_route, delete_route

BOT_TOKEN = os.getenv("TELEGRAM_TOKEN")
ALLOWED_IDS = os.getenv("TG_ALLOWED_IDS", "")
ALLOWED = {int(x) for x in ALLOWED_IDS.split(",") if x.strip().isdigit()}

if not BOT_TOKEN:
    logging.warning("TELEGRAM_TOKEN não configurado - bot desabilitado")
if not ALLOWED:
    logging.warning("TG_ALLOWED_IDS não configurado - nenhum usuário autorizado")


def _auth(func):
    async def wrapper(upd: Update, ctx: ContextTypes.DEFAULT_TYPE):
        if upd.effective_user.id not in ALLOWED:
            await upd.message.reply_text("Acesso Negado")
            return
        await func(upd, ctx)

    return wrapper


@_auth
async def cmd_add(upd: Update, ctx: ContextTypes.DEFAULT_TYPE):
    try:
        o, d, s, e = ctx.args
        rid = add_route(
            o.upper(),
            d.upper(),
            datetime.fromisoformat(s).date(),
            datetime.fromisoformat(e).date(),
        )
        await upd.message.reply_text(f"ROTA #{rid} criada")
    except Exception as ex:
        await upd.message.reply_text(f"Uso: /add ORIG DEST AAAA-MM-DD AAAA-MM-DD\n{ex}")


@_auth
async def cmd_list(upd: Update, ctx: ContextTypes.DEFAULT_TYPE):
    rows = list_routes()
    if not rows:
        await upd.message.reply_text("Nenhuma rota.")
        return
    msg = "*Rotas* 📋\n" + "\n".join(
        f"`#{r.id:02d}` {r.origin}-{r.dest} {r.start}→{r.end} "
        f"[{'on' if r.active else 'off'}]"
        for r in rows
    )
    await upd.message.reply_text(msg, parse_mode=constants.ParseMode.MARKDOWN)


@_auth
async def cmd_toggle(upd: Update, ctx: ContextTypes.DEFAULT_TYPE):
    try:
        rid, flag = ctx.args
        toggle_route(int(rid), flag.lower() == "on")
        await upd.message.reply_text("Atualizado")
    except Exception:
        await upd.message.reply_text("Uso: /toggle ID on|off")


@_auth
async def cmd_del(upd: Update, ctx: ContextTypes.DEFAULT_TYPE):
    try:
        delete_route(int(ctx.args[0]))
        await upd.message.reply_text("Deletado.")
    except Exception:
        await upd.message.reply_text("Uso: /del ID")


def make_bot():
    if not BOT_TOKEN:
        logging.error("TELEGRAM_TOKEN não configurado")
        return None

    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("add", cmd_add))
    app.add_handler(CommandHandler("list", cmd_list))
    app.add_handler(CommandHandler("toggle", cmd_toggle))
    app.add_handler(CommandHandler("del", cmd_del))
    return app
