from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.crop import Crop
from app.schemas.crop import CropCreate, CropUpdate, CropRead

router = APIRouter(prefix="/crops", tags=["Crops"])


@router.post("/", response_model=CropRead, status_code=201)
def create_crop(payload: CropCreate, db: Session = Depends(get_db)):
    crop = Crop(**payload.model_dump())
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop


@router.get("/", response_model=List[CropRead])
def list_crops(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Crop).offset(skip).limit(limit).all()


@router.get("/{crop_id}", response_model=CropRead)
def get_crop(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop


@router.patch("/{crop_id}", response_model=CropRead)
def update_crop(crop_id: int, payload: CropUpdate, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(crop, k, v)
    db.commit()
    db.refresh(crop)
    return crop


@router.delete("/{crop_id}", status_code=204)
def delete_crop(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    db.delete(crop)
    db.commit()