import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Plane,
  MapPin,
  TrendingDown,
  ShoppingCart,
  ExternalLink
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { api, type Route, type FlightOffer, type Price } from "@/lib/api";

interface RouteDetailsProps {
  routeId: number;
  onBack: () => void;
}

export default function RouteDetails({ routeId, onBack }: RouteDetailsProps) {
  const [route, setRoute] = useState<Route | null>(null);
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRouteData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados da rota, ofertas e histórico de preços
      const [routeData, offersData, pricesData] = await Promise.all([
        api.getRoutes().then((routes) => routes.find((r) => r.id === routeId)),
        api.getOffers({ route_id: routeId }),
        api.getRoutePrices(routeId)
      ]);

      setRoute(routeData || null);
      setOffers(offersData);
      setPrices(pricesData);
    } catch (err) {
      setError("Erro ao carregar dados da rota");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (offer: FlightOffer) => {
    // Aqui você pode implementar a lógica de compra
    // Por exemplo, redirecionar para uma página de checkout ou site da companhia aérea
    console.log("Iniciando processo de compra para oferta:", offer);

    // Exemplo: Criar URL de busca baseada na rota e dados do voo
    const searchUrl = `https://www.google.com/flights?f=0&gl=br&hl=pt-BR&curr=BRL#flt=${route?.origin}.${route?.dest}.${route?.start}*${route?.dest}.${route?.origin}.${route?.end}`;

    // Abrir em nova aba
    window.open(searchUrl, "_blank");

    // Alternativa: Redirecionar para uma página interna de compra
    // window.location.href = `/checkout?offer=${offer.id}`;
  };

  useEffect(() => {
    loadRouteData();
  }, [routeId]);

  const formatPrice = (price: number, currency: string = "BRL") => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency
    }).format(price);
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getLowestPrice = () => {
    if (offers.length === 0) return null;
    return Math.min(...offers.map((offer) => offer.price));
  };

  const getAveragePrice = () => {
    if (prices.length === 0) return null;
    const sum = prices.reduce((acc, price) => acc + price.value, 0);
    return sum / prices.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando detalhes da rota...</p>
        </div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erro</h1>
          <p className="text-gray-600 mb-6">{error || "Rota não encontrada"}</p>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Rotas
          </Button>
        </div>
      </div>
    );
  }

  const lowestPrice = getLowestPrice();
  const averagePrice = getAveragePrice();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <MapPin className="h-8 w-8 mr-3 text-blue-600" />
              {route.origin} → {route.dest}
            </h1>
            <p className="text-gray-600 mt-1">
              {formatDate(route.start)} até {formatDate(route.end)}
            </p>
          </div>
        </div>
        <Badge
          variant={route.active ? "default" : "secondary"}
          className="text-lg px-4 py-2"
        >
          {route.active ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ofertas Encontradas
            </CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menor Preço</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {lowestPrice ? formatPrice(lowestPrice) : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averagePrice ? formatPrice(averagePrice) : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Busca</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {offers.length > 0
                ? formatDateTime(offers[0].found_at)
                : "Nenhuma busca"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Ofertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plane className="h-5 w-5 mr-2" />
            Ofertas de Voos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Plane className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">
                Nenhuma oferta encontrada
              </h3>
              <p>Ainda não há ofertas disponíveis para esta rota.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer, index) => (
                <div
                  key={`${offer.id}-${index}`}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Plane className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {offer.airline_name ||
                            offer.airline_code ||
                            "Companhia Aérea"}
                        </h3>
                        <p className="text-gray-600">
                          Voo {offer.flight_number || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">
                        {formatPrice(offer.price, offer.currency)}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">por pessoa</p>
                      <Button
                        onClick={() => handlePurchase(offer)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Comprar
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Partida</p>
                        <p className="text-sm text-gray-600">
                          {offer.departure_time
                            ? formatDateTime(offer.departure_time)
                            : "Horário não disponível"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Chegada</p>
                        <p className="text-sm text-gray-600">
                          {offer.arrival_time
                            ? formatDateTime(offer.arrival_time)
                            : "Horário não disponível"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Duração</p>
                        <p className="text-sm text-gray-600">
                          {offer.duration_formatted || "Não disponível"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Classe: {offer.cabin_class}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {offer.number_of_stops === 0
                            ? "Direto"
                            : `${offer.number_of_stops} parada${
                                offer.number_of_stops > 1 ? "s" : ""
                              }`}
                        </span>
                      </div>
                      {offer.seats_available && (
                        <div>
                          <span>
                            {offer.seats_available} assentos restantes
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-xs text-gray-400">
                        Encontrado em: {formatDateTime(offer.found_at)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePurchase(offer)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ver no Google Flights
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Preços */}
      {prices.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="h-5 w-5 mr-2" />
              Histórico de Preços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prices.slice(0, 10).map((price, index) => (
                <div
                  key={`${price.id}-${index}`}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <span className="text-sm">{formatDate(price.day)}</span>
                  <span className="font-medium">
                    {formatPrice(price.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
