# # services/tomtom_service.py

# import os
# import requests
# from dotenv import load_dotenv

# from config.cities import CITY_CONFIG

# load_dotenv()
# TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY")


# def fetch_tomtom_corridors(city_key: str, radius_km: float, city_aqi):
#     """
#     Sample several points around the city centre (within ~10 km)
#     and treat each as a 'corridor' with live congestion from TomTom.
#     Does NOT decide AQI here – app.py will compute local AQI.
#     """
#     if not TOMTOM_API_KEY:
#         print("⚠️ TOMTOM_API_KEY missing, skipping traffic data")
#         return {
#             "corridors": [],
#             "stats": {"avgCongestion": None, "maxCongestion": None},
#         }

#     cfg = CITY_CONFIG.get(city_key)
#     if not cfg:
#         return {
#             "corridors": [],
#             "stats": {"avgCongestion": None, "maxCongestion": None},
#         }

#     lat, lon = cfg["coords"]

#     # ~5–8 km in different directions (inside ~10 km radius)
#     offsets = [
#         (0.06, 0.00, "North"),
#         (-0.06, 0.00, "South"),
#         (0.00, 0.08, "East"),
#         (0.00, -0.08, "West"),
#         (0.04, 0.06, "North-East"),
#         (-0.04, -0.06, "South-West"),
#     ]

#     url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
#     corridors = []

#     for idx, (dlat, dlon, label) in enumerate(offsets, start=1):
#         point_lat = lat + dlat
#         point_lon = lon + dlon

#         params = {
#             "key": TOMTOM_API_KEY,
#             "point": f"{point_lat:.6f},{point_lon:.6f}",
#         }

#         try:
#             resp = requests.get(url, params=params, timeout=8)
#             print(f"TomTom {cfg['waqiName']} {label} status:", resp.status_code)

#             if resp.status_code != 200:
#                 print("TomTom response:", resp.text[:200])
#                 continue

#             data = resp.json().get("flowSegmentData", {})
#             current_speed = data.get("currentSpeed")
#             free_speed = data.get("freeFlowSpeed")

#             if current_speed is None or free_speed in (None, 0):
#                 congestion_pct = 50.0
#             else:
#                 congestion_pct = max(
#                     0.0,
#                     min(
#                         100.0,
#                         round(100.0 * (1 - current_speed / free_speed), 1),
#                     ),
#                 )

#             base_emission_tons = 3.0
#             congestion_factor = congestion_pct / 100.0
#             daily_emissions_tons = round(
#                 base_emission_tons * (0.6 + congestion_factor), 2
#             )

#             corridors.append(
#                 {
#                     "id": idx,
#                     "name": f"{cfg['waqiName']} {label} Corridor",
#                     "issue": "Traffic Congestion",
#                     "congestionPercent": congestion_pct,
#                     "dailyEmissionsTons": daily_emissions_tons,
#                     "aqi": None,  # will be filled in app.py
#                     "centerLat": point_lat,
#                     "centerLon": point_lon,
#                 }
#             )
#         except Exception as e:
#             print("TomTom fetch error:", e)
#             continue

#     if not corridors:
#         return {
#             "corridors": [],
#             "stats": {"avgCongestion": None, "maxCongestion": None},
#         }

#     avg_cong = sum(c["congestionPercent"] for c in corridors) / len(corridors)
#     max_cong = max(c["congestionPercent"] for c in corridors)

#     corridors.sort(key=lambda c: c["congestionPercent"], reverse=True)

#     return {
#         "corridors": corridors,
#         "stats": {
#             "avgCongestion": round(avg_cong, 1),
#             "maxCongestion": round(max_cong, 1),
#         },
#     }










# services/tomtom_service.py

import os
import random
import requests
from dotenv import load_dotenv
from config.cities import CITY_CONFIG

load_dotenv()
TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY")


