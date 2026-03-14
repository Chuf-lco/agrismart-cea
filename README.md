# 🌱 AgriSmart CEA

> Controlled Environment Agriculture platform built for African greenhouse operators.

## The Problem

Small and mid-scale greenhouse farmers across East Africa lack affordable tools to monitor crops, track growth cycles, and get agronomic advice. Most rely on WhatsApp groups, paper logs, and expensive consultants. AgriSmart changes that.

## What It Does

- **Crop Management** — track climate-resilient crop varieties and their optimal growing conditions
- **Sensor Logging** — log and visualize greenhouse sensor readings (temp, humidity, CO₂, light, soil moisture)
- **Cycle Tracking** — manage crop cycles from planting to harvest
- **AI Crop Advisor** — describe a problem, get intelligent recommendations powered by Claude AI

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy, Alembic |
| Frontend | TypeScript, React, Vite, Tailwind CSS |
| Database | SQLite (dev) / PostgreSQL (prod) |
| AI | Groq API · Llama 3.3 70B  |
| Hosting | Railway (backend) - Vercel (frontend)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Chuf-lco/agrismart-cea.git
cd agrismart-cea/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env

# Run migrations and seed the crops
alembic upgrade head
python seed.py

#  Run the server
uvicorn app.main:app --reload
```

Visit `http://localhost:8000/docs` to explore the API.

# Frontend

```bash
cd ../frontend
npm install

cp .env.example .env.local
# Set VITE_API_URL=http://localhost:8000
# Set VITE_OPERATOR_PASSWORD=your_operator_password

npm run dev

App available at http://localhost:5173

# Deployment
Backend → Railway

Create a Railway project and add a PostgreSQL plugin
Connect your GitHub repo, set root directory to backend/
Add environment variables: DATABASE_URL, GROQ_API_KEY, ADMIN_PASSWORD, OPERATOR_PASSWORD, APP_ENV=production, FRONTEND_URL
Deploy — Railway auto-runs alembic upgrade head && python seed.py via Procfile

Frontend → Vercel

cd frontend
vercel --prod

Add env vars in Vercel dashboard: VITE_API_URL, VITE_OPERATOR_PASSWORD
vercel --prod
```



# API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/crops` | List or create crops |
| GET/PATCH/DELETE | `/crops/{id}` | Manage a single crop |
| GET/POST | `/sensors/readings` | Log or retrieve sensor readings |
| GET | `/sensors/readings/latest` | Latest reading for a greenhouse |
| GET/POST | `/cycles` | List or start crop cycles |
 GET/PATCH | `/cycles/{id}` | Manage a single cycle |
POST | `/advisor/ask` | Ask the AI advisor |

# Seeded Crops

5 climate-resilient East African crops are pre-loaded:

| Crop | Resilience | Water | Growth |
|---|---|---|---|
| Amaranth | 9/10 | Low | 30 days |
| African Nightshade | 8/10 | Medium | 45 days |
| Cowpea | 9/10 | Low | 60 days |
| Spider Plant | 8/10 | Low | 35 days |
| Tomato (Roma VF) | 7/10 | Medium | 75 days |


## Project Roadmap

| Focus |
|---|---|
 ✅ | Project setup, data models, CRUD API |
|✅ | Sensor dashboard UI, crop cycle tracker frontend |
|✅ | AI crop advisor (Groq + Llama 3, context injection, chat UI) |
|✅ | Polish, deploy, seed with real African crop data |