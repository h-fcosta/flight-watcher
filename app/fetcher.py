from __future__ import annotations
from datetime import date
import os, time, logging
from dotenv import load_dotenv
from amadeus import Client, ResponseError

load_dotenv()

amadeus_key = os.getenv("AMADEUS_KEY")
amadeus_secret = os.getenv("AMADEUS_SECRET")
amadeus_env = os.getenv("AMADEUS_ENV", "test")  # test ou production

if not amadeus_key or not amadeus_secret:
    logging.error("AMADEUS_KEY ou AMADEUS_SECRET não configurados")
    _amadeus = None
else:
    try:
        if amadeus_env.lower() == "production":
            _amadeus = Client(
                client_id=amadeus_key,
                client_secret=amadeus_secret,
                # hostname padrão = production
            )
            logging.info(
                "Cliente Amadeus inicializado com sucesso (ambiente de produção)"
            )
        else:
            _amadeus = Client(
                client_id=amadeus_key, client_secret=amadeus_secret, hostname="test"
            )
            logging.info("Cliente Amadeus inicializado com sucesso (ambiente de teste)")
    except Exception as e:
        logging.error("Erro ao inicializar cliente Amadeus: %s", e)
        _amadeus = None


def cheapest_on(
    day: date, origin: str, dest: str, max_retry: int = 3, backoff_base: int = 2
) -> float | None:
    """
    Consulta a API até `max_retry` vezes com back‑off exponencial.
    Retorna o menor preço ou None caso não haja oferta.
    """
    if not _amadeus:
        logging.error("Cliente Amadeus não inicializado")
        return None

    for attempt in range(max_retry):
        try:
            logging.debug(
                "Consultando Amadeus %s -> %s (%s) - tentativa %d/%d",
                origin,
                dest,
                day,
                attempt + 1,
                max_retry,
            )
            resp = _amadeus.shopping.flight_offers_search.get(
                originLocationCode=origin,
                destinationLocationCode=dest,
                departureDate=day.isoformat(),
                adults=2,
                currencyCode="BRL",
                max=20,
            )
            break
        except ResponseError as e:
            wait = backoff_base**attempt
            logging.warning(
                "Falha Amadeus (%s). Tentativa %s/%s - retry em %ss",
                e,
                attempt + 1,
                max_retry,
                wait,
            )
            if attempt < max_retry - 1:  # Não esperar na última tentativa
                time.sleep(wait)
        except Exception as e:
            logging.error("Erro inesperado na API Amadeus: %s", e)
            return None
    else:
        logging.error("API Amadeus indisponível após %s tentativas", max_retry)
        return None

    if not resp.data:
        logging.info("Nenhuma oferta para %s -> %s em %s", origin, dest, day)
        return None

    try:
        cheapest = min(float(o["price"]["grandTotal"]) for o in resp.data)
        logging.debug("Menor preço encontrado: R$ %.2f", cheapest)
        return cheapest
    except (KeyError, ValueError, TypeError) as e:
        logging.error("Erro ao processar resposta da API: %s", e)
        return None
    return cheapest
