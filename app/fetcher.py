from dotenv import load_dotenv
load_dotenv()

import os
from datetime import date
from amadeus import Client

amadeus = Client(
  client_id=os.getenv("AMADEUS_KEY"),
  client_secret=os.getenv("AMADEUS_SECRET"))

def cheapest_on(day: date, origin: str, dest: str) -> float | None:
  """Retorna o menor preço para 'day' ou None se não houver oferta."""
  resp = amadeus.shopping.flight_offers_search.get(
    originLocationCode=origin,
    destinationLocationCode=dest,
    departureDate=day.isoformat(),
    adults=2,
    currencyCode="BRL",
    max=20
  )

  if not resp.data:
    return None
  return min(float(o['price']['grandTotal']) for o in resp.data)