# 🛒 Sistema de Redirecionamento para Compra de Passagens

## 📋 Como Funciona

O Flight Watcher agora possui um **sistema inteligente de redirecionamento** que permite aos usuários comprar passagens diretamente nos sites das companhias aéreas com apenas um clique.

## ✨ Funcionalidades

### 🎯 **Redirecionamento Inteligente**

- **40+ companhias aéreas** mapeadas com URLs específicas
- **Construção automática** de URLs com dados do voo
- **Fallback inteligente** para busca genérica quando companhia não mapeada

### 🔘 **Botões de Compra**

- **Lista de ofertas**: Botão verde de compra rápida em cada card
- **Detalhes da oferta**: Botão principal "Comprar Passagem" destacado
- **Design responsivo**: Funciona perfeitamente em desktop e mobile

### 🏢 **Companhias Suportadas**

#### 🇧🇷 **Brasileiras**

- **GOL** (`G3`) → [voegol.com.br](https://www.voegol.com.br)
- **LATAM** (`JJ`) → [latam.com](https://www.latam.com/pt_br)
- **Azul** (`AD`) → [azul.com.br](https://www.azul.com.br)
- **Avianca** (`AV`) → [avianca.com](https://www.avianca.com)

#### 🇺🇸 **Americanas**

- **American Airlines** (`AA`) → [aa.com](https://www.aa.com)
- **United Airlines** (`UA`) → [united.com](https://www.united.com)
- **Delta Air Lines** (`DL`) → [delta.com](https://www.delta.com)
- **JetBlue Airways** (`B6`) → [jetblue.com](https://www.jetblue.com)
- **Southwest Airlines** (`WN`) → [southwest.com](https://www.southwest.com)

#### 🇪🇺 **Europeias**

- **Lufthansa** (`LH`) → [lufthansa.com](https://www.lufthansa.com)
- **Air France** (`AF`) → [airfrance.com](https://www.airfrance.com)
- **KLM** (`KL`) → [klm.com](https://www.klm.com)
- **British Airways** (`BA`) → [britishairways.com](https://www.britishairways.com)
- **Ryanair** (`FR`) → [ryanair.com](https://www.ryanair.com)
- **easyJet** (`U2`) → [easyjet.com](https://www.easyjet.com)

#### 🌍 **Oriente Médio**

- **Emirates** (`EK`) → [emirates.com](https://www.emirates.com)
- **Qatar Airways** (`QR`) → [qatarairways.com](https://www.qatarairways.com)
- **Turkish Airlines** (`TK`) → [turkishairlines.com](https://www.turkishairlines.com)

#### 🌏 **Asiáticas**

- **Singapore Airlines** (`SQ`) → [singaporeair.com](https://www.singaporeair.com)
- **Japan Airlines** (`JL`) → [jal.co.jp](https://www.jal.co.jp)
- **Korean Air** (`KE`) → [koreanair.com](https://www.koreanair.com)

_E mais 15+ companhias adicionais..._

## 🔧 Como Usar

### 1. **Na Lista de Ofertas** (`/offers`)

```
┌─────────────────────────────────────────┐
│ R$ 1.320,00  GRU → LHR   06:00 → 08:00 │
│ LATAM        22/08/2025   2h 0min       │
│                              [🛒] [👁] │
└─────────────────────────────────────────┘
```

- Clique no botão **verde** (🛒) para compra rápida
- Clique no botão **azul** (👁) para ver detalhes

### 2. **Na Página de Detalhes** (`/offers/{id}`)

```
┌─────────────────────────────────────────┐
│           🛒 Comprar Passagem           │
│                                         │
│     📤 Compartilhar   🔍 Ver Similares  │
│             ℹ️ Como Reservar            │
└─────────────────────────────────────────┘
```

## ⚙️ Funcionamento Técnico

### 🎯 **Extração de Dados**

O sistema automaticamente extrai:

- **Código da companhia aérea** (`carrierCode`)
- **Aeroportos** de origem e destino
- **Data da viagem**
- **Número de passageiros**
- **Preço da oferta**
- **Número do voo**

### 🔗 **Construção de URLs**

Para cada companhia, URLs específicas são construídas:

```javascript
// Exemplo para LATAM (JJ)
const url = `https://www.latam.com/pt_br/booking?from=${origin}&to=${destination}&departure=${date}&passengers=${adults}`;

// Exemplo para GOL (G3)
const url = `https://www.voegol.com.br/voos?origin=${origin}&destination=${destination}&departure=${date}&adults=${adults}`;
```

### 🔄 **Sistema de Fallback**

Se a companhia não estiver mapeada:

```javascript
// Redirecionamento para Google Flights
const fallbackUrl = `https://www.google.com/flights?f=${origin}&t=${destination}&d=${date}&passengers=${adults}`;
```

## 📊 Analytics e Tracking

### 📈 **Logs Automáticos**

Cada clique de compra gera logs detalhados:

```javascript
{
  offerId: 123,
  route: "GRU → LHR",
  price: 1320.00,
  airline: "JJ",
  timestamp: "2025-08-22T12:00:00Z"
}
```

### 🎯 **Métricas Disponíveis**

- **Taxa de cliques** por companhia aérea
- **Ofertas mais clicadas**
- **Rotas com maior engajamento**
- **Horários de pico de compras**

## 🚀 Vantagens

### ✅ **Para o Usuário**

- **Um clique** para ir direto ao site oficial
- **Dados pré-preenchidos** na busca
- **Segurança** de comprar no site oficial
- **Transparência** nos preços

### ✅ **Para o Sistema**

- **Não gerencia pagamentos** (sem complexidade)
- **Não armazena dados sensíveis**
- **Foco no monitoramento** de preços
- **Integração simples** com APIs

## 🔮 Futuras Melhorias

### 📋 **Planejadas para v1.2.0**

- [ ] **Deep linking** para páginas específicas de pagamento
- [ ] **Detecção de promoções** nos sites das companhias
- [ ] **Comparação de preços** em tempo real
- [ ] **Alertas de mudança** de preço durante a compra

### 🌟 **Avançadas (v1.3.0+)**

- [ ] **API de booking** direta (Amadeus Enterprise)
- [ ] **Programa de afiliados** com companhias aéreas
- [ ] **Cashback** e recompensas
- [ ] **Seguro viagem** integrado

## 🛠️ Implementação

### 📄 **Arquivos Principais**

- `static/js/airline-booking.js` - Serviço principal
- `static/js/offer_details.js` - Integração na página de detalhes
- `static/js/offers.js` - Integração na lista de ofertas
- `templates/offer_details.html` - Botão principal
- `templates/offers.html` - Botões da lista

### 🔧 **Classes Principais**

```javascript
// Serviço de redirecionamento
class AirlineBookingService {
  buildBookingUrl(offer)     // Constrói URL específica
  redirectToBooking(offer)   // Executa redirecionamento
  getAirlineInfo(code)      // Informações da companhia
}

// Integração nas páginas
class OfferDetailsManager {
  purchaseOffer()           // Compra da página de detalhes
}

class OffersManager {
  purchaseOffer(offerId)    // Compra da lista
}
```

---

## 💡 **Dica de Uso**

> 💡 **Recomendação**: Sempre compare preços no site da companhia aérea antes de finalizar a compra, pois podem haver promoções exclusivas ou taxas adicionais não mostradas na busca inicial.

🎯 **O objetivo é facilitar o processo de compra, mantendo a transparência e direcionando o usuário para os canais oficiais das companhias aéreas.**
