// API client for Flight Watcher
import axios from "axios";
import type { AxiosResponse } from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001";

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface Route {
  id: number;
  origin: string;
  dest: string;
  start: string;
  end: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlightOffer {
  id: number;
  route_id: number;
  price: number;
  currency: string;
  departure_time?: string;
  arrival_time?: string;
  duration_formatted?: string;
  airline_code?: string;
  airline_name?: string;
  flight_number?: string;
  cabin_class: string;
  number_of_stops: number;
  seats_available?: number;
  found_at: string;
}

export interface Price {
  id: number;
  route_id: number;
  day: string;
  value: number;
  created_at: string;
}

export interface Deal {
  id: number;
  route: Route;
  price: number;
  created_at: string;
}

export interface SystemStatus {
  status: string;
  database: string;
  amadeus: string;
  telegram: string;
}

class ApiClient {
  // Routes
  async getRoutes(): Promise<Route[]> {
    const response = await apiClient.get<Route[]>("/api/routes/");
    return response.data;
  }

  async createRoute(
    route: Omit<Route, "id" | "created_at" | "updated_at">
  ): Promise<Route> {
    const response = await apiClient.post<Route>("/api/routes/", route);
    return response.data;
  }

  async updateRoute(id: number, route: Partial<Route>): Promise<Route> {
    const response = await apiClient.put<Route>(`/api/routes/${id}`, route);
    return response.data;
  }

  async deleteRoute(id: number): Promise<void> {
    await apiClient.delete(`/api/routes/${id}`);
  }

  // Offers
  async getOffers(
    params?: Record<string, string | number>
  ): Promise<FlightOffer[]> {
    const response = await apiClient.get<FlightOffer[]>("/api/offers/", {
      params
    });
    return response.data;
  }

  async getOffer(id: number): Promise<FlightOffer> {
    const response = await apiClient.get<FlightOffer>(`/api/offers/${id}`);
    return response.data;
  }

  async searchOffers(params: Record<string, any>): Promise<FlightOffer[]> {
    const response = await apiClient.get<FlightOffer[]>("/api/offers/search", {
      params
    });
    return response.data;
  }

  // Prices
  async getPrices(routeId?: number): Promise<Price[]> {
    const params = routeId ? { route_id: routeId } : {};
    const response = await apiClient.get<Price[]>("/api/prices/", { params });
    return response.data;
  }

  async getRoutePrices(routeId: number): Promise<Price[]> {
    const response = await apiClient.get<Price[]>(
      `/api/routes/${routeId}/prices`
    );
    return response.data;
  }

  // Deals
  async getDeals(): Promise<Deal[]> {
    const response = await apiClient.get<Deal[]>("/api/deals/");
    return response.data;
  }

  // Alerts
  async getAlerts(): Promise<any[]> {
    const response = await apiClient.get<any[]>("/api/alerts");
    return response.data;
  }

  async getAlertsHistory(): Promise<any[]> {
    const response = await apiClient.get<any[]>("/api/alerts/history");
    return response.data;
  }

  async createAlert(alert: any): Promise<any> {
    const response = await apiClient.post<any>("/api/alerts", alert);
    return response.data;
  }

  async updateAlert(id: number, alert: any): Promise<any> {
    const response = await apiClient.put<any>(`/api/alerts/${id}`, alert);
    return response.data;
  }

  async deleteAlert(id: number): Promise<void> {
    await apiClient.delete(`/api/alerts/${id}`);
  }

  async toggleAlert(id: number, isActive: boolean): Promise<any> {
    const response = await apiClient.post<any>(`/api/alerts/${id}/toggle`, {
      is_active: isActive
    });
    return response.data;
  }

  async testAlert(id: number): Promise<any> {
    const response = await apiClient.post<any>(`/api/alerts/${id}/test`);
    return response.data;
  }

  // Status
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await apiClient.get<SystemStatus>("/api/status/health");
    return response.data;
  }

  async getSystemStats(): Promise<any> {
    const response = await apiClient.get<any>("/api/status/stats");
    return response.data;
  }
}

export const api = new ApiClient();
