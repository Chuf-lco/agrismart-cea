# cycles.py — auth on POST and PATCH
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app import models
from pydantic import BaseModel
from typing import Optional
from datetime import date

router = APIRouter(prefix="/cycles", tags=["Crop Cycles"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class CycleCreate(BaseModel):
    greenhouse_id: str
    crop_id: int
    start_date: date
    expected_end_date: Optional[date] = None
    notes: Optional[str] = None


class CycleUpdate(BaseModel):
    status: Optional[str] = None
    actual_end_date: Optional[date] = None
    notes: Optional[str] = None


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("/")
def list_cycles(
    greenhouse_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.CropCycle)
    if greenhouse_id:
        q = q.filter(models.CropCycle.greenhouse_id == greenhouse_id)
    if status:
        q = q.filter(models.CropCycle.status == status)
    return q.order_by(models.CropCycle.id.desc()).all()


@router.get("/{cycle_id}")
def get_cycle(cycle_id: int, db: Session = Depends(get_db)):
    cycle = db.query(models.CropCycle).filter(models.CropCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    return cycle


@router.post("/", status_code=201)
def start_cycle(
    payload: CycleCreate,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),   # 🔒 auth required
):
    cycle = models.CropCycle(**payload.dict())
    db.add(cycle)
    db.commit()
    db.refresh(cycle)
    return cycle


@router.patch("/{cycle_id}")
def update_cycle(
    cycle_id: int,
    payload: CycleUpdate,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),   # 🔒 auth required
):
    cycle = db.query(models.CropCycle).filter(models.CropCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(cycle, field, value)
    db.commit()
    db.refresh(cycle)
    return cycle