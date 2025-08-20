from amadeus import Client
import os
from dotenv import load_dotenv
from datetime import date

load_dotenv()

amadeus_key = os.getenv("AMADEUS_KEY")
amadeus_secret = os.getenv("AMADEUS_SECRET")

print("=== TESTE ESPECÍFICO AMBIENTE AMADEUS ===")
print(f"Key: {amadeus_key[:10]}...")
print(f"Secret: {amadeus_secret[:10]}...")

# Testar diferentes formas de configurar ambiente de teste
configs_to_test = [
    {"hostname": "test"},
    {"hostname": "test.api.amadeus.com"},
    {"log_level": "debug", "hostname": "test"},
    {},  # Padrão (produção)
]

for i, config in enumerate(configs_to_test):
    try:
        print(f"\n--- Teste {i+1}: {config} ---")
        client = Client(client_id=amadeus_key, client_secret=amadeus_secret, **config)

        # Tentar fazer uma busca simples
        resp = client.shopping.flight_offers_search.get(
            originLocationCode="NYC",
            destinationLocationCode="MAD",
            departureDate="2025-09-01",
            adults=1,
            max=1,
        )

        print(f"✓ SUCESSO com config: {config}")
        print(f"Encontrou {len(resp.data)} ofertas")
        if resp.data:
            print(f"Primeiro preço: {resp.data[0]['price']['total']}")
        break

    except Exception as e:
        print(f"✗ Falhou: {e}")

print("\n=== TESTE COM AUTENTICAÇÃO MANUAL ===")
try:
    # Teste direto de autenticação
    client = Client(
        client_id=amadeus_key, client_secret=amadeus_secret, hostname="test"
    )

    # Forçar autenticação
    token = client.client.request(
        "POST",
        "/v1/security/oauth2/token",
        {
            "grant_type": "client_credentials",
            "client_id": amadeus_key,
            "client_secret": amadeus_secret,
        },
    )
    print(f"Token obtido: {token}")

except Exception as e:
    print(f"Erro na autenticação: {e}")
    print(f"Tipo: {type(e)}")
