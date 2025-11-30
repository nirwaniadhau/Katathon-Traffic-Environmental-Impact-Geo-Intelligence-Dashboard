# services/utils.py

from datetime import datetime, timedelta, date
import math


def compute_time_window(range_str: str):
    """Return (from_iso, to_iso, start_date, end_date, label, days)."""
    now = datetime.utcnow()
    today = now.date()

    if range_str in ("7days", "7d"):
        days = 7
        label = "Last 7 days"
    elif range_str in ("15days", "15d"):
        days = 15
        label = "Last 15 days"
    elif range_str in ("30days", "30d"):
        days = 30
        label = "Last 30 days"
    else:
        days = 7
        label = "Last 7 days"

    start_date = today - timedelta(days=days - 1)
    end_date = today

    time_from = datetime.combine(start_date, datetime.min.time()).isoformat() + "Z"
    time_to = datetime.combine(end_date, datetime.max.time()).isoformat() + "Z"

    return time_from, time_to, start_date, end_date, label, days


def compute_aqi_from_pm25(pm25):
    """Rough India-style AQI mapping from PM2.5 µg/m³."""
    if pm25 is None:
        return None
    pm25 = float(pm25)
    if pm25 <= 30:
        return 50
    if pm25 <= 60:
        return 100
    if pm25 <= 90:
        return 150
    if pm25 <= 120:
        return 200
    if pm25 <= 250:
        return 300
    return 400


def pearson_corr(x, y):
    if not x or not y or len(x) != len(y) or len(x) < 2:
        return None
    n = len(x)
    mean_x = sum(x) / n
    mean_y = sum(y) / n
    num = sum((xi - mean_x) * (yi - mean_y) for xi, yi in zip(x, y))
    den_x = math.sqrt(sum((xi - mean_x) ** 2 for xi in x))
    den_y = math.sqrt(sum((yi - mean_y) ** 2 for yi in y))
    if den_x == 0 or den_y == 0:
        return None
    return round(num / (den_x * den_y), 2)


def compute_pollution_breakdown(pm25, pm10, no2):
    """
    Simple heuristic for pie chart:
    adjust vehicles / industry / construction / others
    based on pollutant severity.
    """
    pm25 = pm25 or 0.0
    pm10 = pm10 or 0.0
    no2 = no2 or 0.0

    vehicles = 0.5
    industry = 0.2
    construction = 0.2
    others = 0.1

    if pm25 > 100:
        vehicles += 0.15
        industry += 0.05
    if pm10 > 80:
        construction += 0.10
    if no2 > 40:
        vehicles += 0.10
        industry += 0.05

    total = vehicles + industry + construction + others
    vehicles /= total
    industry /= total
    construction /= total
    others /= total

    return {
        "vehicles": round(vehicles, 2),
        "industry": round(industry, 2),
        "construction": round(construction, 2),
        "others": round(others, 2),
    }
