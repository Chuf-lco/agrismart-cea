from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    greenhouse_id = Column(String(50), nullable=False, index=True)  # e.g. "GH-001"
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Environmental readings
    temperature = Column(Float, nullable=True)    # °C
    humidity = Column(Float, nullable=True)        # % RH
    co2_ppm = Column(Float, nullable=True)         # parts per million
    light_lux = Column(Float, nullable=True)       # lux
    soil_moisture = Column(Float, nullable=True)   # % volumetric water content