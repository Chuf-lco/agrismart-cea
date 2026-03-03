from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/")
def root():
    return {"status": "ok", "message": "AgriSmart CEA API is running 🌱"}


@app.get("/health")
def health():
    return {"status": "healthy"}