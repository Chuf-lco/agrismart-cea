"""
Seed script — populates the DB with 5 climate-resilient East African crops.
Run from the backend/ directory:
    python seed.py
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal, engine
from app.models.crop import Crop
import app.models  # noqa: registers all models

CROPS = [
    {
        "name": "Amaranth",
        "variety": "African Amaranth (Amaranthus cruentus)",
        "origin_region": "East Africa",
        "optimal_temp_min": 18.0,
        "optimal_temp_max": 30.0,
        "optimal_humidity": 60.0,
        "water_requirement": "low",
        "climate_resilience_score": 9,
        "growth_duration_days": 30,
        "notes": (
            "Extremely drought-tolerant and heat-resistant. "
            "High nutritional value — rich in protein, iron, and calcium. "
            "Grows well in Kenyan highlands and semi-arid regions. "
            "Ideal for CEA due to fast growth cycle."
        ),
    },
    {
        "name": "African Nightshade",
        "variety": "Solanum scabrum",
        "origin_region": "East Africa",
        "optimal_temp_min": 15.0,
        "optimal_temp_max": 25.0,
        "optimal_humidity": 70.0,
        "water_requirement": "medium",
        "climate_resilience_score": 8,
        "growth_duration_days": 45,
        "notes": (
            "Indigenous leafy green widely consumed in Kenya, Uganda, and Tanzania. "
            "Highly nutritious and culturally significant. "
            "Tolerates cooler highland temperatures. "
            "Underutilised in commercial CEA — significant market opportunity."
        ),
    },
    {
        "name": "Cowpea",
        "variety": "Vigna unguiculata",
        "origin_region": "West & East Africa",
        "optimal_temp_min": 20.0,
        "optimal_temp_max": 35.0,
        "optimal_humidity": 50.0,
        "water_requirement": "low",
        "climate_resilience_score": 9,
        "growth_duration_days": 60,
        "notes": (
            "One of the most heat and drought-tolerant legumes in Africa. "
            "Fixes nitrogen — improves soil health in mixed systems. "
            "Leaves, pods, and seeds all edible. "
            "Staple crop across sub-Saharan Africa with strong local demand."
        ),
    },
    {
        "name": "Spider Plant",
        "variety": "Cleome gynandra",
        "origin_region": "East & Central Africa",
        "optimal_temp_min": 18.0,
        "optimal_temp_max": 32.0,
        "optimal_humidity": 55.0,
        "water_requirement": "low",
        "climate_resilience_score": 8,
        "growth_duration_days": 35,
        "notes": (
            "Hardy indigenous vegetable known as 'Saga' in western Kenya. "
            "Fast-growing and drought-tolerant. "
            "Rich in vitamins A and C, iron, and folate. "
            "Strong cultural demand in local markets — low competition from imports."
        ),
    },
    {
        "name": "Tomato",
        "variety": "Roma VF (heat-tolerant)",
        "origin_region": "Pan-Africa (CEA staple)",
        "optimal_temp_min": 18.0,
        "optimal_temp_max": 27.0,
        "optimal_humidity": 65.0,
        "water_requirement": "medium",
        "climate_resilience_score": 7,
        "growth_duration_days": 75,
        "notes": (
            "Roma VF is a heat-tolerant, disease-resistant variety widely grown in East Africa. "
            "Highest commercial demand of all CEA crops in the region. "
            "Sensitive to humidity — CEA environment gives significant yield advantage "
            "over open-field growing."
        ),
    },
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(Crop).count()
        if existing > 0:
            print(f"⚠️  Database already has {existing} crops. Skipping seed.")
            print("   To reseed, delete the DB file and run again.")
            return

        for data in CROPS:
            crop = Crop(**data)
            db.add(crop)

        db.commit()
        print(f"✅ Seeded {len(CROPS)} crops successfully:")
        for c in CROPS:
            print(f"   🌿 {c['name']} ({c['variety']})")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()