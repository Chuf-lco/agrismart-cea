from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class CycleStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    failed = "failed"


class CropCycle(Base):
    __tablename__ = "crop_cycles"

    id = Column(Integer, primary_key=True, index=True)
    greenhouse_id = Column(String(50), nullable=False, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)

    start_date = Column(Date, nullable=False)
    expected_end_date = Column(Date, nullable=True)
    actual_end_date = Column(Date, nullable=True)

    status = Column(Enum(CycleStatus), default=CycleStatus.active, nullable=False)
    notes = Column(Text, nullable=True)

    # Relationship
    crop = relationship("Crop", backref="cycles")