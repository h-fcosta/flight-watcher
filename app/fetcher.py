import time, logging
from dotenv import load_dotenv
load_dotenv()

import os
from datetime import date
from amadeus import Client

amadeus = Client(
  client_id=os.getenv("AMADEUS_KEY"),
  client_secret=os.getenv("AMADEUS_SECRET"))

def cheapest_on(day, origin, dest, max_retry=3):
  for attempt in range(max_retry):
    try:
      resp = amadeus.shopping.flight_offers_search.get(
        originLocationCode=origin,
        destinationLocationCode=dest,
        departureDate=day.isoformat(),
        adults=2, currencyCode="BRL", max=20)
      break
    except Exception as e:
      wait = 2 ** attempt
      logging.warning("Falha Amadeus (%s). Retry em %ss", e, wait)
      time.sleep(wait)
      
  else:
    logging.error("Falhou após %s tentativas", max_retry)
    return None
  
  if not resp.data:
    return None
  return min(float(o['price']['grandTotal']) for o in resp.data)