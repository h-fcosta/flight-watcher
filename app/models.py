from sqlalchemy import (Column, Integer, String, Date, Float, Boolean,
                        ForeignKey, UniqueConstraint, create_engine)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
import pathlib, os
from dotenv import load_dotenv; load_dotenv()

DB_PATH = pathlib.Path(__file__).parents[1] / 'prices.db'
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False, future=True)
Session = sessionmaker(bind=engine, expire_on_commit=False)
Base = declarative_base()

class Route(Base):
  __tablename__ = "routes"
  id = Column(Integer, primary_key=True)
  origin = Column(String(3), nullable=False)
  dest = Column(String(3), nullable=False)
  start = Column(Date, nullable=False)
  end = Column(Date, nullable=False)
  active = Column(Boolean, default=True)
  prices = relationship("Price", back_populates="route", cascade="all, delete-orphan")
  
class Price(Base):
  __tablename__="prices"
  id = Column(Integer, primary_key=True)
  route_id = Column(Integer, ForeignKey("routes.id"), index=True)
  day = Column(Date, index=True)
  value = Column(Float)
  route = relationship("Route", back_populates="prices")
  __table_args__ = (UniqueConstraint("route_id", "day"),)
  
Base.metadata.create_all(engine)
  