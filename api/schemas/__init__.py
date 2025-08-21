from pydantic import BaseModel, Field
from datetime import date
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
