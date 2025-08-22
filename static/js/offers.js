// offers.js - Gerenciamento da página de ofertas

class OffersManager {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 20;
    this.filters = {
      route_id: null,
      airline_code: null,
      max_stops: null,
      min_price: null,
      max_price: null,
      cabin_class: null,
      seats_available: null,
      sort_by: "price",
      order: "asc"
    };
    this.offers = [];
    this.routes = [];
    this.airlines = [];

    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.loadURLParams(); // Carregar parâmetros da URL
    await this.loadInitialData();
    await this.loadOffers();
  }

  loadURLParams() {
    const urlParams = new URLSearchParams(window.location.search);

    // Verificar parâmetro route_id na URL
    const routeId = urlParams.get("route_id");
    if (routeId) {
      this.filters.route_id = routeId;
    }

    // Outros parâmetros da URL que podem ser úteis
    const airline = urlParams.get("airline_code");
    if (airline) {
      this.filters.airline_code = airline;
    }

    const maxStops = urlParams.get("max_stops");
    if (maxStops) {
      this.filters.max_stops = parseInt(maxStops);
    }
  }

  setupEventListeners() {
    // Filtros rápidos
    document.getElementById("routeFilter").addEventListener("change", (e) => {
      this.filters.route_id = e.target.value || null;
      this.currentPage = 1;
      this.updateRouteFilterInfo();
      this.loadOffers();
    });

    document.getElementById("airlineFilter").addEventListener("change", (e) => {
      this.filters.airline_code = e.target.value || null;
      this.currentPage = 1;
      this.loadOffers();
    });

    document.getElementById("stopsFilter").addEventListener("change", (e) => {
      this.filters.max_stops = e.target.value ? parseInt(e.target.value) : null;
      this.currentPage = 1;
      this.loadOffers();
    });

    document.getElementById("sortBy").addEventListener("change", (e) => {
      this.filters.sort_by = e.target.value;
      this.currentPage = 1;
      this.loadOffers();
    });

    // Botão refresh
    document.getElementById("refreshButton").addEventListener("click", () => {
      this.loadOffers();
    });

    // Filtros avançados
    document.getElementById("applyFilters").addEventListener("click", () => {
      this.applyAdvancedFilters();
    });

    document.getElementById("clearFilters").addEventListener("click", () => {
      this.clearAllFilters();
    });
  }

  async loadInitialData() {
    try {
      // Carregar rotas
      const routesResponse = await fetch("/api/routes/");
      if (routesResponse.ok) {
        this.routes = await routesResponse.json();
        this.populateRouteFilter();
      }

      // Carregar resumo das companhias
      const airlinesResponse = await fetch("/api/offers/airlines/summary");
      if (airlinesResponse.ok) {
        this.airlines = await airlinesResponse.json();
        this.populateAirlineFilter();
      }

      // Aplicar outros filtros da URL
      this.applyURLFiltersToUI();
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
    }
  }

  applyURLFiltersToUI() {
    // Aplicar filtro de paradas se existir
    if (this.filters.max_stops !== null) {
      const stopsSelect = document.getElementById("stopsFilter");
      if (stopsSelect) {
        stopsSelect.value = this.filters.max_stops.toString();
      }
    }
  }

  populateRouteFilter() {
    const select = document.getElementById("routeFilter");
    select.innerHTML = '<option value="">Todas as rotas</option>';

    this.routes.forEach((route) => {
      const option = document.createElement("option");
      option.value = route.id;
      option.textContent = `${route.origin} → ${route.dest}`;
      select.appendChild(option);
    });

    // Aplicar filtro da URL se existir
    if (this.filters.route_id) {
      select.value = this.filters.route_id;
      this.updateRouteFilterInfo();
    }
  }

  updateRouteFilterInfo() {
    const routeInfoDiv = document.getElementById("routeFilterInfo");
    const routeInfoText = document.getElementById("routeFilterText");

    if (this.filters.route_id && this.routes.length > 0) {
      const selectedRoute = this.routes.find(
        (r) => r.id == this.filters.route_id
      );
      if (selectedRoute) {
        routeInfoText.textContent = `${selectedRoute.origin} → ${selectedRoute.dest}`;
        routeInfoDiv.style.display = "block";
      }
    } else {
      routeInfoDiv.style.display = "none";
    }
  }

  populateAirlineFilter() {
    const select = document.getElementById("airlineFilter");
    select.innerHTML = '<option value="">Todas as companhias</option>';

    this.airlines.forEach((airline) => {
      const option = document.createElement("option");
      option.value = airline.airline_code;
      option.textContent = `${airline.airline_code} - ${airline.airline_name} (${airline.offers_count})`;
      select.appendChild(option);
    });

    // Aplicar filtro da URL se existir
    if (this.filters.airline_code) {
      select.value = this.filters.airline_code;
    }
  }

  async loadOffers() {
    this.showLoading();

    try {
      const params = new URLSearchParams();
      params.append("skip", (this.currentPage - 1) * this.itemsPerPage);
      params.append("limit", this.itemsPerPage);

      // Adicionar filtros
      Object.entries(this.filters).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/offers/?${params}`);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      this.offers = await response.json();
      this.renderOffers();
      this.updateStatistics();
      this.hideLoading();
    } catch (error) {
      console.error("Erro ao carregar ofertas:", error);
      this.showError("Erro ao carregar ofertas: " + error.message);
      this.hideLoading();
    }
  }

  showLoading() {
    document.getElementById("loadingSpinner").style.display = "block";
    document.getElementById("offersContainer").style.display = "none";
  }

  hideLoading() {
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("offersContainer").style.display = "block";
  }

  renderOffers() {
    const container = document.getElementById("offersContainer");

    if (this.offers.length === 0) {
      container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-search fs-1 text-muted"></i>
                    <p class="text-muted mt-3">Nenhuma oferta encontrada com os filtros aplicados.</p>
                    <button class="btn btn-outline-primary" onclick="offersManager.clearAllFilters()">
                        Limpar Filtros
                    </button>
                </div>
            `;
      return;
    }

    const offersHtml = this.offers
      .map((offer) => this.renderOfferCard(offer))
      .join("");
    container.innerHTML = offersHtml;
  }

  renderOfferCard(offer) {
    const route = this.routes.find((r) => r.id === offer.route_id);
    const routeText = route
      ? `${route.origin} → ${route.dest}`
      : "Rota não encontrada";

    const departureTime = offer.departure_time
      ? new Date(offer.departure_time).toLocaleString("pt-BR")
      : "-";
    const arrivalTime = offer.arrival_time
      ? new Date(offer.arrival_time).toLocaleString("pt-BR")
      : "-";

    const stopsText =
      offer.number_of_stops === 0
        ? "Direto"
        : `${offer.number_of_stops} parada${
            offer.number_of_stops > 1 ? "s" : ""
          }`;

    const duration = offer.duration_formatted || "-";
    const seatsInfo = offer.seats_available
      ? `${offer.seats_available} assentos`
      : "Consultar disponibilidade";

    return `
            <div class="card mb-3 offer-card" data-offer-id="${offer.id}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <div class="text-center">
                                <h5 class="text-success mb-1">R$ ${offer.price.toFixed(
                                  2
                                )}</h5>
                                <small class="text-muted">${
                                  offer.currency
                                }</small>
                            </div>
                        </div>
                        
                        <div class="col-md-3">
                            <h6 class="mb-1">${routeText}</h6>
                            <small class="text-muted">
                                <i class="bi bi-building me-1"></i>
                                ${offer.airline_code || "-"} ${
      offer.airline_name || ""
    }
                            </small>
                        </div>
                        
                        <div class="col-md-2">
                            <small class="text-muted">Partida</small>
                            <div class="fw-bold">${departureTime}</div>
                        </div>
                        
                        <div class="col-md-2">
                            <small class="text-muted">Chegada</small>
                            <div class="fw-bold">${arrivalTime}</div>
                        </div>
                        
                        <div class="col-md-2">
                            <small class="text-muted">Duração</small>
                            <div class="fw-bold">${duration}</div>
                            <small class="text-info">${stopsText}</small>
                        </div>
                        
                        <div class="col-md-1 text-end">
                            <button class="btn btn-outline-primary btn-sm" 
                                    onclick="window.location.href='/offers/${
                                      offer.id
                                    }'">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="row mt-2">
                        <div class="col-12">
                            <small class="text-muted">
                                <span class="badge bg-secondary me-2">${
                                  offer.cabin_class
                                }</span>
                                <span class="me-3"><i class="bi bi-person me-1"></i>${seatsInfo}</span>
                                ${
                                  offer.flight_number
                                    ? `<span class="me-3"><i class="bi bi-airplane me-1"></i>${offer.flight_number}</span>`
                                    : ""
                                }
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  updateStatistics() {
    if (this.offers.length === 0) return;

    const totalOffers = this.offers.length;
    const prices = this.offers.map((offer) => offer.price);
    const minPrice = Math.min(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const uniqueAirlines = new Set(
      this.offers.map((offer) => offer.airline_code).filter(Boolean)
    ).size;
    const directFlights = this.offers.filter(
      (offer) => offer.number_of_stops === 0
    ).length;

    document.getElementById("totalOffers").textContent = totalOffers;
    document.getElementById("minPrice").textContent = `R$ ${minPrice.toFixed(
      2
    )}`;
    document.getElementById("avgPrice").textContent = `R$ ${avgPrice.toFixed(
      2
    )}`;
    document.getElementById("totalAirlines").textContent = uniqueAirlines;
    document.getElementById("directFlights").textContent = directFlights;
  }

  applyAdvancedFilters() {
    this.filters.min_price =
      document.getElementById("minPriceInput").value || null;
    this.filters.max_price =
      document.getElementById("maxPriceInput").value || null;
    this.filters.cabin_class =
      document.getElementById("cabinClassFilter").value || null;
    this.filters.seats_available =
      document.getElementById("seatsAvailable").value || null;

    this.currentPage = 1;
    this.loadOffers();
  }

  clearAllFilters() {
    // Limpar filtros
    this.filters = {
      route_id: null,
      airline_code: null,
      max_stops: null,
      min_price: null,
      max_price: null,
      cabin_class: null,
      seats_available: null,
      sort_by: "price",
      order: "asc"
    };

    // Resetar elementos do form
    document.getElementById("routeFilter").value = "";
    document.getElementById("airlineFilter").value = "";
    document.getElementById("stopsFilter").value = "";
    document.getElementById("sortBy").value = "price";
    document.getElementById("minPriceInput").value = "";
    document.getElementById("maxPriceInput").value = "";
    document.getElementById("cabinClassFilter").value = "";
    document.getElementById("seatsAvailable").value = "";

    this.currentPage = 1;
    this.loadOffers();
    this.showToast("Filtros limpos com sucesso!");
  }

  showError(message) {
    document.getElementById("offersContainer").innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Erro!</h4>
                <p>${message}</p>
                <button class="btn btn-outline-danger" onclick="location.reload()">
                    Tentar Novamente
                </button>
            </div>
        `;
  }

  showToast(message) {
    document.getElementById("toastMessage").textContent = message;
    const toast = new bootstrap.Toast(
      document.getElementById("notificationToast")
    );
    toast.show();
  }
}

// Inicializar quando a página carregar
let offersManager;
document.addEventListener("DOMContentLoaded", () => {
  offersManager = new OffersManager();
});
