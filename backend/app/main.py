#main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
import app.models #noqa: F401  -registers all models with SQLAlchemy
from app.routers import crops, sensors, cycles, advisor
import os

app = FastAPI(
    title="AgriSmart CEA",
    description="Controlled Environment Agriculture platform for African greenhouse operators.",
    version="0.1.0",
    redirect_slashes=False
)
# Create tables (dev only - use Alembic migrations in production)
Base.metadata.create_all(bind=engine)


allow_origins=["http://localhost:5173","http://localhost:4173",os.getenv("FRONTEND_URL", ""),]

app.add_middleware(
        CORSMiddleware,
        allow_origins=[o for o in allow_origins if o],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(crops.router)
app.include_router(sensors.router)
app.include_router(cycles.router)
app.include_router(advisor.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "AgriSmart CEA API is running 🌱"}


@app.get("/health")
def health():
    return {"status": "healthy"}