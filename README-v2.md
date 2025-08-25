# 🚀 Flight Watcher v2.0 - React Frontend

Sistema moderno de monitoramento de voos com interface React e backend FastAPI.

## 📁 Estrutura do Projeto

```
flight-watcher/
├── backend/                    # API FastAPI
│   ├── api/                   # Routers e modelos
│   ├── main_api.py           # Aplicação principal
│   ├── config.py             # Configurações
│   ├── requirements.txt      # Dependências Python
│   └── Dockerfile           # Container backend
│
├── frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── lib/             # Utilitários
│   │   └── pages/           # Páginas da aplicação
│   ├── package.json         # Dependências Node.js
│   └── Dockerfile          # Container frontend
│
└── docker-compose.yml        # Orquestração
```

## 🛠️ Stack Tecnológica

### Backend (Mantido da v1.1)

- **FastAPI** - API REST moderna e rápida
- **SQLAlchemy** - ORM para banco de dados
- **SQLite** - Banco de dados local
- **Amadeus API** - Dados de voos em tempo real
- **APScheduler** - Agendamento de tarefas

### Frontend (Novo na v2.0)

- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Componentes de design system
- **Lucide React** - Ícones

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- Python 3.11+
- Docker (opcional)

### Desenvolvimento Local

#### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn main_api:app --reload --port 8001
```

#### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Acesse:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **Documentação API**: http://localhost:8001/docs

### Docker (Recomendado)

```bash
# Subir todos os serviços
docker-compose up --build

# Apenas backend
docker-compose up backend

# Apenas frontend
docker-compose up frontend
```

## 🎨 Design System

### shadcn/ui Components

O projeto utiliza shadcn/ui para componentes consistentes:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ofertas de Voo</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Ver Ofertas</Button>
      </CardContent>
    </Card>
  );
}
```

### Customização de Cores

Edite `frontend/tailwind.config.js` para personalizar o tema.

## 📡 API Integration

### Cliente API

O frontend se comunica com o backend via fetch:

```typescript
// services/api.ts
const API_BASE = "http://localhost:8001";

export const api = {
  getOffers: () => fetch(`${API_BASE}/api/offers/`).then((r) => r.json()),
  getRoutes: () => fetch(`${API_BASE}/api/routes/`).then((r) => r.json())
  // ... outros endpoints
};
```

### Endpoints Disponíveis

- `GET /api/offers/` - Lista ofertas de voo
- `GET /api/routes/` - Lista rotas monitoradas
- `GET /api/prices/` - Histórico de preços
- `GET /api/deals/` - Melhores ofertas
- `GET /api/status/` - Status do sistema

## 🔧 Desenvolvimento

### Adicionando Componentes shadcn/ui

```bash
cd frontend
# Exemplo: adicionar dialog
npx shadcn-ui@latest add dialog
```

### Estrutura de Componentes

```
frontend/src/components/
├── ui/                    # Componentes base (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── layout/               # Layout components
│   ├── header.tsx
│   └── sidebar.tsx
└── features/             # Feature-specific components
    ├── offers/
    ├── routes/
    └── dashboard/
```

### Convenções

- **Componentes**: PascalCase (`FlightCard.tsx`)
- **Arquivos**: kebab-case (`flight-card.tsx`)
- **Hooks**: usePrefix (`useFlightData.ts`)

## 🚀 Deploy

### Produção com Docker

```bash
# Build para produção
docker-compose -f docker-compose.prod.yml up --build

# Ou usando build separado
docker build -t flight-watcher-frontend ./frontend
docker build -t flight-watcher-backend ./backend
```

### Build Estático (Frontend)

```bash
cd frontend
npm run build
# Arquivos em dist/ prontos para deploy
```

## 🔄 Migração da v1.1

### O que mudou:

- ✅ **Frontend**: Templates Jinja2 → React SPA
- ✅ **Build**: Python serving → Node.js + Vite
- ✅ **Styling**: Bootstrap → Tailwind + shadcn/ui
- ✅ **Arquitetura**: Monolito → Frontend/Backend separados

### O que NÃO mudou:

- ✅ **API endpoints**: Mesmos endpoints da v1.1
- ✅ **Database**: Schema mantido
- ✅ **Business logic**: Preserved no backend
- ✅ **Amadeus integration**: Intacta

## 📚 Scripts Úteis

### Frontend

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run preview      # Preview build
npm run lint         # ESLint
```

### Backend

```bash
uvicorn main_api:app --reload    # Desenvolvimento
python -m pytest                # Testes
python dev-tools/test_amadeus.py # Testar API
```

## 🐛 Troubleshooting

### CORS Issues

Se houver problemas de CORS, verifique `backend/main_api.py`:

```python
allow_origins=[
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # React dev server (alternativo)
]
```

### Path Mapping

Para imports `@/components`, verifique:

- `frontend/tsconfig.app.json`
- `frontend/vite.config.ts`

### Node/NPM Issues

```bash
# Limpar cache npm
npm cache clean --force

# Reinstalar node_modules
rm -rf node_modules package-lock.json
npm install
```

## 📄 Licença

MIT License - veja arquivo LICENSE para detalhes.

---

**Flight Watcher v2.0** - Sistema moderno de monitoramento de voos 🛫
