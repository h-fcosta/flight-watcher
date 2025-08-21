// Funções utilitárias para Flight Watcher

// API Helper
class API {
  static async get(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  static async post(url, data) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  static async put(url, data) {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  static async delete(url) {
    const response = await fetch(url, {
      method: "DELETE"
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
}

// Notification Helper
class Notifications {
  static show(message, type = "info", duration = 5000) {
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white bg-${
      type === "error" ? "danger" : type
    } border-0`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

    // Adicionar ao container de toasts (criar se não existir)
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container position-fixed top-0 end-0 p-3";
      container.style.zIndex = "1050";
      document.body.appendChild(container);
    }

    container.appendChild(toast);

    // Mostrar toast
    const bsToast = new bootstrap.Toast(toast, { delay: duration });
    bsToast.show();

    // Remover depois de esconder
    toast.addEventListener("hidden.bs.toast", () => {
      toast.remove();
    });
  }

  static success(message) {
    this.show(message, "success");
  }

  static error(message) {
    this.show(message, "error");
  }

  static warning(message) {
    this.show(message, "warning");
  }

  static info(message) {
    this.show(message, "info");
  }
}

// Format Helper
class Format {
  static currency(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  }

  static date(dateString) {
    return new Date(dateString).toLocaleDateString("pt-BR");
  }

  static datetime(dateString) {
    return new Date(dateString).toLocaleString("pt-BR");
  }

  static number(value) {
    return new Intl.NumberFormat("pt-BR").format(value);
  }
}

// Chart Helper
class Charts {
  static createPriceChart(containerId, data) {
    const trace = {
      x: data.dates,
      y: data.prices,
      type: "scatter",
      mode: "lines+markers",
      name: "Preço",
      line: { color: "#0d6efd", width: 3 },
      marker: { color: "#0d6efd", size: 6 }
    };

    const layout = {
      title: `Histórico de Preços - ${data.route}`,
      xaxis: { title: "Data" },
      yaxis: { title: "Preço (R$)" },
      hovermode: "x unified",
      showlegend: false,
      margin: { t: 50, r: 30, b: 50, l: 80 }
    };

    const config = {
      responsive: true,
      displayModeBar: false
    };

    Plotly.newPlot(containerId, [trace], layout, config);

    // Adicionar linha da média se disponível
    if (data.average) {
      const avgTrace = {
        x: data.dates,
        y: Array(data.dates.length).fill(data.average),
        type: "scatter",
        mode: "lines",
        name: "Média",
        line: { color: "#ffc107", width: 2, dash: "dash" }
      };

      Plotly.addTraces(containerId, [avgTrace]);
    }
  }
}

// Loading Helper
class Loading {
  static show(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML =
        '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>';
    }
  }

  static hide(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = "";
    }
  }
}

// Validation Helper
class Validation {
  static isValidIATA(code) {
    return /^[A-Z]{3}$/.test(code);
  }

  static isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  static isValidPrice(price) {
    return !isNaN(price) && price > 0;
  }
}

// Auto-refresh functionality
class AutoRefresh {
  constructor(callback, interval = 30000) {
    this.callback = callback;
    this.interval = interval;
    this.timer = null;
    this.isActive = false;
  }

  start() {
    if (!this.isActive) {
      this.isActive = true;
      this.timer = setInterval(this.callback, this.interval);
    }
  }

  stop() {
    if (this.isActive) {
      this.isActive = false;
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  restart() {
    this.stop();
    this.start();
  }
}

// Global error handler
window.addEventListener("error", (event) => {
  console.error("Erro global:", event.error);
  Notifications.error(
    "Ocorreu um erro inesperado. Verifique o console para mais detalhes."
  );
});

// Verificar status do sistema na inicialização
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await API.get("/api/status/health");
    const statusElement = document.getElementById("system-status");
    if (statusElement && response.status === "healthy") {
      statusElement.innerHTML =
        '<i class="fas fa-circle text-success"></i> Sistema Online';
    }
  } catch (error) {
    console.error("Erro ao verificar status:", error);
    const statusElement = document.getElementById("system-status");
    if (statusElement) {
      statusElement.innerHTML =
        '<i class="fas fa-circle text-danger"></i> Sistema Offline';
    }
  }
});

// Exportar para uso global
window.API = API;
window.Notifications = Notifications;
window.Format = Format;
window.Charts = Charts;
window.Loading = Loading;
window.Validation = Validation;
window.AutoRefresh = AutoRefresh;
