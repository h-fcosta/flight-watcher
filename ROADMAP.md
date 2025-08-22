# 🛫 Flight Watcher - Roadmap de Melhorias

## 🎯 v1.1.0 - Informações Detalhadas dos Voos (Próxima Release)

### 📊 **Nova Funcionalidade: Detalhes dos Voos**

#### 1. **Modelo de Dados Expandido**

```python
# Novo modelo: FlightOffer
class FlightOffer(Base):
    id: int
    route_id: int  # FK para Route
    price: float
    currency: str = "BRL"

    # Detalhes do voo
    airline_code: str  # ex: "AV"
    airline_name: str  # ex: "AVIANCA"
    flight_number: str  # ex: "AV86"
    aircraft_type: str  # ex: "333"

    # Horários
    departure_time: datetime
    arrival_time: datetime
    total_duration: str  # ex: "PT16H15M"

    # Origem/Destino detalhado
    departure_terminal: str
    arrival_terminal: str

    # Classe e serviços
    cabin_class: str  # ECONOMY, BUSINESS, FIRST
    service_class: str  # Código da classe (U, Y, etc)
    baggage_included: int  # Peças de bagagem incluídas

    # Conectividade
    number_of_stops: int
    connection_airports: str  # Lista de aeroportos de conexão

    # Disponibilidade
    seats_available: int
    last_ticketing_date: date

    # Metadados
    source: str  # GDS, LCC, etc
    found_at: datetime
```

#### 2. **API Endpoints Expandidos**

```python
# Novos endpoints
GET /api/routes/{id}/offers     # Lista ofertas detalhadas
GET /api/offers/{id}           # Detalhes de uma oferta específica
GET /api/offers/best           # Melhores ofertas gerais
GET /api/airlines/stats        # Estatísticas por companhia
```

#### 3. **Interface Melhorada**

- 📋 **Tabela de Ofertas**: Lista detalhada com filtros
- 🔍 **Busca Avançada**: Por companhia, horário, duração
- 📊 **Comparação**: Side-by-side de diferentes ofertas
- ⏰ **Timeline**: Visualização de horários de voos
- 🏢 **Filtro por Companhia**: Preferências de airlines

#### 4. **Alertas Inteligentes**

- 🎯 **Alertas Personalizados**: Por companhia preferida
- ⏰ **Alertas de Horário**: Voos em horários específicos
- 🎒 **Alertas de Bagagem**: Ofertas com bagagem incluída
- 🔄 **Alertas de Conexão**: Voos diretos vs conexões

---

## 🚀 v1.2.0 - Análise e Comparação Avançada

### 📈 **Analytics e Inteligência**

#### 1. **Dashboard de Analytics**

- 📊 **Gráficos de Tendência**: Preços por companhia ao longo do tempo
- 📅 **Calendário de Preços**: Heatmap de melhores datas
- 🏆 **Ranking de Companhias**: Melhores preços por airline
- ⏱️ **Análise de Horários**: Padrões de preço por horário

#### 2. **Recomendações Inteligentes**

- 🤖 **ML para Previsão**: Previsão de tendências de preços
- 🎯 **Recomendações Personalizadas**: Baseadas no histórico
- 📱 **Notificações Proativas**: "Melhor hora para comprar"
- 🔄 **Sugestões de Rotas**: Rotas alternativas mais baratas

#### 3. **Comparação Avançada**

- ⚖️ **Score de Ofertas**: Algoritmo que considera preço, duração, companhia
- 🔍 **Busca Flexível**: ±3 dias, aeroportos alternativos
- 💡 **Insights**: "33% mais barato que a média", "Voo mais rápido"
- 📋 **Relatórios**: PDFs com análise completa

---

## 🌟 v1.3.0 - Experiência Premium

### 🎨 **UX/UI Avançada**

#### 1. **Interface Moderna**

- 🎨 **Design System**: Componentes reutilizáveis
- 📱 **PWA**: App instalável no celular
- 🌙 **Modo Escuro**: Interface adaptativa
- 🔄 **Atualizações em Tempo Real**: WebSockets

