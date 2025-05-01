from sqlalchemy import Column, Date, Float, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import pathlib

DB_PATH = pathlib.Path(__file__).parents[1] / "prices.db"
engine = create_engine(f"sqlite:///{DB_PATH}")
Session = sessionmaker(bind=engine)
Base = declarative_base()

class Price(Base):
  __tablename__ = "prices"
  day = Column(Date, primary_key=True)
  value = Column(Float, nullable=False)

Base.metadata.create_all(engine)