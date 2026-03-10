from datetime import date


def _sensor_section(reading, crop) -> str:
    if not reading:
        return "Current greenhouse conditions: No recent sensor data available — advise operator to check sensor connectivity.\n"

    def flag(val, low, high, unit=""):
        if val is None:
            return "N/A"
        status = ""
        if low and high:
            if val < low:
                status = " ⚠️ BELOW optimal"
            elif val > high:
                status = " ⚠️ ABOVE optimal"
            else:
                status = " ✓"
        return f"{val}{unit}{status}"

    return f"""Current greenhouse conditions:
- Temperature:    {flag(reading.temperature, crop.optimal_temp_min, crop.optimal_temp_max, '°C')} (optimal: {crop.optimal_temp_min}–{crop.optimal_temp_max}°C)
- Humidity:       {flag(reading.humidity, 50, crop.optimal_humidity, '% RH')} (optimal: ≤{crop.optimal_humidity}%)
- CO₂:            {flag(reading.co2_ppm, 600, 1400, ' ppm')} (optimal: 800–1200 ppm)
- Light:          {flag(reading.light_lux, 3000, 10000, ' lux')}
- Soil moisture:  {flag(reading.soil_moisture, 40, 75, '%')}
"""


def _cycle_section(cycle) -> str:
    if not cycle:
        return "Crop cycle: No active cycle found — operator may not have started one yet.\n"

    elapsed = (date.today() - cycle.start_date).days
    total = (
        (cycle.expected_end_date - cycle.start_date).days
        if cycle.expected_end_date else None
    )
    pct = round((elapsed / total) * 100) if total else None
    overdue = elapsed > total if total else False

    urgency = ""
    if overdue:
        urgency = f" ⚠️ OVERDUE by {elapsed - total} days"
    elif pct and pct >= 80:
        urgency = " — approaching harvest"

    lines = [
        f"Active crop cycle: Day {elapsed}{f' of {total}' if total else ''}"
        f"{f' ({pct}% complete)' if pct else ''}{urgency}",
        f"  Started: {cycle.start_date}",
    ]
    if cycle.expected_end_date:
        lines.append(f"  Expected harvest: {cycle.expected_end_date}")
    if cycle.notes:
        lines.append(f"  Operator notes: {cycle.notes}")

    return "\n".join(lines) + "\n"


def build_system_prompt(crop, reading, cycle) -> str:
    gh_id = reading.greenhouse_id if reading else "unknown"

    return f"""You are AgriAdvisor — an expert agronomist specialising in Controlled Environment Agriculture (CEA) in East Africa.
You are advising an operator in greenhouse {gh_id} growing {crop.name} ({crop.variety or 'standard variety'}).

CROP PROFILE:
- Origin: {crop.origin_region or 'East Africa'}
- Climate resilience: {crop.climate_resilience_score or 'N/A'}/10
- Water requirement: {crop.water_requirement or 'N/A'}
- Growth duration: {crop.growth_duration_days or 'N/A'} days
{f'- Agronomic notes: {crop.notes}' if crop.notes else ''}

{_sensor_section(reading, crop)}
{_cycle_section(cycle)}

RESPONSE RULES:
1. If any sensor reading is flagged ⚠️, address it first before other questions
2. Give numbered, actionable steps — not general advice
3. Keep responses under 200 words unless the issue is complex
4. Use ⚠️ for urgent issues, ✓ for things that are fine
5. Always ground advice in East African conditions — reference local inputs, markets, or practices where relevant
6. If you lack data to answer precisely, say so clearly and suggest what data to collect
7. Never recommend products by brand name — use generic descriptions
"""