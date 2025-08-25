# 🚀 Estratégia de Versionamento para React Frontend (v2.0)

## 📋 **Por que Versão 2.0?**

### **Semantic Versioning (SemVer): MAJOR.MINOR.PATCH**

- **v1.x.x → v2.0.0**: MAJOR version para breaking changes
- **Frontend completo reescrito**: React vs Templates Jinja2
- **Arquitetura diferente**: SPA vs Server-side rendering
- **Dependencies novas**: Node.js, React, bundlers
- **Build process diferente**: npm/yarn vs Python direct serving

## 🗂️ **Estrutura de Branches Recomendada**

### **Branch Strategy para v2.0:**

```
main (v1.1.0) ←── Versão atual estável
│
├─ release/v1.0.0 ←── Preservação histórica v1.0
├─ release/v1.1.0 ←── Preservação histórica v1.1 (a criar)
│
└─ feature/v2.0.0-react-frontend ←── Desenvolvimento v2.0
   │
   ├─ feature/v2.0.0-react-setup
   ├─ feature/v2.0.0-components
   ├─ feature/v2.0.0-api-integration
   └─ feature/v2.0.0-deployment
```

## 🔄 **Estratégia de Migração**

### **Fase 1: Preparação (Branch feature/v2.0.0-react-frontend)**

```bash
# Criar branch de desenvolvimento v2.0
git checkout -b feature/v2.0.0-react-frontend

# Preservar v1.1.0 antes de começar
git checkout main
git checkout -b release/v1.1.0
git push origin release/v1.1.0
```

### **Fase 2: Estrutura Híbrida**

- **Backend mantido**: FastAPI API endpoints (100% compatível)
- **Frontend reescrito**: React SPA
- **API Contract**: Manter mesmos endpoints para compatibilidade

### **Fase 3: Arquitetura v2.0**

```
┌─────────────────┐    ┌──────────────────────┐
│   React Frontend │    │   FastAPI Backend    │
│   (Port 5173)    │────│   (Port 8001)       │
│                 │    │                      │
│   - Components   │    │   - Same API routes  │
│   - State Mgmt   │    │   - Same responses   │
│   - Modern UI    │    │   - Same logic       │
└─────────────────┘    └──────────────────────┘
```

## 📁 **Nova Estrutura de Projeto v2.0**

### **Estrutura Proposta:**

```
flight-watcher/
├── backend/                 # FastAPI (mantido)
│   ├── api/
│   ├── main_api.py
│   └── requirements.txt
│
├── frontend/                # React (novo)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── styles/
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml       # Orchestração
└── README.md               # Documentação v2.0
```

## 🛠️ **Stack Tecnológica v2.0**

### **Frontend (Novo):**

- **React 18** + TypeScript
- **Vite** para build/bundling
- **Tailwind CSS** ou **Material-UI**
- **React Query** para state management de API
- **React Router** para navegação

### **Backend (Mantido):**

- **FastAPI** (mesma API)
- **SQLAlchemy** (mesmo banco)
- **Amadeus API** (mesma integração)
- **CORS** habilitado para React

### **Vantagens da v2.0:**

- ✅ **Performance superior**: SPA rendering
- ✅ **UX moderna**: Componentes interativos
- ✅ **Escalabilidade**: Componentização
- ✅ **Developer Experience**: Hot reload, TypeScript
- ✅ **Mobile-first**: Responsivo nativo
- ✅ **State management**: Melhor gerenciamento de estado

### **Compatibilidade:**

- ✅ **API endpoints**: 100% compatíveis
- ✅ **Database**: Mesmo schema
- ✅ **Business logic**: Preservada no backend
- ✅ **Amadeus integration**: Mantida

## 🎯 **Roadmap v2.0**

### **Sprint 1: Setup (feature/v2.0.0-react-setup)**

- React + Vite + TypeScript setup
- API client configuration
- Basic routing structure
- Development environment

### **Sprint 2: Core Components (feature/v2.0.0-components)**

- Dashboard component
- Flight offers list/grid
- Offer details modal/page
- Navigation component

### **Sprint 3: API Integration (feature/v2.0.0-api-integration)**

- React Query setup
- API service layer
- Error handling
- Loading states

### **Sprint 4: Advanced Features (feature/v2.0.0-features)**

- Real-time updates
- Advanced filtering
- Booking flow
- Responsive design

### **Sprint 5: Testing & Deployment (feature/v2.0.0-deployment)**

- Unit tests
- E2E tests
- Docker setup
- Production build

## 📊 **Breaking Changes em v2.0**

### **O que muda:**

- 🔄 **Frontend completo**: Templates → React
- 🔄 **Build process**: Python serving → Node.js build
- 🔄 **Deployment**: Single container → Multi-container
- 🔄 **Development**: Python-only → Python + Node.js

### **O que NÃO muda:**

- ✅ **API endpoints**: Mesmos endpoints
- ✅ **Database schema**: Mantido
- ✅ **Business logic**: Preservada
- ✅ **Amadeus integration**: Intacta

## 🚀 **Plano de Release**

### **Timeline Sugerido:**

```
┌──────────────┬─────────────────┬──────────────┐
│   Semana     │   Atividade     │    Branch    │
├──────────────┼─────────────────┼──────────────┤
│   1-2        │   React Setup   │   setup      │
│   3-4        │   Components    │   components │
│   5-6        │   API Integ     │   api-integ  │
│   7-8        │   Features      │   features   │
│   9-10       │   Testing       │   testing    │
│   11         │   Release       │   main       │
└──────────────┴─────────────────┴──────────────┘
```

### **Release Process:**

1. **Alpha**: feature/v2.0.0-react-frontend
2. **Beta**: release/v2.0.0-beta
3. **RC**: release/v2.0.0-rc
4. **Release**: main + tag v2.0.0

## 💡 **Recomendação Estratégica**

### **Abordagem Gradual:**

1. **Manter v1.1.0 ativo** durante desenvolvimento v2.0
2. **Desenvolver v2.0 em paralelo** sem afetar produção
3. **Testar extensivamente** antes do release
4. **Migration guide** detalhado para usuários
5. **Rollback plan** se necessário

### **Decisão de Timing:**

- **Agora**: Se quer tecnologia moderna e melhor UX
- **Depois**: Se v1.1.0 atende necessidades atuais
- **Híbrido**: API-first permite ambas versões coexistirem

A migração para React é uma **excelente decisão estratégica** para modernizar o projeto!
