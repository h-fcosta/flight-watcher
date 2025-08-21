#!/usr/bin/env python3
"""
Teste simples para verificar se o serviço Amadeus está funcionando
"""
import sys
import os

sys.path.append("/home/henrique/dev/flight-watcher")

from datetime import date
from api.services.amadeus import amadeus_service
from config import settings


def test_amadeus():
    print("Testando serviço Amadeus...")
    print(f"Environment: {settings.amadeus_env}")
    print(
        f"Client ID: {settings.amadeus_client_id[:10]}..."
        if settings.amadeus_client_id
        else "None"
    )

    # Verificar se o cliente está pronto
    if not amadeus_service.is_client_ready():
        print("❌ Cliente Amadeus não está inicializado")
        return

    print("✅ Cliente Amadeus inicializado")

    # Testar busca de preço com debugging
    print("Buscando preço GRU -> JFK para 15/12/2025...")

    try:
        price = amadeus_service.get_cheapest_price(
            day=date(2025, 12, 15), origin="GRU", dest="JFK"
        )

        if price:
            print(f"✅ Preço encontrado: R$ {price:.2f}")
        else:
            print("❌ Nenhum preço encontrado")
    except Exception as e:
        print(f"❌ Erro na busca: {e}")

    if price:
        print(f"✅ Preço encontrado: R$ {price:.2f}")
    else:
        print("❌ Nenhum preço encontrado")


if __name__ == "__main__":
    test_amadeus()
