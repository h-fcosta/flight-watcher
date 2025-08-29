# Flight Watcher v2.0 - Frontend React

Sistema de monitoramento de preços de passagens aéreas com interface React moderna.

## 🚀 Características

### Frontend (React + TypeScript)

- **React 18** com Vite como bundler
- **TypeScript** para tipagem estática
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes UI modernos
- **Lucide React** para ícones
- Responsive design para mobile e desktop

### Backend (FastAPI)

- API REST completa na porta **8001**
- Integração com Amadeus API
- Sistema de agendamento automático
- Alertas via Telegram e Email
- Banco de dados SQLite

## 📁 Estrutura do Projeto

```
flight-watcher/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   │   ├── ui/            # Componentes UI (shadcn/ui)
│   │   │   ├── Navigation.tsx  # Barra de navegação
│   │   │   ├── Dashboard.tsx   # Painel principal
│   │   │   ├── Routes.tsx      # Gerenciamento de rotas
│   │   │   ├── Offers.tsx      # Busca e listagem de ofertas
│   │   │   └── Alerts.tsx      # Sistema de alertas
│   │   ├── lib/
│   │   │   ├── api.ts         # Cliente da API
│   │   │   └── utils.ts       # Utilitários
│   │   └── App.tsx            # Componente principal
│   ├── package.json
│   └── vite.config.ts
├── backend/                     # FastAPI Backend
│   ├── api/
│   │   ├── routers/           # Endpoints da API
│   │   ├── services/          # Serviços (Amadeus, Telegram, etc.)
│   │   └── models.py          # Modelos do banco de dados
│   ├── main_api.py            # Aplicação principal
│   └── requirements.txt
└── docker-compose.yml          # Configuração Docker
```

## 🛠️ Tecnologias Utilizadas

### Frontend

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Biblioteca de componentes
- **Lucide React** - Ícones
- **@radix-ui** - Primitivos de UI

### Backend

- **FastAPI** - Framework web Python
- **SQLite** - Banco de dados
- **SQLAlchemy** - ORM
- **Amadeus API** - Dados de voos
- **python-telegram-bot** - Integração Telegram
- **APScheduler** - Agendamento de tarefas

## 🚀 Como Executar

### Usando Docker (Recomendado)

```bash
# Clonar o repositório
git clone https://github.com/h-fcosta/flight-watcher.git
cd flight-watcher

# Executar com Docker Compose
docker-compose up -d

# Acessar aplicações
# Frontend: http://localhost:5173
# Backend API: http://localhost:8001
# Documentação da API: http://localhost:8001/docs
```

### Desenvolvimento Local

#### Backend

```bash
cd backend
pip install -r requirements.txt
python main_api.py
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📱 Funcionalidades

### 🎯 Dashboard

- Estatísticas em tempo real
- Rotas ativas monitoradas
- Preços encontrados
- Deals e promoções
- Últimas ofertas encontradas

### 🛣️ Gerenciamento de Rotas

- Criar/editar/excluir rotas de monitoramento
- Definir origem, destino e período
- Ativar/desativar monitoramento
- Validação de códigos IATA

### ✈️ Busca de Ofertas

- Busca em tempo real via Amadeus API
- Filtros avançados (classe, passageiros, etc.)
- Visualização detalhada dos voos
- Informações de escalas e duração
- Links diretos para reserva

### 🔔 Sistema de Alertas

- Alertas personalizáveis por rota
- Notificações via Telegram e Email
- Configuração de preços limite
- Histórico de alertas enviados
- Teste de alertas

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Amadeus API
AMADEUS_CLIENT_ID=your_client_id
AMADEUS_CLIENT_SECRET=your_client_secret

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### API Amadeus

1. Registre-se em [Amadeus for Developers](https://developers.amadeus.com/)
2. Crie uma nova aplicação
3. Obtenha suas credenciais (Client ID e Client Secret)

### Bot Telegram

1. Crie um bot via [@BotFather](https://t.me/botfather)
2. Obtenha o token do bot
3. Inicie uma conversa com o bot e obtenha seu Chat ID

## 📊 API Endpoints

### Rotas

- `GET /api/routes` - Listar rotas
- `POST /api/routes` - Criar rota
- `PUT /api/routes/{id}` - Atualizar rota
- `DELETE /api/routes/{id}` - Excluir rota

### Ofertas

- `GET /api/offers` - Listar ofertas
- `GET /api/offers/search` - Buscar ofertas

### Preços

- `GET /api/prices` - Histórico de preços
- `GET /api/prices/route/{route_id}` - Preços por rota

### Alertas

- `GET /api/alerts` - Listar alertas
- `POST /api/alerts` - Criar alerta
- `PUT /api/alerts/{id}` - Atualizar alerta
- `DELETE /api/alerts/{id}` - Excluir alerta

### Sistema

- `GET /api/status` - Status da aplicação
- `GET /docs` - Documentação da API

## 🎨 Interface

A interface foi desenvolvida com foco na experiência do usuário:

- **Design Responsivo** - Funciona em desktop, tablet e mobile
- **Tema Moderno** - Interface limpa e profissional
- **Navegação Intuitiva** - Acesso fácil a todas as funcionalidades
- **Feedback Visual** - Indicadores de status e loading states
- **Acessibilidade** - Seguindo boas práticas de UX

## 🔄 Hot Reload

O projeto está configurado com hot reload para desenvolvimento:

- **Frontend**: Vite com hot reload automático
- **Backend**: Uvicorn com reload em desenvolvimento
- **Docker**: Volumes mapeados para atualizações em tempo real

## 📈 Monitoramento

O sistema inclui:

- **Logs detalhados** de todas as operações
- **Métricas de performance** da API
- **Status de saúde** dos serviços
- **Histórico de execuções** do scheduler

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte, abra uma [issue](https://github.com/h-fcosta/flight-watcher/issues) no GitHub ou entre em contato via [email](mailto:seu-email@domain.com).

---

**Flight Watcher v2.0** - Monitoramento inteligente de passagens aéreas 🛫
