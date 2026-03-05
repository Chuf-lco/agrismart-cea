from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.cycle import CropCycle, CycleStatus
from app.schemas.cycle import CropCycleCreate, CropCycleUpdate, CropCycleRead

router = APIRouter(prefix="/cycles", tags=["Crop Cycles"])


@router.post("/", response_model=CropCycleRead, status_code=201)
def start_cycle(payload: CropCycleCreate, db: Session = Depends(get_db)):
    cycle = CropCycle(**payload.model_dump())
    db.add(cycle)
    db.commit()
    db.refresh(cycle)
    return cycle


@router.get("/", response_model=List[CropCycleRead])
def list_cycles(
    greenhouse_id: Optional[str] = Query(None),
    status: Optional[CycleStatus] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(CropCycle)
    if greenhouse_id:
        q = q.filter(CropCycle.greenhouse_id == greenhouse_id)
    if status:
        q = q.filter(CropCycle.status == status)
    return q.order_by(CropCycle.start_date.desc()).all()


@router.get("/{cycle_id}", response_model=CropCycleRead)
def get_cycle(cycle_id: int, db: Session = Depends(get_db)):
    cycle = db.query(CropCycle).filter(CropCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    return cycle


@router.patch("/{cycle_id}", response_model=CropCycleRead)
def update_cycle(cycle_id: int, payload: CropCycleUpdate, db: Session = Depends(get_db)):
    cycle = db.query(CropCycle).filter(CropCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(cycle, k, v)
    db.commit()
    db.refresh(cycle)
    return cycle