#### 2. **Funcionalidades Premium**

- 👤 **Perfis de Usuário**: Preferências salvas
- 📧 **Múltiplos Canais**: Email, WhatsApp, Push
- 🎯 **Alertas Avançados**: ML para timing ótimo
- 💳 **Integração de Compra**: Links diretos para booking

#### 3. **Mobilidade**

- 📱 **App Mobile**: React Native/Flutter
- 🔔 **Push Notifications**: Alertas em tempo real
- 📍 **Geolocalização**: Aeroportos próximos
- 🚗 **Integração**: Uber/99 para aeroporto

---

## 🛠️ Implementação Imediata (v1.1.0)

### 🎯 **Prioridade Alta - Implementar Agora:**

#### 1. **Expandir Modelo de Dados**

```sql
-- Migration para nova tabela
CREATE TABLE flight_offers (
    id INTEGER PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id),
    price REAL NOT NULL,
    airline_code VARCHAR(3),
    airline_name VARCHAR(100),
    flight_number VARCHAR(10),
    departure_time DATETIME,
    arrival_time DATETIME,
    total_duration VARCHAR(20),
    cabin_class VARCHAR(20),
    seats_available INTEGER,
    found_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **Modificar Serviço Amadeus**

```python
# Expandir AmadeusService para capturar mais dados
def get_detailed_offers(self, day: date, origin: str, dest: str) -> List[FlightOffer]:
    """Retorna ofertas detalhadas em vez de só preço mínimo"""
    # Processar response.data completo
    # Extrair todos os campos relevantes
    # Retornar lista de objetos FlightOffer
```

#### 3. **Nova Interface de Ofertas**

- 📋 **Página /offers**: Lista detalhada de ofertas
- 🔍 **Filtros Avançados**: Por companhia, horário, classe
- 📊 **Cards de Ofertas**: Design rico com todas as informações
- 🔗 **Deep Links**: Para booking direto

### ⚡ **Quick Wins (Implementação Rápida):**

1. **Exibir Companhia Aérea** nos cards de rota
2. **Mostrar Horários** de partida/chegada
3. **Indicar Voos Diretos vs Conexões**
4. **Filtro por Companhia Preferida**
5. **Ordenação por Duração/Preço**

### 🎨 **Mockup da Nova Interface:**

```
┌─────────────────────────────────────────────────────────────┐
│ 🛫 GRU → JFK | 15/12/2025                                   │
├─────────────────────────────────────────────────────────────┤
│ 💰 R$ 1.994,50  ⏰ 16h15min  ✈️ AVIANCA  🔄 1 conexão      │
│                                                             │
│ 🛫 07:35 GRU Terminal 2  ──────────►  21:50 JFK Terminal 4  │
│         via BOG (4h35min parada)                            │
│                                                             │
│ 🎫 Classe Econômica  🎒 Bagagem extra: R$ 350              │
│ 💺 9 assentos disponíveis  ⏰ Emitir até: 22/08            │
│                                                             │
│ [📊 Ver Histórico] [🔔 Criar Alerta] [🛒 Comprar]          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚦 **Cronograma Sugerido:**

### **📅 Próximas 2 Semanas (v1.1.0)**

- ✅ Expandir modelo de dados (FlightOffer)
- ✅ Modificar AmadeusService para dados completos
- ✅ Criar página de ofertas detalhadas
- ✅ Implementar filtros básicos

### **📅 Próximo Mês (v1.2.0)**

- 📊 Dashboard de analytics
- 🤖 Algoritmos de recomendação
- 📧 Múltiplos canais de notificação
- 🔍 Busca flexível

### **📅 Próximos 3 Meses (v1.3.0)**

- 📱 App mobile
- 👤 Sistema de usuários
- 💳 Integração com booking
- 🌍 Múltiplas moedas

---

**Qual dessas melhorias te interessa mais começar primeiro?** 🤔
