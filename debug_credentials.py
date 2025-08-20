import os, dotenv
from datetime import date

# Carregar variáveis de ambiente
dotenv.load_dotenv()

# Verificar se as variáveis estão sendo carregadas
print("=== DIAGNÓSTICO DE CREDENCIAIS ===")
print(f"Arquivo .env existe: {os.path.exists('.env')}")
print()

# Verificar variáveis de ambiente
amadeus_key = os.getenv("AMADEUS_KEY")
amadeus_secret = os.getenv("AMADEUS_SECRET")
origin = os.getenv("ORIGIN")
dest = os.getenv("DEST")

print("Variáveis carregadas:")
print(f"AMADEUS_KEY: {'✓ Carregada' if amadeus_key else '✗ Não encontrada'}")
if amadeus_key:
    print(f"  Tamanho: {len(amadeus_key)} caracteres")
    print(f"  Primeiros 10 chars: {amadeus_key[:10]}...")

print(f"AMADEUS_SECRET: {'✓ Carregada' if amadeus_secret else '✗ Não encontrada'}")
if amadeus_secret:
    print(f"  Tamanho: {len(amadeus_secret)} caracteres")
    print(f"  Primeiros 10 chars: {amadeus_secret[:10]}...")

print(f"ORIGIN: {origin if origin else '✗ Não encontrada'}")
print(f"DEST: {dest if dest else '✗ Não encontrada'}")

# Verificar se há espaços ou caracteres invisíveis
if amadeus_key:
    print(f"\nAMADEUS_KEY tem espaços? {' ' in amadeus_key}")
    print(f"AMADEUS_KEY termina com \\n? {amadeus_key.endswith('\\n')}")

if amadeus_secret:
    print(f"AMADEUS_SECRET tem espaços? {' ' in amadeus_secret}")
    print(f"AMADEUS_SECRET termina com \\n? {amadeus_secret.endswith('\\n')}")

# Tentar inicializar cliente Amadeus para ver erro detalhado
if amadeus_key and amadeus_secret:
    print("\n=== TESTE DE INICIALIZAÇÃO AMADEUS ===")
    try:
        from amadeus import Client

        # Testar ambiente de teste primeiro
        print("Testando ambiente de TESTE...")
        client_test = Client(
            client_id=amadeus_key.strip(),
            client_secret=amadeus_secret.strip(),
            hostname="test",  # Ambiente de teste
        )

        resp = client_test.shopping.flight_offers_search.get(
            originLocationCode="GRU",
            destinationLocationCode="JFK",
            departureDate=date(2025, 9, 1).isoformat(),
            adults=1,
            max=1,
        )
        print("✓ API de TESTE funcionando!")

    except Exception as e1:
        print(f"✗ Erro no ambiente de teste: {e1}")

        # Se teste falhou, tentar produção
        try:
            print("Testando ambiente de PRODUÇÃO...")
            client_prod = Client(
                client_id=amadeus_key.strip(),
                client_secret=amadeus_secret.strip(),
                hostname="production",  # Ambiente de produção
            )

            resp = client_prod.shopping.flight_offers_search.get(
                originLocationCode="GRU",
                destinationLocationCode="JFK",
                departureDate=date(2025, 9, 1).isoformat(),
                adults=1,
                max=1,
            )
            print("✓ API de PRODUÇÃO funcionando!")

        except Exception as e2:
            print(f"✗ Erro no ambiente de produção: {e2}")
            print(f"Tipo do erro: {type(e2)}")
