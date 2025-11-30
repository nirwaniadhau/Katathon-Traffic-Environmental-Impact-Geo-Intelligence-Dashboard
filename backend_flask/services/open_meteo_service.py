# services/open_meteo_service.py

import requests
from datetime import date

OPEN_METEO_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"


def fetch_pm25_history(lat: float, lon: float, start_date: date, end_date: date):
    """
    Uses Open-Meteo to fetch hourly PM2.5 and aggregate to daily averages
    between [start_date, end_date].
    Returns: list[{ "date": "YYYY-MM-DD", "pm25": float }]
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "hourly": "pm2_5",
    }

    resp = requests.get(OPEN_METEO_URL, params=params, timeout=10)
    print("Open-Meteo status:", resp.status_code)

    if resp.status_code != 200:
        print("Open-Meteo error:", resp.text[:200])
        return []

    data = resp.json()
    hourly = data.get("hourly", {})
    times = hourly.get("time", [])
    pm25_values = hourly.get("pm2_5", [])

    if not times or not pm25_values or len(times) != len(pm25_values):
        return []

    daily_bucket = {}

    for t, val in zip(times, pm25_values):
        try:
            v = float(val)
        except (TypeError, ValueError):
            continue
        day = t.split("T")[0]
        daily_bucket.setdefault(day, []).append(v)

    daily = []
    for day, vals in daily_bucket.items():
        avg = sum(vals) / len(vals)
        daily.append({"date": day, "pm25": round(avg, 2)})

    daily.sort(key=lambda x: x["date"])
    return daily
