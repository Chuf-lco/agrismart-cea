from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from groq import Groq
import os

from app.database import get_db
from app.models.crop import Crop
from app.models.sensor import SensorReading
from app.models.cycle import CropCycle, CycleStatus
from app.schemas.advisor import AdvisorRequest, AdvisorResponse

router = APIRouter(prefix="/advisor", tags=["AI Advisor"])


def get_context(greenhouse_id: str, crop_id: int, db: Session) -> dict:
    """Fetch crop, latest sensor reading, and active cycle for context."""
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

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


def build_system_prompt(ctx: dict) -> str:
    crop = ctx["crop"]
    reading = ctx["reading"]
    cycle = ctx["cycle"]

    # Sensor section
    if reading:
        sensor_lines = f"""Current greenhouse conditions:
- Temperature: {reading.temperature or 'N/A'}°C (optimal: {crop.optimal_temp_min}–{crop.optimal_temp_max}°C)
- Humidity: {reading.humidity or 'N/A'}% RH (optimal: {crop.optimal_humidity}%)
- CO₂: {reading.co2_ppm or 'N/A'} ppm
- Light: {reading.light_lux or 'N/A'} lux
- Soil moisture: {reading.soil_moisture or 'N/A'}%"""
    else:
        sensor_lines = "Current greenhouse conditions: No recent sensor data available."

    # Cycle section
    if cycle:
        from datetime import date
        elapsed = (date.today() - cycle.start_date).days
        total = (
            (cycle.expected_end_date - cycle.start_date).days
            if cycle.expected_end_date else None
        )
        pct = round((elapsed / total) * 100) if total else None
        cycle_lines = f"""Active crop cycle:
- Day {elapsed}{f' of {total}' if total else ''}{f' ({pct}% complete)' if pct else ''}
- Started: {cycle.start_date}
{f'- Expected harvest: {cycle.expected_end_date}' if cycle.expected_end_date else ''}
{f'- Notes: {cycle.notes}' if cycle.notes else ''}"""
    else:
        cycle_lines = "Active crop cycle: No active cycle found for this greenhouse."

    return f"""You are an expert agronomist specialising in Controlled Environment Agriculture (CEA) in East Africa.
You are advising an operator growing {crop.name} ({crop.variety or 'standard variety'}) in greenhouse {reading.greenhouse_id if reading else 'unknown'}.

Crop profile:
- Climate resilience score: {crop.climate_resilience_score or 'N/A'}/10
- Water requirement: {crop.water_requirement or 'N/A'}
- Growth duration: {crop.growth_duration_days or 'N/A'} days
- Origin region: {crop.origin_region or 'East Africa'}
{f'- Notes: {crop.notes}' if crop.notes else ''}

{sensor_lines}

{cycle_lines}

Guidelines:
- Be concise and practical — operators are busy
- Give numbered, actionable steps when recommending actions
- Flag urgent issues clearly with ⚠️
- If conditions are outside optimal range, address that first
- Respond in the context of East African growing conditions and markets
- If sensor data is missing, still answer but note the limitation
"""


@router.post("/ask", response_model=AdvisorResponse)
def ask_advisor(payload: AdvisorRequest, db: Session = Depends(get_db)):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    # Build context
    ctx = get_context(payload.greenhouse_id, payload.crop_id, db)
    system_prompt = build_system_prompt(ctx)

    # Build messages — history + new message
    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in payload.history
    ]
    messages.append({"role": "user", "content": payload.message})

    # Call Groq
    try:
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": system_prompt}] + messages,
            max_tokens=1024,
            temperature=0.7,
        )
        response_text = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq API error: {str(e)}")

    # Context summary for frontend panel
    crop = ctx["crop"]
    reading = ctx["reading"]
    cycle = ctx["cycle"]
    context_used = {
        "crop": crop.name,
        "variety": crop.variety,
        "greenhouse_id": payload.greenhouse_id,
        "temperature": reading.temperature if reading else None,
        "humidity": reading.humidity if reading else None,
        "co2_ppm": reading.co2_ppm if reading else None,
        "has_active_cycle": cycle is not None,
    }

    return AdvisorResponse(response=response_text, context_used=context_used)