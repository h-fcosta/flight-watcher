from __future__ import annotations
from datetime import date
import os, time, logging
from dotenv import load_dotenv
from amadeus import Client, ResponseError

load_dotenv()

_amadeus = Client(
  client_id = os.getenv("AMADEUS_KEY"),
  client_secret = os.getenv("AMADEUS_SECRET")
)

def cheapest_on(
  day: date,
  origin: str,
  dest: str,
  max_retry: int = 3,
  backoff_base: int = 2
) -> float | None:
  """
  Consulta a API até `max_retry` vezes com back‑off exponencial.
  Retorna o menor preço ou None caso não haja oferta.
  """
  for attempt in range(max_retry):
    try:
      logging.debug("Consultando Amadeus %s -> %s (%s)", origin, dest, day) 
      resp = _amadeus.shopping.flight_offers_search.get(
        originLocationCode = origin,
        destinationLocationCode = dest,
        departureDate = day.isoformat(),
        adults = 2,
        currencyCode = 'BRL',
        max=20
      )
      break
    except ResponseError as e:
      wait = backoff_base ** attempt
      logging.warning("Falha Amadeus (%s). Tentativa %s/%s - retry em %ss",
                      e, attempt + 1, max_retry, wait)
      time.sleep(wait)
  else:
    logging.error("API Amadeus indisponível após %s tentativas", max_retry)
    return None
  
  if not resp.data:
    logging.info("Nenhuma oferta para %s", day)
    return None
  
  cheapest = min(float(o["price"]["grandTotal"]) for o in resp.data)
  return cheapest
  
      