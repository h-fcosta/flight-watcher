# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-08-22

### 🚀 Sistema de Ofertas Detalhadas

Esta versão introduz o sistema completo de visualização de ofertas de voo com informações detalhadas.

#### ✨ Adicionado

- **Sistema de ofertas detalhadas**: Modelo FlightOffer com 20+ campos de informações
- **Dashboard interativo**: Rotas clicáveis com navegação direta para ofertas
- **Página de ofertas filtráveis**: Visualização por rota com filtros avançados
- **Página de detalhes da oferta**: Informações completas de voo, preço e disponibilidade
- **JavaScript classes**: OffersManager e componentes reutilizáveis
- **API endpoints**: `/api/offers/` com filtros e paginação
- **Documentação abrangente**: FUNCIONALIDADES.md, STATUS.md, CHECKLIST.md

#### 🔧 Melhorado

- **Validação HTML5**: Corrigidas tags XHTML para padrão HTML5
- **Organização de código**: Arquivos de desenvolvimento movidos para dev-tools/
- **Estrutura de schemas**: Melhor handling de objetos Pydantic
- **Interface responsiva**: Layout otimizado para mobile e desktop

#### 🏗️ Organização

- **Limpeza de arquivos**: Removidos caches Python e arquivos temporários
- **Versionamento**: Branch feature/v1.1.0-flight-offers criado
- **Documentação**: Roadmap completo até v1.5.0

## [1.0.0] - 2025-08-21

### 🎉 Primeira Versão Estável

Esta é a primeira versão estável do Flight Watcher, com todas as funcionalidades principais implementadas e testadas.

#### ✨ Adicionado

- **Sistema completo de monitoramento**: Busca automática de preços a cada 6 horas
- **Interface web responsiva**: Dashboard moderno com Bootstrap 5
- **Busca automática ao criar rotas**: Preços são buscados imediatamente após criação
- **API RESTful completa**: Documentação com Swagger/OpenAPI
- **Sistema de alertas via Telegram**: Notificações automáticas de promoções
- **Histórico de preços**: Armazenamento e visualização de tendências
- **Gerenciamento de rotas**: CRUD completo via interface web
- **Indicadores visuais**: Feedback em tempo real para o usuário
- **Busca manual de preços**: Botão para busca sob demanda
- **Validação robusta**: Validação de códigos IATA e datas
- **Logs estruturados**: Sistema completo de logging
- **Health checks**: Endpoints de monitoramento do sistema

#### 🛠️ Técnico

- **FastAPI**: Framework principal para API REST
- **SQLAlchemy 2.0**: ORM moderno com suporte a async
- **APScheduler**: Agendamento de tarefas automáticas
- **Amadeus API**: Integração para dados reais de voos
- **Bootstrap 5**: Interface moderna e responsiva
- **JavaScript ES6+**: Frontend interativo
- **SQLite**: Banco de dados leve e eficiente
- **Pydantic**: Validação de dados robusta
- **Uvicorn**: Servidor ASGI de alta performance

#### 📊 Estatísticas v1.0.0

- **3 módulos principais**: Rotas, Preços, Status
- **15+ endpoints REST**: API completa documentada
- **3 páginas web**: Dashboard, Rotas, Promoções
- **4 serviços integrados**: Amadeus, Telegram, Scheduler, Alerts
- **Cobertura completa**: Frontend + Backend + Documentação

#### 🎯 Funcionalidades Principais

1. **Criação de Rotas**: Formulário intuitivo com validação
2. **Monitoramento Automático**: Scheduler executando a cada 6 horas
3. **Detecção de Promoções**: Algoritmo baseado em histórico de preços
4. **Alertas Inteligentes**: Notificações via Telegram quando preços caem
5. **Dashboard Estatísticas**: Visão geral do sistema em tempo real
6. **Busca Manual**: Controle total pelo usuário quando necessário

#### 🔧 Configuração

- **Variáveis de ambiente**: Configuração flexível via `.env`
- **Amadeus API**: Suporte a ambientes test e production
- **Telegram opcional**: Sistema funciona sem notificações
- **Thresholds configuráveis**: Percentual de desconto personalizável

---

## [2.1.0] - 2025-08-20 (Versão de Desenvolvimento)

### 🧹 Legacy System Cleanup

#### 🗑️ Removed

- **Legacy CLI System**: Removed `main.py` and `app/` directory
- **Backward Compatibility**: Removed support for old environment variables
- **Old Documentation**: Cleaned up README and removed legacy references
- **Obsolete Files**: Removed all CLI-related code and configurations

#### 🔄 Updated

- **Simplified Configuration**: Removed legacy variable support from `config.py`
- **Clean Documentation**: Updated README with modern, streamlined instructions
- **Startup Script**: Simplified `start.sh` to only support web interface
- **Environment Example**: Cleaned up `.env.example` to show only current variables

#### ✨ Result

- **Single Interface**: Web-only application, no CLI confusion
- **Cleaner Codebase**: Removed thousands of lines of legacy code
- **Simplified Setup**: One way to run the application
- **Modern Focus**: Pure FastAPI web application

---

## [2.0.0] - 2025-08-20

### 🚀 Major Refactoring - FastAPI Web Interface

#### ✅ Added

- **FastAPI Web Application**: Complete web interface replacing command-line interface
- **Modern Dashboard**: Real-time monitoring with statistics and charts
- **Route Management**: Full CRUD interface for flight routes
- **Deals Page**: Comprehensive promotion tracking and filtering
- **REST API**: Complete RESTful API with automatic documentation
- **Responsive Design**: Mobile-friendly interface with Bootstrap
- **Interactive JavaScript**: Real-time updates and AJAX functionality
- **Background Scheduler**: Non-blocking automatic price checking
- **Enhanced Database Models**: Improved schema with timestamps and job logging
- **Configuration Management**: Centralized settings with Pydantic
- **Auto-refresh**: Configurable automatic data updates
- **Export Functionality**: CSV export for deals and statistics
- **Search Interface**: Manual flight search directly from dashboard

#### Technical Details

- **Framework**: FastAPI with Uvicorn server
- **Frontend**: HTML5, Bootstrap 5, Vanilla JavaScript
- **Database**: SQLAlchemy 2.0 with SQLite
- **Validation**: Pydantic v2 for data validation
- **Scheduling**: APScheduler for background jobs
- **Charts**: Plotly.js for data visualization
- **Responsive**: Mobile-first design approach

#### 📂 File Structure

```
flight-watcher/
├── main_api.py              # FastAPI application entry point
├── config.py                # Centralized configuration
├── start.sh                 # Startup script
├── api/
│   ├── database.py         # Database configuration
│   ├── models.py           # SQLAlchemy models
│   ├── routers/            # API endpoints
│   ├── services/           # Business logic
│   └── schemas/            # Pydantic schemas
├── templates/              # Jinja2 templates
└── static/                 # CSS, JS, and assets
```

#### 🚀 Usage

- **Web Interface**: `./start.sh` → http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## [1.0.0] - Previous Version

### Features

- Command-line flight price monitoring
- Amadeus API integration
- Telegram bot notifications
- SQLite database storage
- Automatic scheduling with APScheduler
- Basic route management via Telegram commands

### Architecture

- Single-file CLI application
- Blocking scheduler
- Simple environment variable configuration
- Basic SQLAlchemy models
