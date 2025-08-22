/**
 * Mapeamento de companhias aéreas e seus sites para redirecionamento de compras
 */

class AirlineBookingService {
  constructor() {
    // Mapeamento dos códigos IATA para URLs das companhias aéreas
    this.airlineUrls = {
      // Companhias Brasileiras
      G3: "https://www.voegol.com.br", // GOL
      JJ: "https://www.latam.com/pt_br", // LATAM (TAM)
      AD: "https://www.azul.com.br", // Azul
      AV: "https://www.avianca.com", // Avianca

      // Companhias Americanas
      AA: "https://www.aa.com", // American Airlines
      UA: "https://www.united.com", // United Airlines
      DL: "https://www.delta.com", // Delta Air Lines
      B6: "https://www.jetblue.com", // JetBlue Airways
      AS: "https://www.alaskaair.com", // Alaska Airlines
      F9: "https://www.frontierairlines.com", // Frontier Airlines
      NK: "https://www.spirit.com", // Spirit Airlines

      // Companhias Europeias
      LH: "https://www.lufthansa.com", // Lufthansa
      AF: "https://www.airfrance.com", // Air France
      KL: "https://www.klm.com", // KLM
      BA: "https://www.britishairways.com", // British Airways
      IB: "https://www.iberia.com", // Iberia
      TP: "https://www.tap.pt", // TAP Air Portugal
      LX: "https://www.swiss.com", // Swiss International
      OS: "https://www.austrian.com", // Austrian Airlines
      SN: "https://www.brusselsairlines.com", // Brussels Airlines
      AZ: "https://www.ita-airways.com", // ITA Airways
      FR: "https://www.ryanair.com", // Ryanair
      U2: "https://www.easyjet.com", // easyJet
      VY: "https://www.vueling.com", // Vueling

      // Companhias do Oriente Médio
      EK: "https://www.emirates.com", // Emirates
      QR: "https://www.qatarairways.com", // Qatar Airways
      EY: "https://www.etihad.com", // Etihad Airways
      TK: "https://www.turkishairlines.com", // Turkish Airlines

      // Companhias Asiáticas
      SQ: "https://www.singaporeair.com", // Singapore Airlines
      CX: "https://www.cathaypacific.com", // Cathay Pacific
      JL: "https://www.jal.co.jp", // Japan Airlines
      NH: "https://www.ana.co.jp", // All Nippon Airways
      KE: "https://www.koreanair.com", // Korean Air
      OZ: "https://flyasiana.com", // Asiana Airlines
      CI: "https://www.china-airlines.com", // China Airlines
      BR: "https://www.evaair.com", // EVA Air
      TG: "https://www.thaiairways.com", // Thai Airways
      VN: "https://www.vietnamairlines.com", // Vietnam Airlines

      // Companhias Oceania
      QF: "https://www.qantas.com", // Qantas
      JQ: "https://www.jetstar.com", // Jetstar
      VA: "https://www.virginaustralia.com", // Virgin Australia
      NZ: "https://www.airnewzealand.com", // Air New Zealand

      // Companhias Africanas
      SA: "https://www.flysaa.com", // South African Airways
      ET: "https://www.ethiopianairlines.com", // Ethiopian Airlines
      MS: "https://www.egyptair.com", // EgyptAir
      AT: "https://www.royalairmaroc.com", // Royal Air Maroc

      // Companhias Low-Cost Globais
      WN: "https://www.southwest.com", // Southwest Airlines
      EI: "https://www.aerlingus.com", // Aer Lingus
      W6: "https://wizzair.com", // Wizz Air
      PC: "https://www.flypegasus.com" // Pegasus Airlines
    };

    // Mapeamento de nomes alternativos para códigos
    this.airlineNames = {
      TAM: "JJ",
      LATAM: "JJ",
      GOL: "G3",
      AZUL: "AD",
      AVIANCA: "AV",
      AMERICAN: "AA",
      UNITED: "UA",
      DELTA: "DL",
      LUFTHANSA: "LH",
      "AIR FRANCE": "AF",
      KLM: "KL",
      "BRITISH AIRWAYS": "BA",
      EMIRATES: "EK",
      QATAR: "QR",
      TURKISH: "TK"
    };
  }

