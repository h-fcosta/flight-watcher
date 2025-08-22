// offer_details.js - Gerenciamento da página de detalhes da oferta

class OfferDetailsManager {
  constructor() {
    this.offerId = window.offerId;
    this.offer = null;
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadOfferDetails();
  }

  setupEventListeners() {
    // Botão refresh
    document.getElementById("refreshButton").addEventListener("click", () => {
      this.loadOfferDetails();
    });

    // Botão principal de compra
    document.getElementById("purchaseButton").addEventListener("click", () => {
      this.purchaseOffer();
    });

    // Botão compartilhar
    document.getElementById("shareButton").addEventListener("click", () => {
      this.shareOffer();
    });

    // Botão ver ofertas similares
    document
      .getElementById("viewSimilarButton")
      .addEventListener("click", () => {
        this.viewSimilarOffers();
      });

    // Botão informações de reserva
    document
      .getElementById("bookingInfoButton")
      .addEventListener("click", () => {
        const modal = new bootstrap.Modal(
          document.getElementById("bookingInfoModal")
        );
        modal.show();
      });
  }

  async loadOfferDetails() {
    this.showLoading();

    try {
      const response = await fetch(`/api/offers/${this.offerId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Oferta não encontrada");
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      this.offer = await response.json();
      this.renderOfferDetails();
      this.hideLoading();
    } catch (error) {
      console.error("Erro ao carregar detalhes da oferta:", error);
      this.showError(error.message);
      this.hideLoading();
    }
  }

  showLoading() {
    document.getElementById("loadingSpinner").style.display = "block";
    document.getElementById("offerContent").style.display = "none";
    document.getElementById("errorContent").style.display = "none";
  }

  hideLoading() {
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("offerContent").style.display = "block";
  }

  renderOfferDetails() {
    const offer = this.offer;

    // Informações da companhia aérea
    document.getElementById("airlineCode").textContent =
      offer.airline_code || "-";
    document.getElementById("airlineName").textContent =
      offer.airline_name || "Não informado";
    document.getElementById("flightNumber").textContent =
      offer.flight_number || "-";
    document.getElementById("aircraftType").textContent =
      offer.aircraft_type || "-";
    document.getElementById("cabinClass").textContent =
      offer.cabin_class || "ECONOMY";

    // Horários e duração
    if (offer.departure_time) {
      const departureTime = new Date(offer.departure_time);
      document.getElementById("departureTime").textContent =
        departureTime.toLocaleString("pt-BR");
    } else {
      document.getElementById("departureTime").textContent = "-";
    }

    if (offer.arrival_time) {
      const arrivalTime = new Date(offer.arrival_time);
      document.getElementById("arrivalTime").textContent =
        arrivalTime.toLocaleString("pt-BR");
    } else {
      document.getElementById("arrivalTime").textContent = "-";
    }

    document.getElementById("duration").textContent =
      offer.duration_formatted || "-";
    document.getElementById("stopsInfo").textContent = offer.stops_text || "-";
    document.getElementById("departureTerminal").textContent =
      offer.departure_terminal ? `Terminal ${offer.departure_terminal}` : "-";
    document.getElementById("arrivalTerminal").textContent =
      offer.arrival_terminal ? `Terminal ${offer.arrival_terminal}` : "-";

    // Preços
    document.getElementById(
      "totalPrice"
    ).textContent = `R$ ${offer.price.toFixed(2)}`;
    document.getElementById("basePrice").textContent = offer.base_price
      ? `R$ ${offer.base_price.toFixed(2)}`
      : "-";
    document.getElementById("taxesFees").textContent = offer.taxes_fees
      ? `R$ ${offer.taxes_fees.toFixed(2)}`
      : "-";

    // Disponibilidade
    document.getElementById("seatsAvailable").textContent =
      offer.seats_available || "-";

    if (offer.last_ticketing_date) {
      const ticketingDate = new Date(offer.last_ticketing_date);
      document.getElementById("lastTicketingDate").textContent =
        ticketingDate.toLocaleDateString("pt-BR");
    } else {
      document.getElementById("lastTicketingDate").textContent = "-";
    }

    // Rota
    if (offer.route) {
      document.getElementById("originCode").textContent = offer.route.origin;
      document.getElementById("destCode").textContent = offer.route.dest;

      const startDate = new Date(offer.route.start);
      const endDate = new Date(offer.route.end);
      document.getElementById(
        "routePeriod"
      ).textContent = `${startDate.toLocaleDateString(
        "pt-BR"
      )} - ${endDate.toLocaleDateString("pt-BR")}`;

      const statusClass = offer.route.active ? "text-success" : "text-danger";
      const statusText = offer.route.active ? "Ativa" : "Inativa";
      document.getElementById(
        "routeStatus"
      ).innerHTML = `<span class="${statusClass}">${statusText}</span>`;
    }

    // Conexões
    this.renderConnections();

    // Bagagem
    document.getElementById("baggagePieces").textContent =
      offer.baggage_pieces > 0
        ? `${offer.baggage_pieces} peça(s)`
        : "Não incluída";
    document.getElementById("baggageExtraCost").textContent =
      offer.baggage_extra_cost > 0
        ? `R$ ${offer.baggage_extra_cost.toFixed(2)}`
        : "Sem custo extra";

    // Informações técnicas
    document.getElementById("source").textContent = offer.source || "GDS";

    if (offer.found_at) {
      const foundDate = new Date(offer.found_at);
      document.getElementById("foundAt").textContent =
        foundDate.toLocaleString("pt-BR");
    } else {
      document.getElementById("foundAt").textContent = "-";
    }
  }

  renderConnections() {
    const connectionsDiv = document.getElementById("connectionsInfo");

    if (this.offer.number_of_stops === 0) {
      connectionsDiv.innerHTML = `
                <div class="text-center py-3">
                    <i class="bi bi-check-circle text-success fs-3"></i>
                    <p class="text-success mt-2 mb-0">Voo Direto</p>
                </div>
            `;
      return;
    }

    let connectionsHtml = `
            <div class="mb-3">
                <strong>${this.offer.number_of_stops} parada(s)</strong>
            </div>
        `;

    if (this.offer.connection_airports) {
      const airports = this.offer.connection_airports.split(",");
      connectionsHtml += `
                <div class="mb-2">
                    <small class="text-muted">Aeroportos de conexão:</small>
                    <div class="mt-1">
                        ${airports
                          .map(
                            (airport) =>
                              `<span class="badge bg-info me-1">${airport.trim()}</span>`
                          )
                          .join("")}
                    </div>
                </div>
            `;
    }

    if (this.offer.layover_duration_minutes > 0) {
      const hours = Math.floor(this.offer.layover_duration_minutes / 60);
      const minutes = this.offer.layover_duration_minutes % 60;
      connectionsHtml += `
                <div>
                    <small class="text-muted">Tempo de conexão:</small>
                    <div class="fw-bold">${hours}h ${minutes}min</div>
                </div>
            `;
    }

    connectionsDiv.innerHTML = connectionsHtml;
  }

  shareOffer() {
    if (navigator.share) {
      navigator
        .share({
          title: `Oferta de Voo - ${this.offer.route?.origin} → ${this.offer.route?.dest}`,
          text: `Encontrei uma oferta de voo por R$ ${this.offer.price.toFixed(
            2
          )}`,
          url: window.location.href
        })
        .catch(console.error);
    } else {
      // Fallback para clipboard
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          this.showToast("Link copiado para a área de transferência!");
        })
        .catch(() => {
          this.showToast("Não foi possível copiar o link");
        });
    }
  }

  viewSimilarOffers() {
    if (!this.offer.route) return;

    // Redirecionar para a página de ofertas com filtros da rota
    const params = new URLSearchParams();
    params.set("route_id", this.offer.route_id);
    params.set("max_price", Math.ceil(this.offer.price * 1.2)); // 20% a mais que o preço atual

    window.location.href = `/offers?${params.toString()}`;
  }

  purchaseOffer() {
    if (!this.offer) {
      this.showToast("Erro: Dados da oferta não carregados");
      return;
    }

    try {
      // Usar o serviço de booking de companhias aéreas
      airlineBookingService.redirectToBooking(this.offer);

      // Log analytics (opcional)
      this.trackPurchaseClick();
    } catch (error) {
      console.error("Erro ao redirecionar para compra:", error);
      this.showToast("Erro ao abrir página de compra. Tente novamente.");
    }
  }

  trackPurchaseClick() {
    // Registrar clique para analytics (opcional)
    if (this.offer) {
      console.log("Purchase click tracked:", {
        offerId: this.offer.id,
        route: `${this.offer.route?.origin} → ${this.offer.route?.dest}`,
        price: this.offer.price,
        airline: this.offer.airline_code,
        timestamp: new Date().toISOString()
      });

      // Aqui você pode enviar para serviços de analytics como Google Analytics
      // gtag('event', 'purchase_click', { ... });
    }
  }

  showError(message) {
    document.getElementById("errorMessage").textContent = message;
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("offerContent").style.display = "none";
    document.getElementById("errorContent").style.display = "block";
  }

  showToast(message) {
    // Como não temos toast na página de detalhes, usar alert simples
    alert(message);
  }
}

// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  new OfferDetailsManager();
});
