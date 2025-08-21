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

    def __repr__(self):
        return f"<Route(id={self.id}, {self.origin}-{self.dest}, active={self.active})>"


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


# Tabela para log de jobs (opcional - para monitoramento)
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
