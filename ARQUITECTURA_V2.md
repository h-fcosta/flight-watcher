# Flight Watcher v2.0 - Arquitetura e Separação

## 📁 Separação Frontend/Backend

### Backend (FastAPI) - `/backend/`
```
backend/
├── api/              # API routes e modelos
├── main_api.py       # Aplicação FastAPI principal  
├── config.py         # Configurações (Amadeus, DB, etc)
├── requirements.txt  # Dependências Python
└── Dockerfile        # Container para deploy
```

**Responsabilidades:**
- ✅ API REST endpoints
- ✅ Integração com Amadeus API
- ✅ Banco de dados (SQLite/SQLAlchemy) 
- ✅ Business logic e validações
- ✅ Agendamento de tarefas
- ✅ Sistema de alertas

### Frontend (React) - `/frontend/`
```
frontend/
├── src/
│   ├── components/   # Componentes React
│   ├── pages/        # Páginas da aplicação
│   ├── lib/          # Utilitários e helpers
│   └── services/     # Integração com API
├── package.json      # Dependências Node.js
└── Dockerfile        # Container para deploy
```

**Responsabilidades:**
- ✅ Interface de usuário moderna
- ✅ Componentes reutilizáveis (shadcn/ui)
- ✅ Estado da aplicação
- ✅ Comunicação com backend via API
- ✅ Roteamento e navegação

## 🔗 Comunicação

### API Contract
O frontend consome a mesma API da v1.1:
- `GET /api/offers/` → Lista de ofertas
- `GET /api/routes/` → Rotas monitoradas
- `GET /api/status/` → Status do sistema
- `POST /api/routes/` → Criar nova rota

### CORS Configuration
Backend configurado para aceitar requests do frontend:
```python
allow_origins=[
    "http://localhost:5173",  # Vite dev
    "http://localhost:3000",  # React dev alternativo
]
```

## 🚀 Deploy

### Desenvolvimento
```bash
# Terminal 1: Backend
cd backend && uvicorn main_api:app --reload

# Terminal 2: Frontend  
cd frontend && npm run dev
```

### Produção
```bash
# Docker Compose (recomendado)
docker-compose up --build

# Ou manual
cd backend && uvicorn main_api:app --host 0.0.0.0
cd frontend && npm run build && serve dist/
```

## 🎨 Design System

### shadcn/ui Components
- **Button**: Botões com variantes (primary, secondary, outline)
- **Card**: Containers para conteúdo
- **Input**: Campos de formulário
- **Dialog**: Modais e popups
- **Table**: Tabelas de dados

### Customização
Cores e tema definidos em:
- `frontend/tailwind.config.js`
- `frontend/src/globals.css`

## 📈 Vantagens da v2.0

### Performance
- ✅ SPA rendering (client-side)
- ✅ Code splitting automático
- ✅ Hot module replacement
- ✅ Build otimizado com Vite

### Developer Experience
- ✅ TypeScript com type safety
- ✅ Component-based architecture
- ✅ Modern tooling (ESLint, Prettier)
- ✅ Hot reload em desenvolvimento

### Escalabilidade
- ✅ Componentes reutilizáveis
- ✅ Separação clara de responsabilidades
- ✅ API-first approach
- ✅ Docker para deploy consistente

### Manutenibilidade
- ✅ Código organizado em módulos
- ✅ Tipagem estática
- ✅ Design system consistente
- ✅ Documentação clara

---

**Resultado**: Sistema moderno, escalável e bem arquitetado! 🚀
