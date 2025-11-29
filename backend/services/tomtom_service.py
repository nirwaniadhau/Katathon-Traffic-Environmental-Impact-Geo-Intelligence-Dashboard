# services/tomtom_service.py

import os
import requests
from dotenv import load_dotenv

from config.cities import CITY_CONFIG

load_dotenv()
TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY")


def fetch_tomtom_corridors(city_key: str, radius_km: float, city_aqi):
    """
    Sample several points around the city centre (within ~10 km)
    and treat each as a 'corridor' with live congestion from TomTom.
    Does NOT decide AQI here – app.py will compute local AQI.
    """
    if not TOMTOM_API_KEY:
        print("⚠️ TOMTOM_API_KEY missing, skipping traffic data")
        return {
            "corridors": [],
            "stats": {"avgCongestion": None, "maxCongestion": None},
        }

    cfg = CITY_CONFIG.get(city_key)
    if not cfg:
        return {
            "corridors": [],
            "stats": {"avgCongestion": None, "maxCongestion": None},
        }

    lat, lon = cfg["coords"]

    # ~5–8 km in different directions (inside ~10 km radius)
    offsets = [
        (0.06, 0.00, "North"),
        (-0.06, 0.00, "South"),
        (0.00, 0.08, "East"),
        (0.00, -0.08, "West"),
        (0.04, 0.06, "North-East"),
        (-0.04, -0.06, "South-West"),
    ]

    url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
    corridors = []

    for idx, (dlat, dlon, label) in enumerate(offsets, start=1):
        point_lat = lat + dlat
        point_lon = lon + dlon

        params = {
            "key": TOMTOM_API_KEY,
            "point": f"{point_lat:.6f},{point_lon:.6f}",
        }

        try:
            resp = requests.get(url, params=params, timeout=8)
            print(f"TomTom {cfg['waqiName']} {label} status:", resp.status_code)

            if resp.status_code != 200:
                print("TomTom response:", resp.text[:200])
                continue

            data = resp.json().get("flowSegmentData", {})
            current_speed = data.get("currentSpeed")
            free_speed = data.get("freeFlowSpeed")

            if current_speed is None or free_speed in (None, 0):
                congestion_pct = 50.0
            else:
                congestion_pct = max(
                    0.0,
                    min(
                        100.0,
                        round(100.0 * (1 - current_speed / free_speed), 1),
                    ),
                )

            base_emission_tons = 3.0
            congestion_factor = congestion_pct / 100.0
            daily_emissions_tons = round(
                base_emission_tons * (0.6 + congestion_factor), 2
            )

            corridors.append(
                {
                    "id": idx,
                    "name": f"{cfg['waqiName']} {label} Corridor",
                    "issue": "Traffic Congestion",
                    "congestionPercent": congestion_pct,
                    "dailyEmissionsTons": daily_emissions_tons,
                    "aqi": None,  # will be filled in app.py
                    "centerLat": point_lat,
                    "centerLon": point_lon,
                }
            )
        except Exception as e:
            print("TomTom fetch error:", e)
            continue

    if not corridors:
        return {
            "corridors": [],
            "stats": {"avgCongestion": None, "maxCongestion": None},
        }

    avg_cong = sum(c["congestionPercent"] for c in corridors) / len(corridors)
    max_cong = max(c["congestionPercent"] for c in corridors)

    corridors.sort(key=lambda c: c["congestionPercent"], reverse=True)

    return {
        "corridors": corridors,
        "stats": {
            "avgCongestion": round(avg_cong, 1),
            "maxCongestion": round(max_cong, 1),
        },
    }
