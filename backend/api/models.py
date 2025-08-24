from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Float,
    Boolean,
    ForeignKey,
    UniqueConstraint,
    DateTime,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from api.database import Base


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String(3), nullable=False, index=True)
    dest = Column(String(3), nullable=False, index=True)
    start = Column(Date, nullable=False)
    end = Column(Date, nullable=False)
    active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    prices = relationship("Price", back_populates="route", cascade="all, delete-orphan")
    flight_offers = relationship(
        "FlightOffer", back_populates="route", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Route(id={self.id}, {self.origin}-{self.dest}, active={self.active})>"


class FlightOffer(Base):
    __tablename__ = "flight_offers"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False, index=True)

    # Preço
    price = Column(Float, nullable=False)
    currency = Column(String(3), default="BRL")
    base_price = Column(Float)
    taxes_fees = Column(Float)

    # Detalhes do voo
    airline_code = Column(String(3))
    airline_name = Column(String(100))
    flight_number = Column(String(20))
    aircraft_type = Column(String(10))

    # Horários
    departure_time = Column(DateTime(timezone=True))
    arrival_time = Column(DateTime(timezone=True))
    total_duration_minutes = Column(Integer)

    # Terminais
    departure_terminal = Column(String(5))
    arrival_terminal = Column(String(5))

    # Classe e serviços
    cabin_class = Column(String(20), default="ECONOMY")
    service_class = Column(String(5))
    baggage_pieces = Column(Integer, default=0)
    baggage_extra_cost = Column(Float, default=0)

    # Conectividade
    number_of_stops = Column(Integer, default=0)
    connection_airports = Column(String(100))
    layover_duration_minutes = Column(Integer, default=0)

    # Disponibilidade
    seats_available = Column(Integer)
    last_ticketing_date = Column(Date)

    # Metadados
    source = Column(String(20), default="GDS")
    amadeus_offer_id = Column(String(50))
    raw_data = Column(Text)
    found_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamentos
    route = relationship("Route", back_populates="flight_offers")

    def format_duration(self):
        """Formatar duração em formato legível"""
        if not self.total_duration_minutes:
            return "-"

        hours = self.total_duration_minutes // 60
        minutes = self.total_duration_minutes % 60

        if hours > 0:
            return f"{hours}h {minutes}min"
        else:
            return f"{minutes}min"

    def get_stops_text(self):
        """Obter texto descritivo das paradas"""
        if self.number_of_stops == 0:
            return "Direto"
        elif self.number_of_stops == 1:
            return "1 parada"
        else:
            return f"{self.number_of_stops} paradas"

    def __repr__(self):
        return f"<FlightOffer(id={self.id}, {self.flight_number}, price={self.price})>"

    @property
    def duration_formatted(self):
        """Retorna duração formatada como '2h30m'"""
        if not self.total_duration_minutes:
            return "N/A"
        hours = self.total_duration_minutes // 60
        minutes = self.total_duration_minutes % 60
        return f"{hours}h{minutes:02d}m"

    @property
    def stops_text(self):
        """Retorna texto descritivo das paradas"""
        if self.number_of_stops == 0:
            return "Direto"
        elif self.number_of_stops == 1:
            return f"1 parada"
        else:
            return f"{self.number_of_stops} paradas"


class Price(Base):
    __tablename__ = "prices"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False, index=True)
    day = Column(Date, nullable=False, index=True)
    value = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamentos
    route = relationship("Route", back_populates="prices")

    # Constraint para evitar duplicatas
    __table_args__ = (UniqueConstraint("route_id", "day", name="unique_route_day"),)

    def __repr__(self):
        return f"<Price(route_id={self.route_id}, day={self.day}, value={self.value})>"


# Tabela de Log de Jobs
class JobLog(Base):
    __tablename__ = "job_logs"

    id = Column(Integer, primary_key=True, index=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True))
    routes_processed = Column(Integer, default=0)
    prices_found = Column(Integer, default=0)
    deals_found = Column(Integer, default=0)
    success = Column(Boolean, default=True)
    error_message = Column(String(500), nullable=True)

    def __repr__(self):
        return f"<JobLog(id={self.id}, started_at={self.started_at}, success={self.success})>"
