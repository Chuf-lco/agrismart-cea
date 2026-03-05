from pydantic import BaseModel
from typing import Optional


class CropBase(BaseModel):
    name: str
    variety: Optional[str] = None
    origin_region: Optional[str] = None
    optimal_temp_min: Optional[float] = None
    optimal_temp_max: Optional[float] = None
    optimal_humidity: Optional[float] = None
    water_requirement: Optional[str] = None
    climate_resilience_score: Optional[int] = None
    growth_duration_days: Optional[int] = None
    notes: Optional[str] = None


class CropCreate(CropBase):
    name: str  # required on create


class CropUpdate(CropBase):
    pass  # all fields optional for PATCH


class CropRead(CropBase):
    id: int

    class Config:
        from_attributes = True