import React, { useState, useEffect } from 'react';
import { RefreshCw, Bell, Plus, Trash2, Settings, Mail, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { api, type Route } from '@/lib/api';

interface AlertRule {
  id: number;
  route_id: number;
  price_threshold: number;
  notification_type: string;
  telegram_chat_id?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

interface AlertHistory {
  id: number;
  route_id: number;
  price: number;
  sent_at: string;
  notification_type: string;
  status: string;
}

export default function Alerts() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertRule | null>(null);

  const [formData, setFormData] = useState({
    route_id: '',
    price_threshold: '',
    notification_type: 'telegram',
    telegram_chat_id: '',
    email: '',
    is_active: true
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [alertsData, historyData, routesData] = await Promise.all([
        api.getAlerts(),
        api.getAlertsHistory(),
        api.getRoutes()
      ]);
      
      setAlertRules(alertsData);
      setAlertHistory(historyData);
      setRoutes(routesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const alertData = {
        route_id: parseInt(formData.route_id),
        price_threshold: parseFloat(formData.price_threshold),
        notification_type: formData.notification_type,
        telegram_chat_id: formData.telegram_chat_id || null,
        email: formData.email || null,
        is_active: formData.is_active
      };

      if (editingAlert) {
        await api.updateAlert(editingAlert.id, alertData);
      } else {
        await api.createAlert(alertData);
      }

      setFormData({
        route_id: '',
        price_threshold: '',
        notification_type: 'telegram',
        telegram_chat_id: '',
        email: '',
        is_active: true
      });
      setEditingAlert(null);
      setShowForm(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao salvar alerta:', error);
    }
  };

  const handleEdit = (alert: AlertRule) => {
    setFormData({
      route_id: alert.route_id.toString(),
      price_threshold: alert.price_threshold.toString(),
      notification_type: alert.notification_type,
      telegram_chat_id: alert.telegram_chat_id || '',
      email: alert.email || '',
      is_active: alert.is_active
    });
    setEditingAlert(alert);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este alerta?')) {
      try {
        await api.deleteAlert(id);
        await loadData();
      } catch (error) {
        console.error('Erro ao excluir alerta:', error);
      }
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      await api.toggleAlert(id, isActive);
      await loadData();
    } catch (error) {
      console.error('Erro ao alterar status do alerta:', error);
    }
  };

  const testAlert = async (id: number) => {
    try {
      await api.testAlert(id);
      alert('Alerta de teste enviado!');
    } catch (error) {
      console.error('Erro ao enviar alerta de teste:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getRouteLabel = (routeId: number) => {
    const route = routes.find(r => r.id === routeId);
    return route ? `${route.origin} → ${route.dest}` : `Rota ${routeId}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando alertas...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Sistema de Alertas</h1>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Alerta
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {alertRules.filter(a => a.is_active).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alertRules.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enviados Hoje</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {alertHistory.filter(h => 
                  new Date(h.sent_at).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {alertHistory.length > 0 
                  ? Math.round((alertHistory.filter(h => h.status === 'sent').length / alertHistory.length) * 100)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingAlert ? 'Editar Alerta' : 'Novo Alerta'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="route_id">Rota</Label>
                    <select
                      id="route_id"
                      value={formData.route_id}
                      onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione uma rota</option>
                      {routes.map(route => (
                        <option key={route.id} value={route.id}>
                          {route.origin} → {route.dest}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="price_threshold">Preço Limite (R$)</Label>
                    <Input
                      id="price_threshold"
                      type="number"
                      step="0.01"
                      value={formData.price_threshold}
                      onChange={(e) => setFormData({ ...formData, price_threshold: e.target.value })}
                      placeholder="Ex: 800.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notification_type">Tipo de Notificação</Label>
                  <select
                    id="notification_type"
                    value={formData.notification_type}
                    onChange={(e) => setFormData({ ...formData, notification_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="telegram">Telegram</option>
                    <option value="email">Email</option>
                    <option value="both">Telegram + Email</option>
                  </select>
                </div>

                {(formData.notification_type === 'telegram' || formData.notification_type === 'both') && (
                  <div>
                    <Label htmlFor="telegram_chat_id">Chat ID do Telegram</Label>
                    <Input
                      id="telegram_chat_id"
                      value={formData.telegram_chat_id}
                      onChange={(e) => setFormData({ ...formData, telegram_chat_id: e.target.value })}
                      placeholder="Ex: 123456789"
                    />
                  </div>
                )}

                {(formData.notification_type === 'email' || formData.notification_type === 'both') && (
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Ex: user@email.com"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingAlert ? 'Atualizar' : 'Criar'} Alerta
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowForm(false);
                    setEditingAlert(null);
                    setFormData({
                      route_id: '',
                      price_threshold: '',
                      notification_type: 'telegram',
                      telegram_chat_id: '',
                      email: '',
                      is_active: true
                    });
                  }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Alertas Configurados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertRules.map(alert => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{getRouteLabel(alert.route_id)}</h3>
                      <p className="text-sm text-gray-600">
                        Alerta quando preço ≤ R$ {alert.price_threshold}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={alert.is_active ? "default" : "secondary"}>
                          {alert.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant="outline">
                          {alert.notification_type}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Criado em: {formatDateTime(alert.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testAlert(alert.id)}
                      >
                        Testar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(alert)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant={alert.is_active ? "destructive" : "default"}
                        onClick={() => toggleActive(alert.id, !alert.is_active)}
                      >
                        {alert.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(alert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {alertRules.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Nenhum alerta configurado</p>
                  <p className="text-sm">Clique em "Novo Alerta" para começar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertHistory.slice(0, 10).map(history => (
                <div key={history.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <span className="font-medium">{getRouteLabel(history.route_id)}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      R$ {history.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={history.status === 'sent' ? 'default' : 'destructive'}>
                      {history.status === 'sent' ? 'Enviado' : 'Erro'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(history.sent_at)}
                    </span>
                  </div>
                </div>
              ))}

              {alertHistory.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>Nenhum alerta enviado ainda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
