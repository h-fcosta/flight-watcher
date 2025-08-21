// Funcionalidades específicas da página de promoções

class DealsManager {
  constructor() {
    this.deals = [];
    this.filteredDeals = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.currentSort = "date_desc";
    this.selectedDeal = null;
    this.init();
  }

  init() {
    this.loadDeals();
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

    // Ordenação
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.currentSort = e.target.value;
        this.sortAndRenderDeals();
      });
    }

    // Auto-refresh a cada 2 minutos
    this.autoRefresh = new AutoRefresh(this.refreshDeals.bind(this), 120000);
    this.autoRefresh.start();
  }

  async loadDeals() {
    try {
      Loading.show("deals-list");
      this.deals = await API.get("/api/deals");
      this.filteredDeals = [...this.deals];
      this.sortAndRenderDeals();
    } catch (error) {
      console.error("Erro ao carregar promoções:", error);
      document.getElementById("deals-list").innerHTML =
        '<div class="alert alert-danger">Erro ao carregar promoções</div>';
    }
  }

  sortAndRenderDeals() {
    // Ordenar deals
    this.filteredDeals.sort((a, b) => {
      switch (this.currentSort) {
        case "date_desc":
          return new Date(b.created_at) - new Date(a.created_at);
        case "date_asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "saving_desc":
          return (
            b.route.price_limit - b.price - (a.route.price_limit - a.price)
          );
        default:
          return 0;
      }
    });

    this.renderDeals();
    this.renderPagination();
  }

  renderDeals() {
    const container = document.getElementById("deals-list");
    if (!container) return;

    if (this.filteredDeals.length === 0) {
      container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-tag fa-3x text-muted mb-3"></i>
                    <h5>Nenhuma promoção encontrada</h5>
                    <p class="text-muted">As promoções aparecerão aqui quando os preços estiverem abaixo dos limites definidos</p>
                </div>
            `;
      return;
    }

    // Calcular itens da página atual
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageDeals = this.filteredDeals.slice(startIndex, endIndex);

    const html = pageDeals.map((deal) => this.renderDealCard(deal)).join("");
    container.innerHTML = html;
  }

  renderDealCard(deal) {
    const saving = deal.route.price_limit - deal.price;
    const savingPercent = ((saving / deal.route.price_limit) * 100).toFixed(1);

    const returnInfo = deal.route.return_date
      ? `<br><small class="text-muted">Retorno: ${Format.date(
          deal.route.return_date
        )}</small>`
      : '<br><small class="text-muted">Só ida</small>';

    return `
            <div class="card mb-3 deal-card" data-deal-id="${deal.id}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-4">
                            <div class="d-flex align-items-center">
                                <div class="deal-indicator me-3">
                                    <i class="fas fa-plane text-success"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1">${deal.route.origin} → ${
      deal.route.destination
    }</h6>
                                    <small class="text-muted">Partida: ${Format.date(
                                      deal.route.departure_date
                                    )}</small>
                                    ${returnInfo}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div>
                                <h5 class="text-success mb-1">${Format.currency(
                                  deal.price
                                )}</h5>
                                <small class="text-muted">Limite: ${Format.currency(
                                  deal.route.price_limit
                                )}</small>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="text-center">
                                <span class="badge bg-success fs-6">${Format.currency(
                                  saving
                                )}</span>
                                <br>
                                <small class="text-muted">${savingPercent}% economia</small>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <small class="text-muted">${Format.datetime(
                              deal.created_at
                            )}</small>
                        </div>
                        <div class="col-md-1 text-end">
                            <div class="btn-group-vertical">
                                <button class="btn btn-sm btn-outline-primary" onclick="deals.viewDealDetails(${
                                  deal.id
                                })" title="Ver detalhes">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-success" onclick="deals.bookDeal(${
                                  deal.id
                                })" title="Reservar">
                                    <i class="fas fa-calendar-check"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  renderPagination() {
    const container = document.getElementById("pagination");
    if (!container) return;

    const totalPages = Math.ceil(this.filteredDeals.length / this.itemsPerPage);

    if (totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    let html = "";

    // Botão anterior
    if (this.currentPage > 1) {
      html += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="deals.goToPage(${
                      this.currentPage - 1
                    })">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
            `;
    }

    // Números das páginas
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);

    if (startPage > 1) {
      html +=
        '<li class="page-item"><a class="page-link" href="#" onclick="deals.goToPage(1)">1</a></li>';
      if (startPage > 2) {
        html +=
          '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const activeClass = i === this.currentPage ? "active" : "";
      html += `
                <li class="page-item ${activeClass}">
                    <a class="page-link" href="#" onclick="deals.goToPage(${i})">${i}</a>
                </li>
            `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html +=
          '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
      html += `<li class="page-item"><a class="page-link" href="#" onclick="deals.goToPage(${totalPages})">${totalPages}</a></li>`;
    }

    // Botão próximo
    if (this.currentPage < totalPages) {
      html += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="deals.goToPage(${
                      this.currentPage + 1
                    })">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            `;
    }

    container.innerHTML = html;
  }

  goToPage(page) {
    this.currentPage = page;
    this.renderDeals();
    this.renderPagination();
  }

  applyFilters() {
    const form = document.getElementById("filter-form");
    const formData = new FormData(form);

    const filters = {
      origin: formData.get("origin").toUpperCase(),
      destination: formData.get("destination").toUpperCase(),
      max_price: parseFloat(formData.get("max_price")) || null,
      date_from: formData.get("date_from"),
      date_to: formData.get("date_to")
    };

    this.filteredDeals = this.deals.filter((deal) => {
      if (filters.origin && !deal.route.origin.includes(filters.origin))
        return false;
      if (
        filters.destination &&
        !deal.route.destination.includes(filters.destination)
      )
        return false;
      if (filters.max_price && deal.price > filters.max_price) return false;

      const dealDate = new Date(deal.created_at);
      if (filters.date_from && dealDate < new Date(filters.date_from))
        return false;
      if (filters.date_to && dealDate > new Date(filters.date_to + "T23:59:59"))
        return false;

      return true;
    });

    this.currentPage = 1;
    this.sortAndRenderDeals();
    Notifications.info(
      `${this.filteredDeals.length} promoção(ões) encontrada(s)`
    );
  }

  clearFilters() {
    const form = document.getElementById("filter-form");
    form.reset();
    this.filteredDeals = [...this.deals];
    this.currentPage = 1;
    this.sortAndRenderDeals();
  }

  async viewDealDetails(dealId) {
    const deal = this.deals.find((d) => d.id === dealId);
    if (!deal) return;

    this.selectedDeal = deal;

    const saving = deal.route.price_limit - deal.price;
    const savingPercent = ((saving / deal.route.price_limit) * 100).toFixed(1);

    const content = `
            <div class="row">
                <div class="col-md-6">
                    <h5><i class="fas fa-plane text-primary"></i> ${
                      deal.route.origin
                    } → ${deal.route.destination}</h5>
                    
                    <div class="mb-3">
                        <strong>Detalhes do Voo:</strong>
                        <ul class="list-unstyled ms-3">
                            <li><i class="fas fa-calendar"></i> Partida: ${Format.date(
                              deal.route.departure_date
                            )}</li>
                            ${
                              deal.route.return_date
                                ? `<li><i class="fas fa-calendar"></i> Retorno: ${Format.date(
                                    deal.route.return_date
                                  )}</li>`
                                : '<li><i class="fas fa-arrow-right"></i> Viagem só de ida</li>'
                            }
                            <li><i class="fas fa-users"></i> ${
                              deal.route.adults
                            } adulto(s)</li>
                        </ul>
                    </div>
                    
                    <div class="mb-3">
                        <strong>Preços:</strong>
                        <ul class="list-unstyled ms-3">
                            <li class="text-success"><i class="fas fa-tag"></i> Preço encontrado: <strong>${Format.currency(
                              deal.price
                            )}</strong></li>
                            <li class="text-muted"><i class="fas fa-limit"></i> Limite definido: ${Format.currency(
                              deal.route.price_limit
                            )}</li>
                            <li class="text-primary"><i class="fas fa-piggy-bank"></i> Economia: <strong>${Format.currency(
                              saving
                            )} (${savingPercent}%)</strong></li>
                        </ul>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h2 class="text-success">${Format.currency(
                              deal.price
                            )}</h2>
                            <p class="mb-3">Preço por pessoa</p>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-success btn-lg" onclick="deals.bookDeal(${
                                  deal.id
                                })">
                                    <i class="fas fa-calendar-check"></i> Reservar Agora
                                </button>
                                <button class="btn btn-outline-primary" onclick="deals.setAlert(${
                                  deal.id
                                })">
                                    <i class="fas fa-bell"></i> Criar Alerta Similar
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <small class="text-muted">
                            <i class="fas fa-clock"></i> Promoção encontrada em ${Format.datetime(
                              deal.created_at
                            )}
                        </small>
                    </div>
                </div>
            </div>
        `;

    document.getElementById("deal-details-content").innerHTML = content;
    new bootstrap.Modal(document.getElementById("dealDetailsModal")).show();
  }

  async bookDeal(dealId) {
    const deal = this.deals.find((d) => d.id === dealId);
    if (!deal) return;

    // TODO: Integração com sistema de reservas
    Notifications.info("Redirecionando para sistema de reservas...");

    // Simulação de redirecionamento
    setTimeout(() => {
      window.open(
        `https://www.amadeus.com/search?origin=${deal.route.origin}&destination=${deal.route.destination}&departure=${deal.route.departure_date}`,
        "_blank"
      );
    }, 1000);
  }

  async setAlert(dealId) {
    const deal = this.deals.find((d) => d.id === dealId);
    if (!deal) return;

    // TODO: Implementar criação de alerta similar
    Notifications.info("Funcionalidade de alerta em desenvolvimento");
  }

  async refreshDeals() {
    await this.loadDeals();
    await this.loadStatistics();
    Notifications.success("Promoções atualizadas!");
  }

  async loadStatistics() {
    try {
      const stats = await API.get("/api/deals/statistics");

      document.getElementById("total-deals").textContent =
        stats.total_deals || 0;
      document.getElementById("best-deal").textContent = stats.best_deal
        ? Format.currency(stats.best_deal)
        : "N/A";
      document.getElementById("avg-saving").textContent = stats.avg_saving
        ? Format.currency(stats.avg_saving)
        : "R$ 0,00";
      document.getElementById("today-deals").textContent =
        stats.today_deals || 0;
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  }

  async exportDeals() {
    try {
      // TODO: Implementar exportação de dados
      const csvData = this.generateCSV();
      this.downloadCSV(
        csvData,
        `promocoes_${new Date().toISOString().split("T")[0]}.csv`
      );
      Notifications.success("Dados exportados com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      Notifications.error("Erro ao exportar dados");
    }
  }

  generateCSV() {
    const headers = [
      "Data",
      "Origem",
      "Destino",
      "Partida",
      "Retorno",
      "Preço",
      "Limite",
      "Economia"
    ];
    const rows = this.filteredDeals.map((deal) => [
      Format.datetime(deal.created_at),
      deal.route.origin,
      deal.route.destination,
      Format.date(deal.route.departure_date),
      deal.route.return_date ? Format.date(deal.route.return_date) : "N/A",
      deal.price,
      deal.route.price_limit,
      deal.route.price_limit - deal.price
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }

  downloadCSV(csvData, filename) {
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  shareDeal() {
    if (!this.selectedDeal) return;

    const deal = this.selectedDeal;
    const text = `🎯 Promoção encontrada!\n${deal.route.origin} → ${
      deal.route.destination
    }\n💰 ${Format.currency(deal.price)}\n📅 ${Format.date(
      deal.route.departure_date
    )}`;

    if (navigator.share) {
      navigator.share({
        title: "Promoção de Voo",
        text: text,
        url: window.location.href
      });
    } else {
      // Fallback para clipboard
      navigator.clipboard.writeText(text).then(() => {
        Notifications.success(
          "Informações copiadas para a área de transferência!"
        );
      });
    }
  }
}

// Inicializar gerenciador de promoções quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.deals = new DealsManager();
});
