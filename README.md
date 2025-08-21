# 🛫 Flight Watcher

Sistema de monitoramento de preços de passagens aéreas com interface web moderna e notificações automáticas.

## ✨ Funcionalidades

- 🔍 **Monitoramento Automático**: Busca preços de voos automaticamente
- 📊 **Dashboard Web**: Interface moderna e responsiva
- 📱 **Notificações Telegram**: Alertas instantâneos de promoções
- 📈 **Histórico de Preços**: Gráficos e análises detalhadas
- 🗺️ **Gerenciamento de Rotas**: CRUD completo via interface web
- 💰 **Detecção de Promoções**: Alertas quando preços ficam abaixo do limite
- 📤 **Exportação de Dados**: Export em CSV das promoções encontradas

## 🚀 Instalação

### 1. Clonar o repositório
```bash
git clone https://github.com/h-fcosta/flight-watcher.git
cd flight-watcher
```

### 2. Criar ambiente virtual
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\activate     # Windows
```

### 3. Instalar dependências
```bash
pip install -r requirements.txt
```

### 4. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Configurações da API Amadeus (obrigatório)
AMADEUS_CLIENT_ID=seu_client_id_aqui
AMADEUS_CLIENT_SECRET=seu_client_secret_aqui
AMADEUS_ENV=test  # test ou production

# Configurações do Telegram (opcional)
TELEGRAM_BOT_TOKEN=seu_bot_token_aqui
TELEGRAM_CHAT_ID=seu_chat_id_aqui

# Configurações da aplicação
DATABASE_URL=sqlite:///./prices.db
SECRET_KEY=uma_chave_secreta_qualquer

# Configurações do servidor (opcional)
HOST=0.0.0.0
PORT=8000
DEBUG=true
```

### 5. Executar a aplicação

#### Interface Web (Recomendado)
```bash
python main_api.py
```
Acesse: http://localhost:8000

#### Linha de Comando (Sistema Legado)
```bash
python main.py
```

## 🔧 Configuração da API Amadeus

1. Crie uma conta em [Amadeus for Developers](https://developers.amadeus.com/)
2. Crie uma nova aplicação
3. Copie o `Client ID` e `Client Secret`
4. Use `test` para desenvolvimento e `production` para uso real

## 📱 Configuração do Telegram (Opcional)

1. Crie um bot via [@BotFather](https://t.me/botfather)
2. Copie o token do bot
3. Envie uma mensagem para o bot e obtenha seu chat ID
4. Configure as variáveis no `.env`

## 🌐 Interface Web

### Dashboard Principal
- Visão geral do sistema
- Estatísticas em tempo real
- Busca manual de voos
- Status do monitoramento

### Gerenciamento de Rotas
- Adicionar/editar/remover rotas
- Ativar/desativar monitoramento
- Filtros e ordenação
- Validação em tempo real

### Promoções
- Lista de todas as promoções encontradas
- Filtros avançados por origem, destino, preço
- Detalhes completos de cada promoção
- Exportação em CSV

## 🔄 Como Usar

### 1. Adicionar uma Rota
1. Acesse a aba "Rotas"
2. Clique em "Nova Rota"
3. Preencha origem, destino, data e limite de preço
4. Salve a rota

### 2. Monitorar Preços
O sistema verifica automaticamente os preços a cada 6 horas e:
- Salva todos os preços no banco de dados
- Detecta quando um preço fica abaixo do limite
- Envia notificação via Telegram (se configurado)
- Registra como promoção no dashboard

### 3. Ver Promoções
- Acesse a aba "Promoções"
- Veja todas as ofertas encontradas
- Filtre por critérios específicos
- Exporte os dados se necessário

## 📊 API REST

A aplicação oferece uma API REST completa:

- `GET /api/routes` - Listar rotas
- `POST /api/routes` - Criar rota
- `PUT /api/routes/{id}` - Atualizar rota
- `DELETE /api/routes/{id}` - Excluir rota
- `GET /api/prices` - Histórico de preços
- `GET /api/deals` - Promoções encontradas
- `GET /api/status/health` - Status do sistema

Documentação completa: http://localhost:8000/docs

## 🏗️ Arquitetura

```
flight-watcher/
├── main_api.py              # Aplicação FastAPI principal
├── main.py                  # Sistema legado (linha de comando)
├── config.py                # Configurações centralizadas
├── requirements.txt         # Dependências
├── api/
│   ├── database.py         # Configuração do banco
│   ├── models.py           # Modelos SQLAlchemy
│   ├── routers/            # Endpoints da API
│   │   ├── routes.py       # CRUD de rotas
│   │   ├── prices.py       # Histórico de preços
│   │   ├── deals.py        # Promoções
│   │   └── status.py       # Status do sistema
│   ├── services/           # Lógica de negócio
│   │   ├── amadeus.py      # Cliente API Amadeus
│   │   ├── telegram.py     # Notificações
│   │   ├── alerts.py       # Detecção de promoções
│   │   └── scheduler.py    # Jobs automáticos
│   └── schemas/            # Validação Pydantic
├── templates/              # Templates HTML
│   ├── base.html
│   ├── dashboard.html
│   ├── routes.html
│   └── deals.html
├── static/                 # Arquivos estáticos
│   ├── css/style.css
│   └── js/
│       ├── app.js
│       ├── dashboard.js
│       ├── routes.js
│       └── deals.js
└── app/                    # Sistema legado
    ├── fetcher.py
    ├── models.py
    └── ...
```

## 🛠️ Desenvolvimento

### Executar em modo de desenvolvimento
```bash
python main_api.py
```

### Logs
Os logs são salvos em `logs/flightbot.log` com rotação automática.

## 📝 Licença

Este projeto é de código aberto. Sinta-se livre para usar e modificar.

## 🤝 Contribuições

Contribuições são bem-vindas! Abra uma issue ou envie um pull request.

## ❓ Suporte

Para dúvidas ou problemas:
1. Verifique os logs em `logs/flightbot.log`
2. Confirme se as variáveis de ambiente estão corretas
3. Teste a conectividade com a API Amadeus
4. Abra uma issue no GitHub
