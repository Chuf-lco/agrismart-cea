from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
import app.models #noqa: F401  -registers all models with SQLAlchemy
from app.routers import crops, sensors, cycles

app = FastAPI(
    title="AgriSmart CEA",
    description="Controlled Environment Agriculture platform for African greenhouse operators.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crops.router)
app.include_router(sensors.router)
app.include_router(cycles.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "AgriSmart CEA API is running 🌱"}


@app.get("/health")
def health():
    return {"status": "healthy"}