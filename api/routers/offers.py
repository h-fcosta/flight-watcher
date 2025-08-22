from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from ..database import get_db
from ..models import FlightOffer, Route
from ..schemas import FlightOffer as FlightOfferSchema, FlightOfferDetailed

router = APIRouter(prefix="/offers", tags=["offers"])
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[FlightOfferSchema])
def get_offers(
    skip: int = Query(0, ge=0, description="Número de ofertas para pular"),
    limit: int = Query(
        100, ge=1, le=1000, description="Número máximo de ofertas a retornar"
    ),
    route_id: Optional[int] = Query(None, description="Filtrar por ID da rota"),
    min_price: Optional[float] = Query(None, ge=0, description="Preço mínimo"),
    max_price: Optional[float] = Query(None, ge=0, description="Preço máximo"),
    airline_code: Optional[str] = Query(None, description="Código da companhia aérea"),
    max_stops: Optional[int] = Query(
        None, ge=0, description="Número máximo de paradas"
    ),
    cabin_class: Optional[str] = Query(None, description="Classe da cabine"),
    db: Session = Depends(get_db),
):
    """
    Listar ofertas de voo com filtros opcionais.
    """
    try:
        query = db.query(FlightOffer)

        # Aplicar filtros
        if route_id:
            query = query.filter(FlightOffer.route_id == route_id)

        if min_price is not None:
            query = query.filter(FlightOffer.price >= min_price)

        if max_price is not None:
            query = query.filter(FlightOffer.price <= max_price)

        if airline_code:
            query = query.filter(FlightOffer.airline_code == airline_code)

        if max_stops is not None:
            query = query.filter(FlightOffer.number_of_stops <= max_stops)

        if cabin_class:
            query = query.filter(FlightOffer.cabin_class == cabin_class)

        # Ordenar por preço (mais barato primeiro)
        query = query.order_by(FlightOffer.price.asc())

        # Aplicar paginação
        offers = query.offset(skip).limit(limit).all()

        # Converter para esquemas com campos calculados
        result = []
        for offer in offers:
            offer_dict = {
                "id": offer.id,
                "route_id": offer.route_id,
                "price": offer.price,
                "currency": offer.currency,
                "base_price": offer.base_price,
                "taxes_fees": offer.taxes_fees,
                "airline_code": offer.airline_code,
                "airline_name": offer.airline_name,
                "flight_number": offer.flight_number,
                "aircraft_type": offer.aircraft_type,
                "departure_time": offer.departure_time,
                "arrival_time": offer.arrival_time,
                "total_duration_minutes": offer.total_duration_minutes,
                "departure_terminal": offer.departure_terminal,
                "arrival_terminal": offer.arrival_terminal,
                "cabin_class": offer.cabin_class,
                "service_class": offer.service_class,
                "baggage_pieces": offer.baggage_pieces,
                "baggage_extra_cost": offer.baggage_extra_cost,
                "number_of_stops": offer.number_of_stops,
                "connection_airports": offer.connection_airports,
                "layover_duration_minutes": offer.layover_duration_minutes,
                "seats_available": offer.seats_available,
                "last_ticketing_date": offer.last_ticketing_date,
                "source": offer.source,
                "amadeus_offer_id": offer.amadeus_offer_id,
                "raw_data": offer.raw_data,
                "found_at": offer.found_at,
                "duration_formatted": offer.format_duration(),
                "stops_text": offer.get_stops_text(),
            }
            result.append(FlightOfferSchema(**offer_dict))

        logger.info(f"Retornando {len(result)} ofertas de voo")
        return result

    except Exception as e:
        logger.error(f"Erro ao buscar ofertas: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{offer_id}", response_model=FlightOfferDetailed)
