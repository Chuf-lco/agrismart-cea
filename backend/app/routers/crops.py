# crops.py — add auth to write endpoints
# Replace your existing crops router with this file.
# GET endpoints remain open (read-only for demo).
# POST / PATCH / DELETE require Basic auth.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app import models
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/crops", tags=["Crops"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class CropCreate(BaseModel):
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


class CropUpdate(BaseModel):
    name: Optional[str] = None
    variety: Optional[str] = None
    origin_region: Optional[str] = None
    optimal_temp_min: Optional[float] = None
    optimal_temp_max: Optional[float] = None
    optimal_humidity: Optional[float] = None
    water_requirement: Optional[str] = None
    climate_resilience_score: Optional[int] = None
    growth_duration_days: Optional[int] = None
    notes: Optional[str] = None


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("/")
def list_crops(db: Session = Depends(get_db)):
    return db.query(models.Crop).all()


@router.get("/{crop_id}")
def get_crop(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop


@router.post("/", status_code=201)
def create_crop(
    payload: CropCreate,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),   # 🔒 auth required
):
    crop = models.Crop(**payload.dict())
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop


@router.patch("/{crop_id}")
def update_crop(
    crop_id: int,
    payload: CropUpdate,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),   # 🔒 auth required
):
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(crop, field, value)
    db.commit()
    db.refresh(crop)
    return crop


@router.delete("/{crop_id}", status_code=204)
def delete_crop(
    crop_id: int,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),   # 🔒 auth required
):
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    db.delete(crop)
    db.commit()