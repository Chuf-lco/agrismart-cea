# 🌱 AgriSmart CEA

> Controlled Environment Agriculture platform built for African greenhouse operators.

## The Problem

Small and mid-scale greenhouse operators across East Africa lack affordable tools to monitor crops, track growth cycles, and get agronomic advice. Most rely on WhatsApp groups, paper logs, and expensive consultants. AgriSmart changes that.

## What It Does

- **Crop Management** — track climate-resilient crop varieties and their optimal growing conditions
- **Sensor Logging** — log and visualize greenhouse sensor readings (temp, humidity, CO₂, light, soil moisture)
- **Cycle Tracking** — manage crop cycles from planting to harvest
- **AI Crop Advisor** *(Week 3)* — describe a problem, get intelligent recommendations powered by Claude AI

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy, Alembic |
| Frontend | TypeScript, React, Vite, Tailwind CSS |
| Database | SQLite (dev) / PostgreSQL (prod) |
| AI | Anthropic Claude API |

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/Chuf-lco/agrismart-cea.git
cd agrismart-cea/backend

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env

# 5. Run the server
uvicorn app.main:app --reload
```

Visit `http://localhost:8000/docs` to explore the API.

## Project Roadmap

| Week | Focus |
|---|---|
| W1 ✅ | Project setup, data models, CRUD API |
| W2 | Sensor dashboard UI, crop cycle tracker frontend |
| W3 | AI crop advisor (Claude API integration) |
| W4 | Polish, deploy, seed with real African crop data |

## Dev Log

- [Week 1 — Why I'm building a CEA tool for African farmers](#) *(coming soon)*