import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Activity,
  Plane,
  DollarSign,
  TrendingDown,
  RefreshCw,
  Calendar,
  MapPin
} from "lucide-react";
import { api, type Route, type Deal } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface DashboardStats {
  active_routes: number;
  total_prices: number;
  total_deals: number;
  last_job_run: string | null;
}

interface DashboardProps {
  onRouteSelect?: (routeId: number) => void;
}

export default function Dashboard({ onRouteSelect }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [recentDeals, setRecentDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, routesData, dealsData] = await Promise.all([
        api.getSystemStats(),
        api.getRoutes(),
        api.getDeals()
      ]);

      setStats(statsData);
      setRoutes(routesData);
      setRecentDeals(dealsData.slice(0, 5)); // Últimas 5 promoções
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de monitoramento de voos
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rotas Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.active_routes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              rotas sendo monitoradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Preços Coletados
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.total_prices || 0}
            </div>
            <p className="text-xs text-muted-foreground">preços encontrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promoções</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.total_deals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              promoções encontradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Última Execução
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {stats?.last_job_run
                ? formatDateTime(stats.last_job_run)
                : "Nunca executado"}
            </div>
            <p className="text-xs text-muted-foreground">scheduler status</p>
          </CardContent>
        </Card>
      </div>

      {/* Routes and Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Rotas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {routes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma rota configurada
              </p>
            ) : (
              <div className="space-y-3">
                {routes
                  .filter((route) => route.active)
                  .slice(0, 5)
                  .map((route) => (
                    <div
                      key={route.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        onRouteSelect
                          ? "cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-colors"
                          : ""
                      }`}
                      onClick={() => onRouteSelect?.(route.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Plane className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">
                            {route.origin} → {route.dest}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(route.start).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Ativo</Badge>
                        {onRouteSelect && (
                          <div className="text-xs text-blue-600 font-medium">
                            Clique para ver ofertas
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Deals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="h-5 w-5 mr-2" />
              Promoções Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentDeals.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma promoção encontrada
              </p>
            ) : (
              <div className="space-y-3">
                {recentDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium">
                          {deal.route.origin} → {deal.route.dest}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(deal.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(deal.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
