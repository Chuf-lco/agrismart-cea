from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from groq import Groq
import os

from app.database import get_db
from app.schemas.advisor import AdvisorRequest, AdvisorResponse
from app.utils.context_fetcher import get_advisor_context
from app.utils.prompt_builder import build_system_prompt

router = APIRouter(prefix="/advisor", tags=["AI Advisor"])


@router.post("/ask", response_model=AdvisorResponse)
def ask_advisor(payload: AdvisorRequest, db: Session = Depends(get_db)):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    # Fetch context
    ctx = get_advisor_context(payload.greenhouse_id, payload.crop_id, db)
    crop, reading, cycle = ctx["crop"], ctx["reading"], ctx["cycle"]
    system_prompt = build_system_prompt(crop, reading, cycle)

    # Build messages
    messages = [{"role": m.role, "content": m.content} for m in payload.history]
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
    context_used = {
        "crop": crop.name,
        "variety": crop.variety,
        "greenhouse_id": payload.greenhouse_id,
        "temperature": reading.temperature if reading else None,
        "humidity": reading.humidity if reading else None,
        "co2_ppm": reading.co2_ppm if reading else None,
        "has_active_cycle": cycle is not None,
        "cycle_day": (
            (__import__("datetime").date.today() - cycle.start_date).days
            if cycle else None
        ),
    }

    return AdvisorResponse(response=response_text, context_used=context_used)