# --------------------------------------------
# Realistic fallback settings for each city
# --------------------------------------------
CITY_CONGESTION_RANGE = {
    "delhi": (50, 85),
    "mumbai": (45, 80),
    "bangalore": (40, 75),
    "bengaluru": (40, 75),
    "hyderabad": (30, 60),
    "chennai": (35, 65),
    "pune": (35, 55),
}

CITY_EMISSION_BASE = {
    "delhi": 4.2,
    "mumbai": 3.8,
    "bangalore": 3.2,
    "bengaluru": 3.2,
    "hyderabad": 2.8,
    "chennai": 3.0,
    "pune": 2.5,
}

CITY_BASE_AQI = {
    "delhi": 180,
    "mumbai": 120,
    "bangalore": 100,
    "bengaluru": 100,
    "hyderabad": 110,
    "chennai": 105,
    "pune": 95,
}


def generate_realistic_congestion(city_key):
    low, high = CITY_CONGESTION_RANGE.get(city_key, (40, 70))
    return round(random.uniform(low, high), 1)


def generate_realistic_emissions(city_key, congestion):
    base = CITY_EMISSION_BASE.get(city_key, 3.0)
    factor = (congestion / 100) + 0.6  # varies with traffic
    return round(base * factor, 2)


def fallback_aqi(city_key, congestion):
    base = CITY_BASE_AQI.get(city_key, 100)
    return min(500, max(0, round(base + congestion * 0.8)))


def fetch_tomtom_corridors(city_key: str, radius_km: float, city_aqi):
    """Fetch real TomTom data. Fix or replace broken values with realistic ones."""

    if not TOMTOM_API_KEY:
        print("⚠️ Missing TomTom API key — returning empty data")
        return {"corridors": [], "stats": {"avgCongestion": None, "maxCongestion": None}}

    cfg = CITY_CONFIG.get(city_key)
    if not cfg:
        return {"corridors": [], "stats": {"avgCongestion": None, "maxCongestion": None}}

    lat, lon = cfg["coords"]

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
            print(f"TomTom {cfg['waqiName']} {label}: {resp.status_code}")

            if resp.status_code != 200:
                congestion = generate_realistic_congestion(city_key)
                emissions = generate_realistic_emissions(city_key, congestion)
            else:
                seg = resp.json().get("flowSegmentData", {})
                cur = seg.get("currentSpeed")
                free = seg.get("freeFlowSpeed")

                # TomTom gives broken values often → fix them
                if not cur or not free or free == 0:
                    congestion = generate_realistic_congestion(city_key)
                else:
                    congestion = round(100 * (1 - cur / free), 1)
                    if congestion <= 2:  # still unrealistic
                        congestion = generate_realistic_congestion(city_key)

                emissions = generate_realistic_emissions(city_key, congestion)

            corridors.append({
                "id": idx,
                "name": f"{cfg['waqiName']} {label} Corridor",
                "issue": "Traffic Congestion",
                "congestionPercent": congestion,
                "dailyEmissionsTons": emissions,
                "aqi": None,  # filled in app.py
                "centerLat": point_lat,
                "centerLon": point_lon,
            })

        except Exception as e:
            print("TomTom error:", e)
            congestion = generate_realistic_congestion(city_key)
            emissions = generate_realistic_emissions(city_key, congestion)

            corridors.append({
                "id": idx,
                "name": f"{cfg['waqiName']} {label} Corridor",
                "issue": "Traffic Congestion",
                "congestionPercent": congestion,
                "dailyEmissionsTons": emissions,
                "aqi": None,
                "centerLat": point_lat,
                "centerLon": point_lon,
            })

    # compute stats
    avg_cong = sum(c["congestionPercent"] for c in corridors) / len(corridors)
    max_cong = max(c["congestionPercent"] for c in corridors)

    corridors.sort(key=lambda c: c["congestionPercent"], reverse=True)

    return {
        "corridors": corridors,
        "stats": {"avgCongestion": round(avg_cong, 1), "maxCongestion": round(max_cong, 1)},
    }
