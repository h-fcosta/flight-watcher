from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List


# Route schemas
class RouteBase(BaseModel):
    origin: str = Field(
        ..., min_length=3, max_length=3, description="Código IATA origem"
    )
    dest: str = Field(
        ..., min_length=3, max_length=3, description="Código IATA destino"
    )
    start: date = Field(..., description="Data de início da busca")
    end: date = Field(..., description="Data de fim da busca")
    active: bool = Field(default=True, description="Se a rota está ativa")


class RouteCreate(RouteBase):
    pass


class RouteUpdate(BaseModel):
    origin: Optional[str] = Field(None, min_length=3, max_length=3)
    dest: Optional[str] = Field(None, min_length=3, max_length=3)
    start: Optional[date] = None
    end: Optional[date] = None
    active: Optional[bool] = None


class Route(RouteBase):
    id: int

    class Config:
        from_attributes = True


# Price schemas
class PriceBase(BaseModel):
    day: date
    value: float = Field(..., gt=0, description="Preço deve ser positivo")


class PriceCreate(PriceBase):
    route_id: int


class Price(PriceBase):
    id: int
    route_id: int
    route: Optional[Route] = None

    class Config:
        from_attributes = True


# FlightOffer schemas
class FlightOfferBase(BaseModel):
    price: float = Field(..., gt=0, description="Preço deve ser positivo")
    currency: str = Field(default="BRL", max_length=3)
    airline_code: Optional[str] = Field(None, max_length=3)
    airline_name: Optional[str] = Field(None, max_length=100)
    flight_number: Optional[str] = Field(None, max_length=20)
    departure_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    cabin_class: str = Field(default="ECONOMY", max_length=20)
    number_of_stops: int = Field(default=0, ge=0)
    seats_available: Optional[int] = Field(None, ge=0)


class FlightOfferCreate(FlightOfferBase):
    route_id: int


class FlightOffer(FlightOfferBase):
    id: int
    route_id: int
    base_price: Optional[float] = None
    taxes_fees: Optional[float] = None
    aircraft_type: Optional[str] = None
    total_duration_minutes: Optional[int] = None
    departure_terminal: Optional[str] = None
    arrival_terminal: Optional[str] = None
    service_class: Optional[str] = None
    baggage_pieces: int = 0
    baggage_extra_cost: float = 0
    connection_airports: Optional[str] = None
    layover_duration_minutes: int = 0
    last_ticketing_date: Optional[date] = None
    source: str = "GDS"
    found_at: datetime

    # Campos calculados
    duration_formatted: Optional[str] = None
    stops_text: Optional[str] = None

    class Config:
        from_attributes = True


class FlightOfferDetailed(FlightOffer):
    route: Route  # Incluir dados da rota
    raw_data: Optional[str] = None  # Para debugging


# Deal schemas
class Deal(BaseModel):
    route: Route
    day: date
    price: float
    average_price: float
    discount_percent: float

    class Config:
        from_attributes = True


# Stats schemas
class RouteStats(BaseModel):
    route_id: int
    route: Route
    total_prices: int
    min_price: Optional[float]
    max_price: Optional[float]
    avg_price: Optional[float]
    last_update: Optional[date]


class SystemStats(BaseModel):
    total_routes: int
    active_routes: int
    total_prices: int
    total_deals: int
    last_job_run: Optional[str]
    system_status: str


# Response schemas
class SuccessResponse(BaseModel):
    success: bool = True
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None
