from sqlalchemy import Column, Integer, String, Float, Text
from app.database import Base


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    variety = Column(String(100), nullable=True)
    origin_region = Column(String(100), nullable=True)  # e.g. "East Africa", "West Africa"

    # Optimal growing conditions
    optimal_temp_min = Column(Float, nullable=True)   # °C
    optimal_temp_max = Column(Float, nullable=True)   # °C
    optimal_humidity = Column(Float, nullable=True)   # % relative humidity
    water_requirement = Column(String(50), nullable=True)  # low / medium / high

    # CEA-specific
    climate_resilience_score = Column(Integer, nullable=True)  # 1–10
    growth_duration_days = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)