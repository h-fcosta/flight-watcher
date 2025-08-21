// Funcionalidades específicas da página de rotas

class RoutesManager {
  constructor() {
    this.routes = [];
    this.filteredRoutes = [];
    this.init();
  }

  init() {
    this.loadRoutes();
    this.setupEventListeners();
    this.loadStatistics();
  }

  setupEventListeners() {
    // Formulário de filtro
    const filterForm = document.getElementById("filter-form");
    if (filterForm) {
      filterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.applyFilters();
      });
    }

    // Formulário adicionar rota
    const addForm = document.getElementById("add-route-form");
    if (addForm) {
      addForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.addRoute();
      });
    }

    // Formulário editar rota
    const editForm = document.getElementById("edit-route-form");
    if (editForm) {
      editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.updateRoute();
      });
    }

    // Validação de códigos IATA em tempo real
    this.setupIATAValidation();
  }

  setupIATAValidation() {
    const iataInputs = document.querySelectorAll(
      'input[name="origin"], input[name="destination"]'
    );
    iataInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        let value = e.target.value.toUpperCase();
        if (value.length <= 3) {
          e.target.value = value;
        }

        // Validação visual
        if (value.length === 3 && Validation.isValidIATA(value)) {
          e.target.classList.remove("is-invalid");
          e.target.classList.add("is-valid");
        } else if (value.length > 0) {
          e.target.classList.remove("is-valid");
          e.target.classList.add("is-invalid");
        } else {
          e.target.classList.remove("is-valid", "is-invalid");
        }
      });
    });
  }

  async loadRoutes() {
    try {
      Loading.show("routes-list");
      this.routes = await API.get("/api/routes");
      this.filteredRoutes = [...this.routes];
      this.renderRoutes();
    } catch (error) {
      console.error("Erro ao carregar rotas:", error);
      document.getElementById("routes-list").innerHTML =
        '<div class="alert alert-danger">Erro ao carregar rotas</div>';
    }
  }

  renderRoutes() {
    const container = document.getElementById("routes-list");
    if (!container) return;

    if (this.filteredRoutes.length === 0) {
      container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-route fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Nenhuma rota encontrada</h5>
                    <p class="text-muted">Adicione sua primeira rota para começar a monitorar preços</p>
                </div>
            `;
      return;
    }

    // Renderizar rotas
    const html = this.filteredRoutes
      .map((route) => this.renderRouteCard(route))
      .join("");
    container.innerHTML = html;
    
    // Carregar preços para cada rota
    this.loadRoutePrices();
  }

  async loadRoutePrices() {
    // Carregar preços para cada rota exibida
    for (const route of this.filteredRoutes) {
      try {
        const prices = await API.get(`/api/routes/${route.id}/prices`);
        if (prices.length > 0) {
          // Atualizar o card da rota com o último preço
          this.updateRoutePriceDisplay(route.id, prices);
        }
      } catch (error) {
        console.error(`Erro ao carregar preços da rota ${route.id}:`, error);
      }
    }
  }

  updateRoutePriceDisplay(routeId, prices) {
    const routeCard = document.querySelector(`[data-route-id="${routeId}"]`);
    if (!routeCard || !prices.length) return;

    // Encontrar o menor preço
    const minPrice = Math.min(...prices.map(p => p.value));
    const priceCount = prices.length;
    
    // Atualizar a exibição
    const priceContainer = routeCard.querySelector('.price-info');
    if (priceContainer) {
      priceContainer.innerHTML = `
        <small class="text-success">
          <i class="fas fa-dollar-sign"></i> Menor preço: ${Format.currency(minPrice)}
        </small><br>
        <small class="text-muted">${priceCount} preço(s) encontrado(s)</small>
      `;
    }
  }

  renderRouteCard(route) {
    const statusBadge = route.active
      ? '<span class="badge bg-success">Ativo</span>'
      : '<span class="badge bg-secondary">Inativo</span>';

    const endInfo =
      route.end && route.end !== route.start
        ? `<br><small class="text-muted">Até: ${Format.date(route.end)}</small>`
        : '<br><small class="text-muted">Período único</small>';

    const lastPriceInfo = route.last_price
      ? `<small class="text-muted">Último preço: ${Format.currency(
          route.last_price
        )} (${Format.datetime(route.last_checked)})</small>`
      : '<small class="text-muted">Ainda não verificado</small>';

    return `
            <div class="card mb-3" data-route-id="${route.id}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-4">
                            <div class="d-flex align-items-center">
                                <div class="route-indicator me-3">
                                    <i class="fas fa-plane text-primary"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1">${route.origin} → ${route.dest}</h6>
                                    <small class="text-muted">Início: ${Format.date(route.start)}</small>
                                    ${endInfo}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div>
                                <strong>Status: ${statusBadge}</strong><br>
                                <div class="price-info">
                                    <small class="text-muted">Buscando preços...</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="text-center">
                                <small class="text-muted">Criado em</small><br>
                                <small class="text-muted">${Format.date(new Date())}</small>
                            </div>
                        </div>
                        <div class="col-md-3 text-end">
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-info" onclick="routes.searchPrices(${route.id})" title="Buscar preços">
                                    <i class="fas fa-search"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-primary" onclick="routes.viewPriceHistory(${route.id})" title="Ver histórico">
                                    <i class="fas fa-chart-line"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-secondary" onclick="routes.editRoute(${route.id})" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-warning" onclick="routes.toggleRoute(${route.id})" title="${route.active ? "Pausar" : "Ativar"}">
                                    <i class="fas fa-${route.active ? "pause" : "play"}"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="routes.deleteRoute(${route.id})" title="Excluir">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  async addRoute() {
    const form = document.getElementById("add-route-form");
    const formData = new FormData(form);

    const routeData = {
      origin: formData.get("origin").toUpperCase(),
      dest: formData.get("destination").toUpperCase(),
      start: formData.get("departure_date"),
      end: formData.get("return_date") || formData.get("departure_date"),
      active: formData.get("is_active") === "on"
    };

    // Validação
    if (!this.validateRouteData(routeData)) {
      return;
    }

    try {
      const newRoute = await API.post("/api/routes/", routeData);
      Notifications.success("Rota adicionada com sucesso! Buscando preços iniciais...");

      // Fechar modal e recarregar dados
      bootstrap.Modal.getInstance(
        document.getElementById("addRouteModal")
      ).hide();
      form.reset();
      this.loadRoutes();
      this.loadStatistics();
      
      // Aguardar um pouco e verificar se encontrou preços
      setTimeout(async () => {
        try {
          const prices = await API.get(`/api/routes/${newRoute.id}/prices`);
          if (prices.length > 0) {
            Notifications.success(`${prices.length} preço(s) encontrado(s) para a rota!`);
          } else {
            Notifications.info("Busca de preços em andamento. Atualize a página em alguns minutos.");
          }
        } catch (error) {
          console.error("Erro ao verificar preços:", error);
        }
      }, 8000);
      
    } catch (error) {
      console.error("Erro ao adicionar rota:", error);
      Notifications.error(
        "Erro ao adicionar rota. Verifique os dados e tente novamente."
      );
    }
  }

  async editRoute(routeId) {
    const route = this.routes.find((r) => r.id === routeId);
    if (!route) return;

    // Preencher formulário de edição
    const form = document.getElementById("edit-route-form");
    form.route_id.value = route.id;
    form.origin.value = route.origin;
    form.destination.value = route.dest;
    form.departure_date.value = route.start;
    form.return_date.value = route.end || "";
    form.is_active.checked = route.active;

    // Mostrar modal
    new bootstrap.Modal(document.getElementById("editRouteModal")).show();
  }

  async updateRoute() {
    const form = document.getElementById("edit-route-form");
    const formData = new FormData(form);
    const routeId = formData.get("route_id");

    const routeData = {
      origin: formData.get("origin").toUpperCase(),
      dest: formData.get("destination").toUpperCase(),
      start: formData.get("departure_date"),
      end: formData.get("return_date") || formData.get("departure_date"),
      active: formData.get("is_active") === "on"
    };

    // Validação
    if (!this.validateRouteData(routeData)) {
      return;
    }

    try {
      await API.put(`/api/routes/${routeId}`, routeData);
      Notifications.success("Rota atualizada com sucesso!");

      // Fechar modal e recarregar dados
      bootstrap.Modal.getInstance(
        document.getElementById("editRouteModal")
      ).hide();
      this.loadRoutes();
      this.loadStatistics();
    } catch (error) {
      console.error("Erro ao atualizar rota:", error);
      Notifications.error(
        "Erro ao atualizar rota. Verifique os dados e tente novamente."
      );
    }
  }

  async deleteRoute(routeId) {
    const route = this.routes.find((r) => r.id === routeId);
    if (!route) return;

    if (
      !confirm(
        `Tem certeza que deseja excluir a rota ${route.origin} → ${route.dest}?`
      )
    ) {
      return;
    }

    try {
      await API.delete(`/api/routes/${routeId}`);
      Notifications.success("Rota excluída com sucesso!");
      this.loadRoutes();
      this.loadStatistics();
    } catch (error) {
      console.error("Erro ao excluir rota:", error);
      Notifications.error("Erro ao excluir rota. Tente novamente.");
    }
  }

  async toggleRoute(routeId) {
    const route = this.routes.find((r) => r.id === routeId);
    if (!route) return;

    const newStatus = !route.is_active;

    try {
      await API.put(`/api/routes/${routeId}`, { is_active: newStatus });
      Notifications.success(
        `Rota ${newStatus ? "ativada" : "pausada"} com sucesso!`
      );
      this.loadRoutes();
      this.loadStatistics();
    } catch (error) {
      console.error("Erro ao alterar status da rota:", error);
      Notifications.error("Erro ao alterar status da rota. Tente novamente.");
    }
  }

  async searchPrices(routeId) {
    try {
      await API.post(`/api/routes/${routeId}/search-prices`);
      Notifications.success("Busca de preços iniciada! Aguarde alguns minutos.");
      
      // Atualizar o indicador visual
      const routeCard = document.querySelector(`[data-route-id="${routeId}"]`);
      if (routeCard) {
        const priceContainer = routeCard.querySelector('.price-info');
        if (priceContainer) {
          priceContainer.innerHTML = `
            <small class="text-info">
              <i class="fas fa-spinner fa-spin"></i> Buscando preços...
            </small>
          `;
        }
      }
      
      // Verificar resultado após alguns segundos
      setTimeout(async () => {
        try {
          const prices = await API.get(`/api/routes/${routeId}/prices`);
          if (prices.length > 0) {
            this.updateRoutePriceDisplay(routeId, prices);
            Notifications.success(`${prices.length} preço(s) encontrado(s)!`);
          } else {
            const priceContainer = routeCard.querySelector('.price-info');
            if (priceContainer) {
              priceContainer.innerHTML = `
                <small class="text-warning">
                  <i class="fas fa-exclamation-triangle"></i> Nenhum preço encontrado
                </small>
              `;
            }
          }
        } catch (error) {
          console.error("Erro ao verificar preços:", error);
        }
      }, 10000);
      
    } catch (error) {
      console.error("Erro ao buscar preços:", error);
      Notifications.error("Erro ao iniciar busca de preços.");
    }
  }

  async viewPriceHistory(routeId) {
    // TODO: Implementar modal com gráfico de histórico de preços
    Notifications.info("Histórico de preços em desenvolvimento");
  }

  applyFilters() {
    const form = document.getElementById("filter-form");
    const formData = new FormData(form);

    const filters = {
      origin: formData.get("origin").toUpperCase(),
      destination: formData.get("destination").toUpperCase(),
      status: formData.get("status")
    };

    this.filteredRoutes = this.routes.filter((route) => {
      if (filters.origin && !route.origin.includes(filters.origin))
        return false;
      if (filters.destination && !route.dest.includes(filters.destination))
        return false;
      if (filters.status === "active" && !route.active) return false;
      if (filters.status === "inactive" && route.active) return false;
      return true;
    });

    this.renderRoutes();
    Notifications.info(`${this.filteredRoutes.length} rota(s) encontrada(s)`);
  }

  clearFilters() {
    const form = document.getElementById("filter-form");
    form.reset();
    this.filteredRoutes = [...this.routes];
    this.renderRoutes();
  }

  async refreshRoutes() {
    await this.loadRoutes();
    await this.loadStatistics();
    Notifications.success("Dados atualizados!");
  }

  async loadStatistics() {
    try {
      const stats = await API.get("/api/routes/statistics");

      document.getElementById("total-routes").textContent =
        stats.total_routes || 0;
      document.getElementById("active-routes").textContent =
        stats.active_routes || 0;
      document.getElementById("deals-found").textContent =
        stats.deals_found || 0;
      document.getElementById("avg-savings").textContent = stats.avg_savings
        ? Format.currency(stats.avg_savings)
        : "R$ 0,00";
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  }

  validateRouteData(data) {
    if (!Validation.isValidIATA(data.origin)) {
      Notifications.error("Código de origem inválido (ex: GRU)");
      return false;
    }

    if (!Validation.isValidIATA(data.dest)) {
      Notifications.error("Código de destino inválido (ex: JFK)");
      return false;
    }

    if (data.origin === data.dest) {
      Notifications.error("Origem e destino não podem ser iguais");
      return false;
    }

    if (!Validation.isValidDate(data.start)) {
      Notifications.error("Data de início inválida");
      return false;
    }

    if (new Date(data.start) < new Date()) {
      Notifications.error("Data de início não pode ser no passado");
      return false;
    }

    if (data.end && new Date(data.end) < new Date(data.start)) {
      Notifications.error("Data de fim deve ser posterior à data de início");
      return false;
    }

    return true;
  }
}

// Inicializar gerenciador de rotas quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.routes = new RoutesManager();
});
