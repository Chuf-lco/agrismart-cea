# advisor.py — auth on POST /advisor/ask
from fastapi import APIRouter, Depends
from app.auth import get_current_user
from pydantic import BaseModel
from typing import List
import os
import httpx

router = APIRouter(prefix="/advisor", tags=["AI Advisor"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.1-8b-instant"

SYSTEM_PROMPT = """You are AgriSmart, an AI advisor for controlled environment agriculture (CEA) 
in Africa. You help greenhouse operators in Kenya, Ethiopia, Nigeria, and other African countries 
optimize their crops. Be concise, practical, and use metric units. Focus on actionable advice."""


class AdvisorMessage(BaseModel):
    role: str
    content: str


class AdvisorPayload(BaseModel):
    greenhouse_id: str
    crop_id: int
    message: str
    history: List[AdvisorMessage] = []


@router.post("/ask")
async def ask_advisor(
    payload: AdvisorPayload,
    _user: str = Depends(get_current_user),   # 🔒 auth required
):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in payload.history[-6:]:  # keep last 6 turns for context
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": payload.message})

    async with httpx.AsyncClient() as client:
        response = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            json={"model": MODEL, "messages": messages, "max_tokens": 512},
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()

    reply = data["choices"][0]["message"]["content"]
    return {"reply": reply, "greenhouse_id": payload.greenhouse_id}