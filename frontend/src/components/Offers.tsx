import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Search,
  Calendar,
  MapPin,
  Clock,
  Users
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { api, type FlightOffer } from "../lib/api";

export default function Offers() {
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchForm, setSearchForm] = useState({
    origin: "",
    destination: "",
    departure_date: "",
    return_date: "",
    adults: "1",
    children: "0",
    infants: "0",
    class: "ECONOMY",
    max_offers: "100"
  });

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOffers();
      setOffers(data);
    } catch (err) {
      setError("Erro ao carregar ofertas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchOffers = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSearchLoading(true);
      setError(null);

      const searchParams = {
        origin: searchForm.origin,
        destination: searchForm.destination,
        departure_date: searchForm.departure_date,
        return_date: searchForm.return_date || undefined,
        adults: parseInt(searchForm.adults),
        children: parseInt(searchForm.children),
        infants: parseInt(searchForm.infants),
        travel_class: searchForm.class,
        max_offers: parseInt(searchForm.max_offers)
      };

      const results = await api.searchOffers(searchParams);
      setOffers(results);
    } catch (err) {
      setError("Erro ao buscar ofertas");
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL"
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando ofertas...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Ofertas de Voos</h1>

        {/* Formulário de Busca */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Buscar Ofertas</h2>
          <form onSubmit={searchOffers}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="origin">Origem</Label>
                <Input
                  id="origin"
                  value={searchForm.origin}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchForm({
                      ...searchForm,
                      origin: e.target.value.toUpperCase()
                    })
                  }
                  placeholder="Ex: GRU"
                  maxLength={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="destination">Destino</Label>
                <Input
                  id="destination"
                  value={searchForm.destination}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchForm({
                      ...searchForm,
                      destination: e.target.value.toUpperCase()
                    })
                  }
                  placeholder="Ex: JFK"
                  maxLength={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="departure_date">Data de Ida</Label>
                <Input
                  id="departure_date"
                  type="date"
                  value={searchForm.departure_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchForm({
                      ...searchForm,
                      departure_date: e.target.value
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="return_date">Data de Volta (opcional)</Label>
                <Input
                  id="return_date"
                  type="date"
                  value={searchForm.return_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchForm({
                      ...searchForm,
                      return_date: e.target.value
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <Label htmlFor="adults">Adultos</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  max="9"
                  value={searchForm.adults}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchForm({ ...searchForm, adults: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="children">Crianças</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  max="9"
                  value={searchForm.children}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchForm({ ...searchForm, children: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="infants">Bebês</Label>
                <Input
                  id="infants"
                  type="number"
                  min="0"
                  max="9"
                  value={searchForm.infants}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchForm({ ...searchForm, infants: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="class">Classe</Label>
                <select
                  id="class"
                  value={searchForm.class}
                  onChange={(e) =>
                    setSearchForm({ ...searchForm, class: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ECONOMY">Econômica</option>
                  <option value="PREMIUM_ECONOMY">Econômica Premium</option>
                  <option value="BUSINESS">Executiva</option>
                  <option value="FIRST">Primeira Classe</option>
                </select>
              </div>
              <div>
                <Label htmlFor="max_offers">Máx. Ofertas</Label>
                <Input
                  id="max_offers"
                  type="number"
                  min="1"
                  max="250"
                  value={searchForm.max_offers}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchForm({ ...searchForm, max_offers: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={searchLoading}>
                <Search className="h-4 w-4 mr-2" />
                {searchLoading ? "Buscando..." : "Buscar Ofertas"}
              </Button>
              <Button type="button" variant="outline" onClick={loadOffers}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Lista
              </Button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Lista de Ofertas */}
        <div className="grid gap-6">
          {offers.map((offer, index) => (
            <div
              key={`${offer.id}-${index}`}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-lg">
                      Oferta #{offer.id}
                    </span>
                    <Badge variant="secondary">
                      {offer.airline_code || "N/A"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Saída:{" "}
                        {offer.departure_time
                          ? formatDateTime(offer.departure_time)
                          : "N/A"}
                      </span>
                    </div>
                    {offer.arrival_time && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Chegada: {formatDateTime(offer.arrival_time)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(offer.price, offer.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {offer.cabin_class} - {offer.number_of_stops} paradas
                  </div>
                </div>
              </div>

              {/* Detalhes dos Voos */}
              <div className="space-y-4">
                <div className="border-l-4 border-blue-200 pl-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {offer.airline_name || offer.airline_code}{" "}
                        {offer.flight_number}
                      </div>
                      <div className="text-sm text-gray-600">
                        Classe: {offer.cabin_class}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{offer.duration_formatted || "N/A"}</span>
                      </div>
                      <div className="text-gray-500">
                        {offer.number_of_stops === 0
                          ? "Direto"
                          : `${offer.number_of_stops} paradas`}
                      </div>
                    </div>
                  </div>
                  {offer.departure_time && offer.arrival_time && (
                    <div className="text-sm text-gray-600 mt-1">
                      {formatDateTime(offer.departure_time)} -{" "}
                      {formatDateTime(offer.arrival_time)}
                    </div>
                  )}
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm text-gray-600">
                    {offer.seats_available && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {offer.seats_available} assentos disponíveis
                        </span>
                      </div>
                    )}
                    <div>Encontrado em: {formatDateTime(offer.found_at)}</div>
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm text-gray-600">
                    {offer.seats_available && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {offer.seats_available} assentos disponíveis
                        </span>
                      </div>
                    )}
                    <div>Encontrado em: {formatDateTime(offer.found_at)}</div>
                  </div>
                  <Button variant="outline">Ver Detalhes</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {offers.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">Nenhuma oferta encontrada</p>
            <p className="text-sm">
              Use o formulário acima para buscar ofertas de voos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
