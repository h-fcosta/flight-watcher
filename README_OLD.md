# Flight Watcher

Monitor de preços de passagens aéreas usando a API da Amadeus com notificações via Telegram.

## Funcionalidades

- 🔍 Monitoramento automático de preços de voos
- 📊 Detecção de promoções baseada em média histórica
- 🤖 Bot Telegram para controle e notificações
- 📅 Agendamento automático de consultas (a cada 6 horas)
- 💾 Armazenamento de histórico de preços

## Configuração

1. **Copie o arquivo de configuração:**

   ```bash
   cp .env.example .env
   ```

2. **Configure suas credenciais no arquivo `.env`:**

   - **AMADEUS_KEY** e **AMADEUS_SECRET**: Obtenha em [developers.amadeus.com](https://developers.amadeus.com)
   - **TELEGRAM_TOKEN**: Crie um bot com [@BotFather](https://t.me/botfather)
   - **TG_CHAT_ID**: ID do chat onde receber notificações
   - **TG_ALLOWED_IDS**: IDs dos usuários autorizados a usar o bot (separados por vírgula)

3. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

## Uso

### Executar o Monitor

```bash
python main.py
```

### Comandos do Bot Telegram

- `/add ORIG DEST AAAA-MM-DD AAAA-MM-DD` - Adicionar nova rota
- `/list` - Listar todas as rotas
- `/toggle ID on|off` - Ativar/desativar rota
- `/del ID` - Deletar rota

### Testes

```bash
python test_telegram.py  # Testar conexão Telegram
python test_run.py       # Testar busca de preços
```

## Estrutura do Projeto

```
├── main.py              # Aplicação principal
├── app/
│   ├── models.py        # Modelos do banco de dados
│   ├── fetcher.py       # Consulta API Amadeus
│   ├── repo.py          # Operações do banco
│   ├── alert.py         # Detecção de promoções
│   ├── notifier.py      # Envio de notificações
│   └── bot.py           # Bot Telegram
├── logs/                # Logs da aplicação
└── prices.db           # Banco de dados SQLite
```

## Como Funciona

1. O sistema monitora rotas configuradas a cada 6 horas
2. Para cada rota, consulta preços na API da Amadeus
3. Compara preços com a média histórica
4. Envia notificação se o preço está 10% abaixo da média
5. Bot Telegram permite gerenciar rotas remotamente