def get_offer_details(offer_id: int, db: Session = Depends(get_db)):
    """
    Obter detalhes completos de uma oferta de voo específica.
    """
    try:
        offer = db.query(FlightOffer).filter(FlightOffer.id == offer_id).first()

        if not offer:
            raise HTTPException(status_code=404, detail="Oferta não encontrada")

        # Carregar dados da rota relacionada
        route = db.query(Route).filter(Route.id == offer.route_id).first()

        # Criar objeto de resposta com campos calculados
        offer_dict = {
            "id": offer.id,
            "route_id": offer.route_id,
            "price": offer.price,
            "currency": offer.currency,
            "base_price": offer.base_price,
            "taxes_fees": offer.taxes_fees,
            "airline_code": offer.airline_code,
            "airline_name": offer.airline_name,
            "flight_number": offer.flight_number,
            "aircraft_type": offer.aircraft_type,
            "departure_time": offer.departure_time,
            "arrival_time": offer.arrival_time,
            "total_duration_minutes": offer.total_duration_minutes,
            "departure_terminal": offer.departure_terminal,
            "arrival_terminal": offer.arrival_terminal,
            "cabin_class": offer.cabin_class,
            "service_class": offer.service_class,
            "baggage_pieces": offer.baggage_pieces,
            "baggage_extra_cost": offer.baggage_extra_cost,
            "number_of_stops": offer.number_of_stops,
            "connection_airports": offer.connection_airports,
            "layover_duration_minutes": offer.layover_duration_minutes,
            "seats_available": offer.seats_available,
            "last_ticketing_date": offer.last_ticketing_date,
            "source": offer.source,
            "amadeus_offer_id": offer.amadeus_offer_id,
            "raw_data": offer.raw_data,
            "found_at": offer.found_at,
            "duration_formatted": offer.format_duration(),
            "stops_text": offer.get_stops_text(),
            # Adicionar informações da rota
            "route_origin": route.origin if route else None,
            "route_destination": route.dest if route else None,
            "route_name": f"{route.origin} → {route.dest}" if route else None,
        }

        return FlightOfferDetailed(**offer_dict)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar detalhes da oferta {offer_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar detalhes da oferta {offer_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/route/{route_id}", response_model=List[FlightOfferSchema])
def get_offers_by_route(
    route_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    sort_by: str = Query(
        "price", description="Ordenar por: price, departure_time, duration"
    ),
    order: str = Query("asc", description="Ordem: asc ou desc"),
    db: Session = Depends(get_db),
):
    """
    Obter ofertas de voo para uma rota específica.
    """
    try:
        # Verificar se a rota existe
        route = db.query(Route).filter(Route.id == route_id).first()
        if not route:
            raise HTTPException(status_code=404, detail="Rota não encontrada")

        query = db.query(FlightOffer).filter(FlightOffer.route_id == route_id)

        # Aplicar ordenação
        if sort_by == "price":
            order_column = FlightOffer.price
        elif sort_by == "departure_time":
            order_column = FlightOffer.departure_time
        elif sort_by == "duration":
            order_column = FlightOffer.total_duration_minutes
        else:
            order_column = FlightOffer.price

        if order == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())

        offers = query.offset(skip).limit(limit).all()

        # Converter para esquemas com campos calculados
        result = []
        for offer in offers:
            offer_dict = {
                "id": offer.id,
                "route_id": offer.route_id,
                "price": offer.price,
                "currency": offer.currency,
                "base_price": offer.base_price,
                "taxes_fees": offer.taxes_fees,
                "airline_code": offer.airline_code,
                "airline_name": offer.airline_name,
                "flight_number": offer.flight_number,
                "aircraft_type": offer.aircraft_type,
                "departure_time": offer.departure_time,
                "arrival_time": offer.arrival_time,
                "total_duration_minutes": offer.total_duration_minutes,
                "departure_terminal": offer.departure_terminal,
                "arrival_terminal": offer.arrival_terminal,
                "cabin_class": offer.cabin_class,
                "service_class": offer.service_class,
                "baggage_pieces": offer.baggage_pieces,
                "baggage_extra_cost": offer.baggage_extra_cost,
                "number_of_stops": offer.number_of_stops,
                "connection_airports": offer.connection_airports,
                "layover_duration_minutes": offer.layover_duration_minutes,
                "seats_available": offer.seats_available,
                "last_ticketing_date": offer.last_ticketing_date,
                "source": offer.source,
                "amadeus_offer_id": offer.amadeus_offer_id,
                "raw_data": offer.raw_data,
                "found_at": offer.found_at,
                "duration_formatted": offer.format_duration(),
                "stops_text": offer.get_stops_text(),
            }
            result.append(FlightOfferSchema(**offer_dict))

        logger.info(f"Retornando {len(result)} ofertas para a rota {route_id}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar ofertas da rota {route_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/airlines/summary")
def get_airlines_summary(db: Session = Depends(get_db)):
    """
    Obter resumo das companhias aéreas disponíveis.
    """
    try:
        from sqlalchemy import func

        airlines = (
            db.query(
                FlightOffer.airline_code,
                FlightOffer.airline_name,
                func.count(FlightOffer.id).label("offers_count"),
                func.min(FlightOffer.price).label("min_price"),
                func.avg(FlightOffer.price).label("avg_price"),
            )
            .filter(FlightOffer.airline_code.isnot(None))
            .group_by(FlightOffer.airline_code, FlightOffer.airline_name)
            .order_by(func.count(FlightOffer.id).desc())
            .all()
        )

        result = []
        for airline in airlines:
            result.append(
                {
                    "airline_code": airline.airline_code,
                    "airline_name": airline.airline_name,
                    "offers_count": airline.offers_count,
                    "min_price": (
                        round(airline.min_price, 2) if airline.min_price else None
                    ),
                    "avg_price": (
                        round(airline.avg_price, 2) if airline.avg_price else None
                    ),
                }
            )

        logger.info(f"Retornando resumo de {len(result)} companhias aéreas")
        return result

    except Exception as e:
        logger.error(f"Erro ao buscar resumo das companhias: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
