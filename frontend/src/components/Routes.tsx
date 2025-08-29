import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  MapPin,
  Calendar,
  Activity,
  Eye
} from "lucide-react";
import { api, type Route } from "@/lib/api";
import { formatDate, isValidIATACode, isValidDate } from "@/lib/utils";

interface RoutesProps {
  onRouteSelect?: (routeId: number) => void;
}

export default function Routes({ onRouteSelect }: RoutesProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    origin: "",
    dest: "",
    start: "",
    end: "",
    active: true
  });

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await api.getRoutes();
      setRoutes(data);
    } catch (error) {
      console.error("Erro ao carregar rotas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!isValidIATACode(formData.origin.toUpperCase())) {
      alert("Código de origem inválido (ex: GRU)");
      return;
    }

    if (!isValidIATACode(formData.dest.toUpperCase())) {
      alert("Código de destino inválido (ex: JFK)");
      return;
    }

    if (!isValidDate(formData.start)) {
      alert("Data de início inválida");
      return;
    }

    try {
      const routeData = {
        origin: formData.origin.toUpperCase(),
        dest: formData.dest.toUpperCase(),
        start: formData.start,
        end: formData.end || formData.start,
        active: formData.active
      };

      if (editingRoute) {
        await api.updateRoute(editingRoute.id, routeData);
      } else {
        await api.createRoute(routeData);
      }

      setFormData({ origin: "", dest: "", start: "", end: "", active: true });
      setShowAddForm(false);
      setEditingRoute(null);
      loadRoutes();
    } catch (error) {
      console.error("Erro ao salvar rota:", error);
      alert("Erro ao salvar rota");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta rota?")) {
      try {
        await api.deleteRoute(id);
        loadRoutes();
      } catch (error) {
        console.error("Erro ao excluir rota:", error);
        alert("Erro ao excluir rota");
      }
    }
  };

  const handleToggleActive = async (route: Route) => {
    try {
      await api.updateRoute(route.id, { active: !route.active });
      loadRoutes();
    } catch (error) {
      console.error("Erro ao atualizar status da rota:", error);
      alert("Erro ao atualizar status da rota");
    }
  };

  const startEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      origin: route.origin,
      dest: route.dest,
      start: route.start,
      end: route.end,
      active: route.active
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingRoute(null);
    setFormData({ origin: "", dest: "", start: "", end: "", active: true });
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando rotas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rotas Monitoradas</h1>
          <p className="text-muted-foreground">
            Gerencie as rotas de voo que você deseja monitorar
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadRoutes} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Rota
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRoute ? "Editar Rota" : "Nova Rota"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin">Origem</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        origin: e.target.value.toUpperCase()
                      })
                    }
                    placeholder="Ex: GRU"
                    maxLength={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dest">Destino</Label>
                  <Input
                    id="dest"
                    value={formData.dest}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        dest: e.target.value.toUpperCase()
                      })
                    }
                    placeholder="Ex: JFK"
                    maxLength={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="start">Data de Início</Label>
                  <Input
                    id="start"
                    type="date"
                    value={formData.start}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, start: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end">Data de Fim</Label>
                  <Input
                    id="end"
                    type="date"
                    value={formData.end}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, end: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                />
                <Label htmlFor="active">Rota ativa</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingRoute ? "Atualizar" : "Criar"} Rota
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Routes List */}
      <div className="grid gap-4">
        {routes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma rota encontrada
              </h3>
              <p className="text-muted-foreground mb-4">
                Adicione sua primeira rota para começar a monitorar preços
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Rota
              </Button>
            </CardContent>
          </Card>
        ) : (
          routes.map((route) => (
            <Card key={route.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span className="text-xl font-semibold">
                        {route.origin} → {route.dest}
                      </span>
                    </div>
                    <Badge variant={route.active ? "default" : "secondary"}>
                      {route.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onRouteSelect) {
                          onRouteSelect(route.id);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Ofertas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(route)}
                    >
                      {route.active ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(route)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(route.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Início: {formatDate(route.start)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Fim: {formatDate(route.end)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Criado: {formatDate(route.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
