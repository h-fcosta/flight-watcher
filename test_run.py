import os, dotenv

dotenv.load_dotenv()
from app.fetcher import cheapest_on
from app.repo import save_price, add_route
from app.alert import is_deal
from datetime import date

# Criar uma rota de teste se não existir
origin = os.getenv("ORIGIN")
dest = os.getenv("DEST")

if not origin or not dest:
    print("ORIGIN ou DEST não configurados no .env")
    exit(1)

# Adicionar rota de teste
try:
    route_id = add_route(origin, dest, date.today(), date.today())
    print(f"Rota de teste criada: ID {route_id}")
except Exception as e:
    print(f"Erro ao criar rota: {e}")
    route_id = 1  # Assumir ID 1 se já existir

d = date(2025, 7, 20)
p = cheapest_on(d, origin, dest)

if p:
    save_price(route_id, d, p)
    print(f"Preço gravado: R$ {p:,.2f}")

    if is_deal(d, p, route_id):
        print(">>> NEGÓCIO! Preço abaixo da média")
    else:
        print("Preço normal")
else:
    print("Nenhum preço encontrado")