  /**
   * Constrói URL de redirecionamento para compra da passagem
   * @param {Object} offer - Dados da oferta de voo
   * @returns {string} URL para redirecionamento
   */
  buildBookingUrl(offer) {
    try {
      // Extrair dados principais da oferta
      const carrierCode = this.extractCarrierCode(offer);
      const flightData = this.extractFlightData(offer);

      // Obter URL base da companhia
      const baseUrl = this.getAirlineUrl(carrierCode);

      if (!baseUrl) {
        // Fallback para busca genérica
        return this.buildGenericSearchUrl(flightData);
      }

      // Construir URL específica da companhia
      return this.buildCarrierSpecificUrl(baseUrl, carrierCode, flightData);
    } catch (error) {
      console.error("Erro ao construir URL de booking:", error);
      return this.buildGenericSearchUrl(offer);
    }
  }

  /**
   * Extrai código da companhia aérea principal
   */
  extractCarrierCode(offer) {
    // Tentar diferentes locais onde o código pode estar
    if (
      offer.itineraries &&
      offer.itineraries[0] &&
      offer.itineraries[0].segments
    ) {
      return offer.itineraries[0].segments[0].carrierCode;
    }

    if (
      offer.validatingAirlineCodes &&
      offer.validatingAirlineCodes.length > 0
    ) {
      return offer.validatingAirlineCodes[0];
    }

    if (offer.carrierCode) {
      return offer.carrierCode;
    }

    return null;
  }

  /**
   * Extrai dados essenciais do voo
   */
  extractFlightData(offer) {
    const firstSegment = offer.itineraries?.[0]?.segments?.[0];
    const lastSegment = offer.itineraries?.[0]?.segments?.slice(-1)[0];

    return {
      origin: firstSegment?.departure?.iataCode || "",
      destination: lastSegment?.arrival?.iataCode || "",
      departureDate: firstSegment?.departure?.at?.split("T")[0] || "",
      returnDate:
        offer.itineraries?.[1]?.segments?.[0]?.departure?.at?.split("T")[0] ||
        null,
      adults: 1, // Padrão, pode ser configurável
      currency: offer.price?.currency || "BRL",
      price: offer.price?.grandTotal || "",
      flightNumber: firstSegment
        ? `${firstSegment.carrierCode}${firstSegment.number}`
        : ""
    };
  }

  /**
   * Obtém URL base da companhia aérea
   */
  getAirlineUrl(carrierCode) {
    if (!carrierCode) return null;

    // Buscar diretamente pelo código
    const url = this.airlineUrls[carrierCode.toUpperCase()];
    if (url) return url;

    // Buscar por nome alternativo
    const altCode = this.airlineNames[carrierCode.toUpperCase()];
    if (altCode) {
      return this.airlineUrls[altCode];
    }

    return null;
  }

