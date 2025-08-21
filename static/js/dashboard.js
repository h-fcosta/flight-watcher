// Funcionalidades específicas do dashboard

class Dashboard {
  constructor() {
    this.autoRefresh = new AutoRefresh(this.refreshData.bind(this), 30000);
    this.init();
  }

  init() {
    this.loadInitialData();
    this.setupEventListeners();
    this.startAutoRefresh();
  }

  async loadInitialData() {
    await Promise.all([
      this.loadRoutes(),
      this.loadRecentPrices(),
      this.loadDeals(),
      this.loadSchedulerStatus()
    ]);
  }

  setupEventListeners() {
    // Toggle auto-refresh
    const autoRefreshToggle = document.getElementById("auto-refresh-toggle");
    if (autoRefreshToggle) {
      autoRefreshToggle.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.startAutoRefresh();
        } else {
          this.stopAutoRefresh();
        }
      });
    }

    // Manual refresh button
    const refreshBtn = document.getElementById("refresh-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.refreshData();
      });
    }

    // Search form
    const searchForm = document.getElementById("search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.performSearch();
      });
    }
  }

  async loadRoutes() {
    try {
      Loading.show("routes-content");
      const routes = await API.get("/api/routes");
      this.renderRoutes(routes);
    } catch (error) {
      console.error("Erro ao carregar rotas:", error);
      document.getElementById("routes-content").innerHTML =
        '<div class="alert alert-danger">Erro ao carregar rotas</div>';
    }
  }

  renderRoutes(routes) {
    const container = document.getElementById("routes-content");
    if (!container) return;

    if (routes.length === 0) {
      container.innerHTML =
        '<p class="text-muted">Nenhuma rota configurada.</p>';
      return;
    }

    const html = routes
      .map(
        (route) => `
            <div class="card mb-2">
                <div class="card-body py-2">
                    <div class="row align-items-center">
                        <div class="col-md-4">
                            <strong>${route.origin} → ${
          route.destination
        }</strong>
                        </div>
                        <div class="col-md-3">
                            <small class="text-muted">Partida: ${Format.date(
                              route.departure_date
                            )}</small>
                        </div>
                        <div class="col-md-3">
                            <small class="text-muted">Limite: ${Format.currency(
                              route.price_limit
                            )}</small>
                        </div>
                        <div class="col-md-2 text-end">
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="dashboard.editRoute(${
                                  route.id
                                })">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="dashboard.deleteRoute(${
                                  route.id
                                })">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
      )
      .join("");

    container.innerHTML = html;
  }

  async loadRecentPrices() {
    try {
      Loading.show("recent-prices-content");
      const prices = await API.get("/api/prices/recent?limit=10");
      this.renderRecentPrices(prices);
    } catch (error) {
      console.error("Erro ao carregar preços recentes:", error);
      document.getElementById("recent-prices-content").innerHTML =
        '<div class="alert alert-danger">Erro ao carregar preços</div>';
    }
  }

  renderRecentPrices(prices) {
    const container = document.getElementById("recent-prices-content");
    if (!container) return;

    if (prices.length === 0) {
      container.innerHTML =
        '<p class="text-muted">Nenhum preço encontrado.</p>';
      return;
    }

    const html = prices
      .map(
        (price) => `
            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                <div>
                    <strong>${price.route.origin} → ${
          price.route.destination
        }</strong><br>
                    <small class="text-muted">${Format.datetime(
                      price.created_at
                    )}</small>
                </div>
                <div class="text-end">
                    <span class="badge bg-${
                      price.price <= price.route.price_limit
                        ? "success"
                        : "secondary"
                    }">
                        ${Format.currency(price.price)}
                    </span>
                </div>
            </div>
        `
      )
      .join("");

    container.innerHTML = html;
  }

  async loadDeals() {
    try {
      Loading.show("deals-content");
      const deals = await API.get("/api/deals");
      this.renderDeals(deals);
    } catch (error) {
      console.error("Erro ao carregar promoções:", error);
      document.getElementById("deals-content").innerHTML =
        '<div class="alert alert-danger">Erro ao carregar promoções</div>';
    }
  }

  renderDeals(deals) {
    const container = document.getElementById("deals-content");
    if (!container) return;

    if (deals.length === 0) {
      container.innerHTML =
        '<p class="text-muted">Nenhuma promoção encontrada.</p>';
      return;
    }

    const html = deals
      .map(
        (deal) => `
            <div class="card mb-2">
                <div class="card-body py-2">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <strong>${deal.route.origin} → ${
          deal.route.destination
        }</strong><br>
                            <small class="text-muted">${Format.date(
                              deal.route.departure_date
                            )}</small>
                        </div>
                        <div class="col-md-3">
                            <span class="badge bg-success fs-6">${Format.currency(
                              deal.price
                            )}</span><br>
                            <small class="text-muted">Limite: ${Format.currency(
                              deal.route.price_limit
                            )}</small>
                        </div>
                        <div class="col-md-3 text-end">
                            <small class="text-muted">${Format.datetime(
                              deal.created_at
                            )}</small>
                        </div>
                    </div>
                </div>
            </div>
        `
      )
      .join("");

    container.innerHTML = html;
  }

  async loadSchedulerStatus() {
    try {
      const status = await API.get("/api/status/scheduler");
      this.renderSchedulerStatus(status);
    } catch (error) {
      console.error("Erro ao carregar status do scheduler:", error);
      const container = document.getElementById("scheduler-status");
      if (container) {
        container.innerHTML = '<span class="text-danger">Erro</span>';
      }
    }
  }

  renderSchedulerStatus(status) {
    const container = document.getElementById("scheduler-status");
    if (!container) return;

    const statusClass = status.running ? "text-success" : "text-danger";
    const statusText = status.running ? "Ativo" : "Inativo";
    const lastRun = status.last_run
      ? Format.datetime(status.last_run)
      : "Nunca";

    container.innerHTML = `
            <span class="${statusClass}">
                <i class="fas fa-circle"></i> ${statusText}
            </span>
            <br>
            <small class="text-muted">Última execução: ${lastRun}</small>
        `;
  }

  async performSearch() {
    const form = document.getElementById("search-form");
    const formData = new FormData(form);

    const searchData = {
      origin: formData.get("origin"),
      destination: formData.get("destination"),
      departure_date: formData.get("departure_date"),
      return_date: formData.get("return_date") || null,
      adults: parseInt(formData.get("adults")) || 1
    };

    // Validação básica
    if (!Validation.isValidIATA(searchData.origin)) {
      Notifications.error("Código de origem inválido (ex: GRU)");
      return;
    }

    if (!Validation.isValidIATA(searchData.destination)) {
      Notifications.error("Código de destino inválido (ex: JFK)");
      return;
    }

    if (!Validation.isValidDate(searchData.departure_date)) {
      Notifications.error("Data de partida inválida");
      return;
    }

    try {
      Loading.show("search-results");
      const results = await API.post("/api/search", searchData);
      this.renderSearchResults(results);
      Notifications.success("Busca realizada com sucesso!");
    } catch (error) {
      console.error("Erro na busca:", error);
      Notifications.error("Erro ao realizar busca. Tente novamente.");
      document.getElementById("search-results").innerHTML = "";
    }
  }

  renderSearchResults(results) {
    const container = document.getElementById("search-results");
    if (!container) return;

    if (!results || results.length === 0) {
      container.innerHTML =
        '<div class="alert alert-info">Nenhum voo encontrado.</div>';
      return;
    }

    const html = results
      .map(
        (flight) => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h6 class="mb-1">${flight.airline}</h6>
                            <div class="row">
                                <div class="col">
                                    <strong>${
                                      flight.departure_time
                                    }</strong><br>
                                    <small class="text-muted">${
                                      flight.origin
                                    }</small>
                                </div>
                                <div class="col text-center">
                                    <i class="fas fa-plane text-muted"></i><br>
                                    <small class="text-muted">${
                                      flight.duration
                                    }</small>
                                </div>
                                <div class="col text-end">
                                    <strong>${flight.arrival_time}</strong><br>
                                    <small class="text-muted">${
                                      flight.destination
                                    }</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 text-end">
                            <h5 class="text-primary mb-1">${Format.currency(
                              flight.price
                            )}</h5>
                            <button class="btn btn-primary btn-sm" onclick="dashboard.addRoute('${
                              flight.origin
                            }', '${flight.destination}', '${
          flight.departure_date
        }', ${flight.price})">
                                Monitorar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
      )
      .join("");

    container.innerHTML = html;
  }

  async addRoute(origin, destination, departureDate, priceLimit) {
    const routeData = {
      origin: origin,
      destination: destination,
      departure_date: departureDate,
      price_limit: priceLimit
    };

    try {
      await API.post("/api/routes", routeData);
      Notifications.success("Rota adicionada para monitoramento!");
      this.loadRoutes(); // Recarregar lista de rotas
    } catch (error) {
      console.error("Erro ao adicionar rota:", error);
      Notifications.error("Erro ao adicionar rota. Tente novamente.");
    }
  }

  async editRoute(routeId) {
    // TODO: Implementar modal de edição
    Notifications.info("Funcionalidade de edição em desenvolvimento");
  }

  async deleteRoute(routeId) {
    if (!confirm("Tem certeza que deseja excluir esta rota?")) {
      return;
    }

    try {
      await API.delete(`/api/routes/${routeId}`);
      Notifications.success("Rota excluída com sucesso!");
      this.loadRoutes(); // Recarregar lista de rotas
    } catch (error) {
      console.error("Erro ao excluir rota:", error);
      Notifications.error("Erro ao excluir rota. Tente novamente.");
    }
  }

  async refreshData() {
    try {
      await this.loadInitialData();
      const refreshBtn = document.getElementById("refresh-btn");
      if (refreshBtn) {
        const icon = refreshBtn.querySelector("i");
        icon.classList.add("fa-spin");
        setTimeout(() => icon.classList.remove("fa-spin"), 1000);
      }
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      Notifications.error("Erro ao atualizar dados");
    }
  }

  startAutoRefresh() {
    this.autoRefresh.start();
    const toggle = document.getElementById("auto-refresh-toggle");
    if (toggle) toggle.checked = true;
  }

  stopAutoRefresh() {
    this.autoRefresh.stop();
    const toggle = document.getElementById("auto-refresh-toggle");
    if (toggle) toggle.checked = false;
  }
}

// Inicializar dashboard quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.dashboard = new Dashboard();
});
