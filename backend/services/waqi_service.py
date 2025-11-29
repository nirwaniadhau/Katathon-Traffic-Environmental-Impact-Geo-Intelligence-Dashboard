# services/waqi_service.py

import os
import requests
from dotenv import load_dotenv

load_dotenv()

WAQ_API_KEY = os.getenv("WAQ_API_KEY")


def fetch_waqi_city_data(waqi_city_name: str):
    if not WAQ_API_KEY:
        return {"error": "Missing WAQ_API_KEY in environment"}

    url = f"https://api.waqi.info/feed/{waqi_city_name}/"
    params = {"token": WAQ_API_KEY}

    resp = requests.get(url, params=params, timeout=10)
    print("WAQI status:", resp.status_code)

    if resp.status_code != 200:
        return {"error": f"WAQI HTTP {resp.status_code}: {resp.text[:200]}"}

    payload = resp.json()
    if payload.get("status") != "ok":
        return {"error": f"WAQI error: {payload.get('data')}"}

    data = payload.get("data", {})
    iaqi = data.get("iaqi", {})

    def get_v(key):
        obj = iaqi.get(key)
        return float(obj["v"]) if isinstance(obj, dict) and "v" in obj else None

    pollutants = {
        "aqi": data.get("aqi"),
        "pm25": get_v("pm25"),
        "pm10": get_v("pm10"),
        "no2": get_v("no2"),
        "co": get_v("co"),
        "o3": get_v("o3"),
        "so2": get_v("so2"),
    }

    city_meta = data.get("city", {})

    return {
        "pollutants": pollutants,
        "city_meta": city_meta,
        "raw": data,
    }
