from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.sensor import SensorReading
from app.schemas.sensor import SensorReadingCreate, SensorReadingRead

router = APIRouter(prefix="/sensors", tags=["Sensors"])


@router.post("/readings", response_model=SensorReadingRead, status_code=201)
def log_reading(payload: SensorReadingCreate, db: Session = Depends(get_db)):
    reading = SensorReading(**payload.model_dump())
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


@router.get("/readings", response_model=List[SensorReadingRead])
def get_readings(
    greenhouse_id: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
):
    q = db.query(SensorReading)
    if greenhouse_id:
        q = q.filter(SensorReading.greenhouse_id == greenhouse_id)
    return q.order_by(SensorReading.timestamp.desc()).limit(limit).all()


@router.get("/readings/latest", response_model=SensorReadingRead)
def latest_reading(greenhouse_id: str = Query(...), db: Session = Depends(get_db)):
    reading = (
        db.query(SensorReading)
        .filter(SensorReading.greenhouse_id == greenhouse_id)
        .order_by(SensorReading.timestamp.desc())
        .first()
    )
    if not reading:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="No readings found for this greenhouse")
    return reading