  /**
   * Constrói URL específica para cada companhia
   */
  buildCarrierSpecificUrl(baseUrl, carrierCode, flightData) {
    const params = new URLSearchParams();

    // Parâmetros comuns para a maioria das companhias
    const commonParams = {
      from: flightData.origin,
      to: flightData.destination,
      departure: flightData.departureDate,
      adults: flightData.adults,
      currency: flightData.currency
    };

    // URLs específicas por companhia aérea
    switch (carrierCode.toUpperCase()) {
      case "G3": // GOL
        return `${baseUrl}/voos?origin=${flightData.origin}&destination=${flightData.destination}&departure=${flightData.departureDate}&adults=${flightData.adults}`;

      case "JJ": // LATAM
        return `${baseUrl}/booking?from=${flightData.origin}&to=${flightData.destination}&departure=${flightData.departureDate}&passengers=${flightData.adults}`;

      case "AD": // Azul
        return `${baseUrl}/voos/pesquisar?origem=${flightData.origin}&destino=${flightData.destination}&ida=${flightData.departureDate}&adultos=${flightData.adults}`;

      case "AV": // Avianca
        return `${baseUrl}/booking/flight-search?origin=${flightData.origin}&destination=${flightData.destination}&departure=${flightData.departureDate}&adults=${flightData.adults}`;

      case "AA": // American Airlines
        return `${baseUrl}/booking/search?departureLocation=${flightData.origin}&destinationLocation=${flightData.destination}&departureDate=${flightData.departureDate}&adults=${flightData.adults}`;

      case "UA": // United Airlines
        return `${baseUrl}/booking/flights?f=${flightData.origin}&t=${flightData.destination}&d=${flightData.departureDate}&px=${flightData.adults}`;

      case "DL": // Delta
        return `${baseUrl}/flight-search/book-a-flight?origin=${flightData.origin}&destination=${flightData.destination}&departure=${flightData.departureDate}&passengers=${flightData.adults}`;

      case "LH": // Lufthansa
        return `${baseUrl}/booking?origin=${flightData.origin}&destination=${flightData.destination}&departure=${flightData.departureDate}&adults=${flightData.adults}`;

      case "AF": // Air France
        return `${baseUrl}/booking/search?origin=${flightData.origin}&destination=${flightData.destination}&departure=${flightData.departureDate}&adults=${flightData.adults}`;

      case "EK": // Emirates
        return `${baseUrl}/booking/flight-search?origin=${flightData.origin}&destination=${flightData.destination}&departure=${flightData.departureDate}&adults=${flightData.adults}`;

      default:
        // URL genérica para companhias não mapeadas especificamente
        Object.entries(commonParams).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        return `${baseUrl}/booking?${params.toString()}`;
    }
  }

  /**
   * Constrói URL de busca genérica como fallback
   */
  buildGenericSearchUrl(flightData) {
    // Usar Google Flights como fallback
    const params = new URLSearchParams({
      f: flightData.origin || "",
      t: flightData.destination || "",
      d: flightData.departureDate || "",
      passengers: flightData.adults || 1
    });

    return `https://www.google.com/flights?${params.toString()}`;
  }

  /**
   * Obtém informações da companhia aérea
   */
  getAirlineInfo(carrierCode) {
    const url = this.getAirlineUrl(carrierCode);
    return {
      code: carrierCode,
      url: url,
      hasDirectBooking: !!url,
      name: this.getAirlineName(carrierCode)
    };
  }

  /**
   * Obtém nome da companhia aérea
   */
  getAirlineName(carrierCode) {
    const names = {
      G3: "GOL Linhas Aéreas",
      JJ: "LATAM Airlines",
      AD: "Azul Linhas Aéreas",
      AV: "Avianca",
      AA: "American Airlines",
      UA: "United Airlines",
      DL: "Delta Air Lines",
      LH: "Lufthansa",
      AF: "Air France",
      KL: "KLM",
      BA: "British Airways",
      EK: "Emirates",
      QR: "Qatar Airways",
      TK: "Turkish Airlines"
    };

    return names[carrierCode?.toUpperCase()] || carrierCode;
  }

  /**
   * Abre URL de booking em nova aba
   */
  redirectToBooking(offer) {
    const url = this.buildBookingUrl(offer);
    const carrierCode = this.extractCarrierCode(offer);
    const airlineInfo = this.getAirlineInfo(carrierCode);

    // Log para debugging
    console.log("Redirecionando para booking:", {
      airline: airlineInfo.name,
      code: carrierCode,
      url: url,
      hasDirectBooking: airlineInfo.hasDirectBooking
    });

    // Mostrar notificação ao usuário
    if (airlineInfo.hasDirectBooking) {
      Notifications.info(`Redirecionando para ${airlineInfo.name}...`);
    } else {
      Notifications.info("Abrindo busca genérica...");
    }

    // Abrir em nova aba
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

// Instância global do serviço
const airlineBookingService = new AirlineBookingService();
