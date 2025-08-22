# 🛫 Flight Watcher

Sistema inteligente de monitoramento de preços de passagens aéreas com alertas automáticos e interface web completa.

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-green.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-red.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

## ✨ Funcionalidades

- 🔍 **Monitoramento Automático**: Busca preços de voos automaticamente a cada 6 horas
- 📊 **Dashboard Web**: Interface moderna e responsiva com Bootstrap 5
- 📱 **Notificações Telegram**: Alertas instantâneos de promoções
- 📈 **Histórico de Preços**: Gráficos e análises detalhadas
- 🗺️ **Gerenciamento de Rotas**: CRUD completo via interface web
- 💰 **Detecção de Promoções**: Alertas quando preços ficam abaixo do limite
- 🚀 **Busca Automática**: Preços são buscados automaticamente ao criar rotas
- 📤 **API RESTful**: Documentação completa com Swagger/OpenAPI
- ✈️ **Ofertas Detalhadas (v1.1.0)**: Visualização completa de ofertas de voo com detalhes de companhias, conexões, bagagens e mais
- 🎯 **Navegação Integrada**: Clique em rotas no dashboard para ver ofertas específicas

## 🎯 Sobre o Projeto

O Flight Watcher é um sistema completo para monitoramento automático de preços de passagens aéreas. Utilizando a API da Amadeus, o sistema busca periodicamente os melhores preços para rotas configuradas pelo usuário e envia alertas quando encontra ofertas interessantes.

### Principais Características:

- ⚡ **Monitoramento em Tempo Real**: Busca automática de preços a cada 6 horas
- 🎯 **Alertas Inteligentes**: Notificações via Telegram quando preços caem
- 📊 **Dashboard Completo**: Interface web responsiva para gerenciamento
- 🔄 **Busca Automática**: Preços são buscados automaticamente ao criar rotas
- 📋 **Ofertas Detalhadas**: Sistema completo de visualização de ofertas com filtros avançados
- 🔗 **Navegação Fluida**: Integração entre dashboard e páginas de ofertas
- 📈 **Histórico Detalhado**: Armazenamento e visualização de tendências de preços
- 🛠️ **API RESTful**: Documentação completa com Swagger/OpenAPI

### � Ofertas Detalhadas (v1.1.0)

O sistema agora inclui uma funcionalidade completa de visualização de ofertas de voo:

- **📄 Página de Ofertas**: Lista todas as ofertas disponíveis com informações detalhadas
- **🔍 Filtros Avançados**: Filtre por rota, companhia, número de conexões, preço e classe
- **📊 Estatísticas**: Veja resumos por companhia aérea com contadores de ofertas
- **🎯 Navegação Integrada**: Clique em qualquer rota no dashboard para ver ofertas específicas
- **📋 Detalhes Completos**: Visualize informações completas de cada oferta incluindo:
  - Detalhes da companhia aérea e aeronave
  - Informações de horários e duração
  - Conexões e terminais
  - Políticas de bagagem
  - Disponibilidade de assentos
  - Classe de cabine e amenidades

### 🔗 Fluxo de Navegação

1. **Dashboard** → Visualize todas as rotas monitoradas
2. **Clique na Rota** → Seja direcionado para ofertas filtradas por essa rota
3. **Filtros** → Refine ainda mais sua busca
4. **Detalhes** → Clique em qualquer oferta para ver informações completas

## 🚀 Instalação e Uso

### 1. Clonar e configurar

```bash
git clone https://github.com/h-fcosta/flight-watcher.git
cd flight-watcher
python -m venv .venv
source .venv/bin/activate  # Linux/Mac ou .venv\Scripts\activate no Windows
pip install -r requirements.txt
```

### 2. Configurar credenciais

```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### 3. Executar

```bash
./start.sh
```

**Acesse: http://localhost:8000**

## 🔧 Configuração

### API Amadeus (Obrigatório)

1. Crie uma conta em [Amadeus for Developers](https://developers.amadeus.com/)
2. Crie uma nova aplicação
3. Configure no arquivo `.env`:

```env
AMADEUS_CLIENT_ID=seu_client_id_aqui
AMADEUS_CLIENT_SECRET=seu_client_secret_aqui
AMADEUS_ENV=test  # ou production
```

### Telegram (Opcional)

1. Crie um bot via [@BotFather](https://t.me/botfather)
2. Configure no arquivo `.env`:

```env
TELEGRAM_BOT_TOKEN=seu_bot_token_aqui
TELEGRAM_CHAT_ID=seu_chat_id_aqui
```

## 🌐 Interface Web

### Dashboard Principal

- **Visão Geral**: Estatísticas em tempo real do sistema
- **Busca Manual**: Pesquise voos diretamente na interface
- **Status**: Monitore o funcionamento do sistema
- **Auto-refresh**: Atualizações automáticas dos dados

### Gerenciamento de Rotas

- **Adicionar Rotas**: Defina origem, destino, data e limite de preço
- **Editar/Excluir**: Gerencie suas rotas existentes
- **Ativar/Pausar**: Controle quais rotas são monitoradas
- **Filtros**: Encontre rotas específicas rapidamente

### Promoções

- **Lista Completa**: Todas as ofertas encontradas
- **Filtros Avançados**: Por origem, destino, preço, data
- **Detalhes**: Informações completas de cada promoção
- **Exportar**: Baixe dados em formato CSV

## 🔄 Como Funciona

1. **Configure suas rotas** de interesse com limite de preço
2. **O sistema verifica automaticamente** os preços a cada 6 horas
3. **Quando encontra um preço abaixo do limite**:
   - Salva como promoção no dashboard
   - Envia notificação via Telegram (se configurado)
   - Registra no histórico para análise

## 📊 API REST

Documentação completa em: **http://localhost:8000/docs**

Principais endpoints:

- `GET /api/routes` - Listar rotas
- `POST /api/routes` - Criar rota
- `GET /api/deals` - Promoções encontradas
- `GET /api/prices` - Histórico de preços
- `GET /api/status/health` - Status do sistema

## 🏗️ Arquitetura

```
flight-watcher/
├── main_api.py              # Aplicação FastAPI principal
├── config.py                # Configurações centralizadas
├── start.sh                 # Script de inicialização
├── api/
│   ├── database.py         # Configuração do banco
│   ├── models.py           # Modelos SQLAlchemy
│   ├── routers/            # Endpoints da API
│   ├── services/           # Lógica de negócio
│   └── schemas/            # Validação Pydantic
├── templates/              # Interface web (HTML)
└── static/                 # Assets (CSS, JS)
```

## 🛠️ Desenvolvimento

### Executar em modo desenvolvimento

```bash
python main_api.py
```

### Logs

Verifique os logs em `logs/flightbot.log`

### Banco de dados

SQLite em `prices.db` (criado automaticamente)

## ❓ Solução de Problemas

**Erro de credenciais:**

- Verifique se `AMADEUS_CLIENT_ID` e `AMADEUS_CLIENT_SECRET` estão corretos
- Confirme se `AMADEUS_ENV` está como `test` para desenvolvimento

**Sem notificações:**

- Configure `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` no `.env`
- Teste enviando `/start` para o bot

**Interface não carrega:**

- Verifique se as dependências estão instaladas: `pip install -r requirements.txt`
- Confirme que a porta 8000 não está sendo usada

## 📝 Licença

Este projeto é de código aberto. Use e modifique livremente.

## 🤝 Contribuições

Contribuições são bem-vindas! Abra uma issue ou envie um pull request.
