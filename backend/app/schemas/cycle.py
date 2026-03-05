from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.models.cycle import CycleStatus


class CropCycleCreate(BaseModel):
    greenhouse_id: str
    crop_id: int
    start_date: date
    expected_end_date: Optional[date] = None
    notes: Optional[str] = None


class CropCycleUpdate(BaseModel):
    status: Optional[CycleStatus] = None
    actual_end_date: Optional[date] = None
    notes: Optional[str] = None


class CropCycleRead(CropCycleCreate):
    id: int
    status: CycleStatus
    actual_end_date: Optional[date] = None

    class Config:
        from_attributes = True