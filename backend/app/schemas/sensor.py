from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SensorReadingCreate(BaseModel):
    greenhouse_id: str
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    co2_ppm: Optional[float] = None
    light_lux: Optional[float] = None
    soil_moisture: Optional[float] = None


class SensorReadingRead(SensorReadingCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True