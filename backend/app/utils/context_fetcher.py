from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.crop import Crop
from app.models.sensor import SensorReading
from app.models.cycle import CropCycle, CycleStatus


def get_advisor_context(greenhouse_id: str, crop_id: int, db: Session) -> dict:
    """
    Fetch all context needed for the advisor:
    - crop details
    - latest sensor reading for the greenhouse
    - active crop cycle (if any)

    Raises 404 if crop not found.
    Returns reading and cycle as None if not available — advisor handles gracefully.
    """
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail=f"Crop with id {crop_id} not found")

    reading = (
        db.query(SensorReading)
        .filter(SensorReading.greenhouse_id == greenhouse_id)
        .order_by(SensorReading.timestamp.desc())
        .first()
    )

    cycle = (
        db.query(CropCycle)
        .filter(
            CropCycle.greenhouse_id == greenhouse_id,
            CropCycle.crop_id == crop_id,
            CropCycle.status == CycleStatus.active,
        )
        .order_by(CropCycle.start_date.desc())
        .first()
    )

    return {"crop": crop, "reading": reading, "cycle": cycle}