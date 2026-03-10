from pydantic import BaseModel
from typing import List, Optional


class AdvisorMessage(BaseModel):
    role: str      # "user" or "assistant"
    content: str


class AdvisorRequest(BaseModel):
    greenhouse_id: str
    crop_id: int
    message: str
    history: List[AdvisorMessage] = []


class AdvisorResponse(BaseModel):
    response: str
    context_used: Optional[dict] = None