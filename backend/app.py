from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from pdf_generator import pdf



from config.cities import CITY_CONFIG
from services.waqi_service import fetch_waqi_city_data
from services.open_meteo_service import fetch_pm25_history
from services.tomtom_service import fetch_tomtom_corridors
from services.utils import (
    compute_time_window,
    compute_aqi_from_pm25,
    compute_pollution_breakdown,
    pearson_corr,
)

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.register_blueprint(pdf, url_prefix="/api")



@app.route("/api/eco-report", methods=["GET"])
def eco_report():
    # ----------------------------------------------------------
    # 1. INPUTS
    # ----------------------------------------------------------
    city_param = request.args.get("city", "hyderabad").strip().lower()
    range_str = request.args.get("range", "7days").strip()

    cfg = CITY_CONFIG.get(city_param, CITY_CONFIG["hyderabad"])
    city_key = city_param if city_param in CITY_CONFIG else "hyderabad"

    waqi_city = cfg["waqiName"]
    lat, lon = cfg["coords"]
    city_overview = cfg["overview"]

    (
        time_from_iso,
        time_to_iso,
        start_date,
        end_date,
        window_label,
        _days,
    ) = compute_time_window(range_str)

    # ----------------------------------------------------------
    # 2. WAQI SNAPSHOT (CURRENT AQI + POLLUTANTS)
    # ----------------------------------------------------------
    waqi_data = fetch_waqi_city_data(waqi_city)

    if "error" in waqi_data:
        return jsonify({"error": waqi_data["error"], "city": waqi_city}), 500

    pollutants = waqi_data["pollutants"]
    pm25 = pollutants.get("pm25")
    pm10 = pollutants.get("pm10")
    no2 = pollutants.get("no2")

    # 🔧 Fix: if WAQI AQI looks too "clean" vs PM2.5, recompute
    if pollutants.get("aqi") is not None and pm25 is not None:
        calculated_aqi = compute_aqi_from_pm25(pm25)
        # If WAQI AQI is 20 points lower than what PM2.5 suggests → trust PM2.5
        if pollutants["aqi"] < calculated_aqi - 20:
            pollutants["aqi"] = calculated_aqi

    # Numeric-only versions for breakdown (avoid None)
    pm25_num = pm25 or 0.0
    pm10_num = pm10 or 0.0
    no2_num = no2 or 0.0

    # ----------------------------------------------------------
    # 3. OPEN-METEO: HISTORICAL PM2.5 (NO FUTURE DATES)
    # ----------------------------------------------------------
    pm25_history = fetch_pm25_history(lat, lon, start_date, end_date)

    trend_points = []
    for entry in pm25_history:
        val = entry["pm25"]
        trend_points.append(
            {
                "date": entry["date"],
                "pm25": val,
                "aqi": compute_aqi_from_pm25(val),
            }
        )

    trend = {
        "label": f"Air Quality Trend (PM2.5 → AQI) — {window_label}",
        "points": trend_points,
    }

    # ----------------------------------------------------------
    # 4. MONTHLY-LIKE INSIGHTS (BASED ON HISTORY)
    # ----------------------------------------------------------
    if pm25_history:
        vals = [e["pm25"] for e in pm25_history]
        avg_pm25 = round(sum(vals) / len(vals), 2)
        max_pm25 = max(vals)
        max_day = pm25_history[vals.index(max_pm25)]["date"]
        data_points = len(vals)
    else:
        avg_pm25 = None
        max_pm25 = None
        max_day = None
        data_points = 0

    monthly_insights = {
        "dataPoints": data_points,
        "avgPm25": avg_pm25,
        "maxPm25": max_pm25,
        "maxPm25Date": max_day,
        "windowLabel": window_label,
    }

    # ----------------------------------------------------------
    # 5. ENVIRONMENTAL BREAKDOWN (PERCENTAGES)
    # ----------------------------------------------------------
    breakdown = compute_pollution_breakdown(pm25_num, pm10_num, no2_num)

    # ----------------------------------------------------------
    # 6. TOMTOM: DYNAMIC CORRIDORS (TRAFFIC + EMISSIONS)
    # ----------------------------------------------------------
    tomtom = fetch_tomtom_corridors(
        city_key, radius_km=10.0, city_aqi=pollutants.get("aqi")
    )
    corridors = tomtom["corridors"]
    traffic_stats = tomtom["stats"]

    aqi_now = pollutants.get("aqi")

    # Compute local AQI per corridor (traffic → AQI impact)
    if aqi_now is not None and corridors:
        base_aqi = float(aqi_now)
        avg_cong = traffic_stats["avgCongestion"] or 0.0

        for c in corridors:
            diff = c["congestionPercent"] - avg_cong
            # Map +/- 50% congestion difference → +/- 30 AQI points
            local_aqi = base_aqi + (diff / 50.0) * 30.0
            c["aqi"] = max(0, min(500, round(local_aqi)))
    else:
        # Fallback if AQI missing
        for c in corridors:
            c["aqi"] = 100

    # ----------------------------------------------------------
    # 7. CORRELATIONS: TRAFFIC ↔ EMISSIONS / AQI
    # ----------------------------------------------------------
    correlations = {}

    if corridors:
        cong_list = [c["congestionPercent"] for c in corridors]
        emis_list = [c["dailyEmissionsTons"] for c in corridors]
        aqi_list = [c["aqi"] for c in corridors]

        corr_cong_emis = pearson_corr(cong_list, emis_list)
        if corr_cong_emis is not None:
            correlations["congestion_emissions"] = corr_cong_emis

        corr_cong_aqi = pearson_corr(cong_list, aqi_list)
        if corr_cong_aqi is not None:
            correlations["congestion_aqi"] = corr_cong_aqi

    # ----------------------------------------------------------
    # 8. RECOMMENDATIONS (BASED ON CURRENT AQI)
    # ----------------------------------------------------------
    rec = {
        "trafficManagement": [
            "Prioritize public transport on high-AQI days.",
            "Implement dynamic congestion management on worst corridors.",
        ],
        "urbanPlanning": ["Plan green buffers around high-AQI hotspots."],
        "pollutionControl": [],
        "citizenAwareness": [],
    }

    if aqi_now is not None:
        if aqi_now >= 150:
            rec["pollutionControl"].append(
                "Trigger red-alert protocol: restrict heavy diesel vehicles in core areas."
            )
            rec["citizenAwareness"].append(
                "Advise citizens to limit outdoor activity and use masks."
            )
        elif aqi_now >= 100:
            rec["pollutionControl"].append(
                "Increase roadside emission checks for polluting vehicles."
            )
            rec["citizenAwareness"].append(
                "Encourage work-from-home and carpooling on moderate AQI days."
            )
        else:
            rec["pollutionControl"].append(
                "Maintain current emission control policies and expand EV infrastructure."
            )
            rec["citizenAwareness"].append(
                "Promote off-peak travel and public transport usage."
            )

    # ----------------------------------------------------------
    # 9. FINAL RESPONSE (SHAPE MATCHES REACT FRONTEND)
    # ----------------------------------------------------------
    response = {
        "city": waqi_city,
        "timeWindow": {
            "from": time_from_iso,
            "to": time_to_iso,
            "label": window_label,
        },
        "airQuality": {
            "source": "WAQI + Open-Meteo",
            "pollutants": pollutants,
            "trend": trend,
            "monthlyInsights": monthly_insights,
            "station": waqi_data["city_meta"],
        },
        "traffic": {
            "source": "TomTom",
            "radiusKm": 10,
            "corridors": corridors,
            "stats": traffic_stats,
        },
        "environment": {
            "overview": city_overview,
            "emissionBreakdown": breakdown,
        },
        "insights": {
            "correlations": correlations,
            "recommendations": rec,
        },
    }

    return jsonify(response)


@app.route("/")
def health():
    return "WAQI + Open-Meteo + TomTom eco-backend running ✅"


if __name__ == "__main__":
    app.run(port=5000, debug=True)
