# config/cities.py

CITY_CONFIG = {
    "hyderabad": {
        "waqiName": "Hyderabad",
        "coords": (17.3850, 78.4867),
        "overview": {
            "totalCO2Tons": 1.1,
            "fuelWastedLiters": 3200,
            "affectedPopulation": 9_000_000,
            "ecoScore": 46,
        },
    },
    "bangalore": {
        "waqiName": "Bengaluru",
        "coords": (12.9716, 77.5946),
        "overview": {
            "totalCO2Tons": 1.0,
            "fuelWastedLiters": 3000,
            "affectedPopulation": 12_000_000,
            "ecoScore": 48,
        },
    },
    "bengaluru": {  # alias
        "waqiName": "Bengaluru",
        "coords": (12.9716, 77.5946),
        "overview": {
            "totalCO2Tons": 1.0,
            "fuelWastedLiters": 3000,
            "affectedPopulation": 12_000_000,
            "ecoScore": 48,
        },
    },
    "mumbai": {
        "waqiName": "Mumbai",
        "coords": (19.0760, 72.8777),
        "overview": {
            "totalCO2Tons": 1.6,
            "fuelWastedLiters": 4700,
            "affectedPopulation": 20_000_000,
            "ecoScore": 42,
        },
    },
    "delhi": {
        "waqiName": "Delhi",
        "coords": (28.6139, 77.2090),
        "overview": {
            "totalCO2Tons": 1.8,
            "fuelWastedLiters": 5200,
            "affectedPopulation": 33_000_000,
            "ecoScore": 38,
        },
    },
}
