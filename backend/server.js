// // backend/server.js

// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const axios = require("axios");
// const OpenAI = require("openai");

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ----- ENV KEYS -----
// const TOMTOM_KEY = process.env.TOMTOM_API_KEY;
// const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;
// const OPENAI_KEY = process.env.OPENAI_API_KEY;
// const PORT = process.env.PORT || 3001;

// const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null;

// // =============== UTILS ===================

// // Next 6 upcoming hours (labels)
// function getNext6HoursLabels() {
//   const labels = [];
//   const now = new Date();

//   for (let i = 1; i <= 6; i++) {
//     const t = new Date(now.getTime() + i * 60 * 60 * 1000);
//     labels.push(
//       t.toLocaleTimeString("en-IN", {
//         hour: "numeric",
//         minute: "2-digit",
//       })
//     );
//   }

//   return labels;
// }

// // AQI classification for UI
// function classifyAQI(aqi) {
//   if (aqi >= 200) return { level: "High", color: "destructive" };
//   if (aqi >= 150) return { level: "Moderate", color: "warning" };
//   return { level: "Low", color: "success" };
// }

// // Fetch live traffic from TomTom
// async function fetchTraffic(lat, lon) {
//   if (!TOMTOM_KEY) return null;
//   try {
//     const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_KEY}&point=${lat},${lon}`;
//     const res = await axios.get(url);
//     return res.data.flowSegmentData || null;
//   } catch (err) {
//     console.warn("TomTom traffic error:", err.message);
//     return null;
//   }
// }

// // Fetch current weather from OpenWeather (metric units)
// async function fetchWeather(lat, lon) {
//   if (!OPENWEATHER_KEY) {
//     console.warn("No OPENWEATHER_KEY, using default weather.");
//     return {
//       temperature: 27,
//       humidity: 65,
//       windSpeed: 3.5,
//     };
//   }

//   try {
//     const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`;
//     const res = await axios.get(url);
//     const data = res.data;

//     return {
//       temperature: data.main?.temp ?? 27,
//       humidity: data.main?.humidity ?? 65,
//       windSpeed: data.wind?.speed ?? 3.5,
//     };
//   } catch (err) {
//     console.warn("OpenWeather error:", err.message);
//     return {
//       temperature: 27,
//       humidity: 65,
//       windSpeed: 3.5,
//     };
//   }
// }

// // Compute congestion % from traffic data
// function computeCongestion(traffic) {
//   if (!traffic || !traffic.currentSpeed || !traffic.freeFlowSpeed) return 0;

//   const ratio =
//     1 - traffic.currentSpeed / Math.max(traffic.freeFlowSpeed, 1);
//   return Math.round(Math.max(0, Math.min(ratio, 1)) * 100);
// }

// // Base AQI from current traffic + weather
// function computeCurrentAQI(congestion, weather) {
//   let aqi = 80;

//   // Traffic effect
//   if (congestion > 80) aqi += 70;
//   else if (congestion > 60) aqi += 40;
//   else if (congestion > 40) aqi += 20;
//   else if (congestion > 20) aqi += 10;
//   else aqi += 5;

//   // Wind effect
//   if (weather.windSpeed < 1) aqi += 40;
//   else if (weather.windSpeed < 2.5) aqi += 25;
//   else if (weather.windSpeed < 5) aqi += 10;
//   else if (weather.windSpeed > 8) aqi -= 5;

//   // Humidity effect
//   if (weather.humidity > 85) aqi += 25;
//   else if (weather.humidity > 70) aqi += 15;
//   else if (weather.humidity < 40) aqi -= 5;

//   // Clamp
//   aqi = Math.max(30, Math.min(aqi, 400));
//   return Math.round(aqi);
// }

// // Estimate traffic for a future hour (rough heuristic)
// function forecastTrafficForHour(baseCongestion, hour, isWeekend) {
//   // hour: local hour 0-23
//   let pattern;

//   if (isWeekend) {
//     // weekends: late morning + evening
//     if (hour >= 10 && hour <= 13) pattern = 0.7;
//     else if (hour >= 18 && hour <= 21) pattern = 0.8;
//     else if (hour >= 0 && hour <= 5) pattern = 0.2;
//     else pattern = 0.4;
//   } else {
//     // weekdays: rush hours
//     if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)) pattern = 1.0;
//     else if (hour >= 11 && hour <= 16) pattern = 0.6;
//     else if (hour >= 0 && hour <= 5) pattern = 0.25;
//     else pattern = 0.4;
//   }

//   // Mix pattern with current congestion
//   const base = baseCongestion || 30;
//   let forecast = base * pattern;

//   // Add small random noise for realism
//   const noise = (Math.random() - 0.5) * 10;
//   forecast = Math.max(0, Math.min(100, forecast + noise));

//   return Math.round(forecast);
// }

// // Compute AQI from factors for a future hour
// function forecastAQIForHour(currentAQI, trafficPct, weather, futureHour) {
//   // start near current AQI
//   let aqi = currentAQI;

//   // Traffic influence
//   if (trafficPct > 80) aqi += 25;
//   else if (trafficPct > 60) aqi += 15;
//   else if (trafficPct > 40) aqi += 5;
//   else if (trafficPct < 20) aqi -= 5;

//   // Wind influence
//   if (weather.windSpeed < 1) aqi += 25;
//   else if (weather.windSpeed < 2.5) aqi += 15;
//   else if (weather.windSpeed < 5) aqi += 5;
//   else if (weather.windSpeed > 8) aqi -= 10;

//   // Humidity
//   if (weather.humidity > 85) aqi += 15;
//   else if (weather.humidity > 70) aqi += 8;
//   else if (weather.humidity < 40) aqi -= 5;

//   // Time-of-day inversion
//   if (futureHour >= 0 && futureHour <= 4) {
//     // night inversion
//     aqi += 10;
//   } else if (futureHour >= 5 && futureHour <= 9) {
//     // morning mixing improves
//     aqi -= 10;
//   } else if (futureHour >= 18 && futureHour <= 22) {
//     // evening stagnation
//     aqi += 5;
//   }

//   // Clamp and smooth
//   aqi = Math.max(30, Math.min(aqi, 400));
//   return Math.round(aqi);
// }

// // Fallback textual alerts/insights/recs
// function buildDefaultTextuals(currentAQI, trafficCongestion, weather) {
//   const alerts = [];
//   if (currentAQI >= 180) {
//     alerts.push({
//       title: "High AQI Levels Expected",
//       description:
//         "Air quality is in the unhealthy range. Sensitive groups should reduce outdoor exposure.",
//       severity: "High",
//     });
//   } else if (currentAQI >= 150) {
//     alerts.push({
//       title: "Moderate Air Quality Risk",
//       description:
//         "Air quality may cause mild discomfort for sensitive individuals during outdoor activities.",
//       severity: "Medium",
//     });
//   } else {
//     alerts.push({
//       title: "No critical alerts",
//       description: "Air quality is relatively safe over the next few hours.",
//       severity: "Low",
//     });
//   }

//   const insights = [
//     {
//       title: "Traffic & Emissions",
//       description: `Current congestion is around ${trafficCongestion}%. Vehicular emissions are a key contributor to urban AQI.`,
//     },
//     {
//       title: "Weather Impact",
//       description: `Wind speed near ${weather.windSpeed} m/s and humidity around ${weather.humidity}% influence how quickly pollutants disperse.`,
//     },
//   ];

//   const recommendations = [];
//   if (currentAQI >= 180) {
//     recommendations.push(
//       "Avoid outdoor exercise during the forecast period.",
//       "Use masks or air purifiers indoors if possible."
//     );
//   } else if (currentAQI >= 140) {
//     recommendations.push(
//       "Prefer travelling during lower AQI slots, as shown in the forecast.",
//       "Keep windows closed during peak pollution hours."
//     );
//   } else {
//     recommendations.push(
//       "Conditions are relatively good. Outdoor activities are generally safe."
//     );
//   }

//   const confidence = 0.78;

//   return { alerts, insights, recommendations, confidence };
// }

// // Ask GPT-5.1 for alerts/insights/recs/confidence
// async function getAITextuals({
//   locationLabel,
//   lat,
//   lon,
//   currentAQI,
//   currentTraffic,
//   weather,
//   aqiForecast,
//   trafficForecast,
// }) {
//   if (!openai) {
//     return buildDefaultTextuals(currentAQI, currentTraffic, weather);
//   }

//   const prompt = `
// You are an environmental intelligence assistant.

// Location: ${locationLabel} (lat ${lat}, lon ${lon})

// Current conditions:
// - Current AQI: ${currentAQI}
// - Current traffic congestion: ${currentTraffic}%
// - Weather: temperature ${weather.temperature}°C, humidity ${weather.humidity}%, wind speed ${weather.windSpeed} m/s

// 6-hour AQI forecast (JSON):
// ${JSON.stringify(aqiForecast)}

// 6-hour traffic forecast (JSON):
// ${JSON.stringify(trafficForecast)}

// TASK:
// Based on this, generate a concise JSON object with:
// - "alerts": array of 1-3 objects { "title", "description", "severity" (Low|Medium|High|Critical) }
// - "insights": array of 2-4 objects { "title", "description" }
// - "recommendations": array of 2-4 short strings giving advice on travel and health
// - "confidence": number between 0.6 and 0.95 representing how reliable the forecast is.

// Return ONLY JSON. No extra text.
// `;

//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-5.1",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a strict JSON API. Always return valid JSON and nothing else.",
//         },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0.4,
//     });

//     const raw = completion.choices[0]?.message?.content || "{}";
//     const parsed = JSON.parse(raw);

//     const alerts = Array.isArray(parsed.alerts) ? parsed.alerts : [];
//     const insights = Array.isArray(parsed.insights) ? parsed.insights : [];
//     const recommendations = Array.isArray(parsed.recommendations)
//       ? parsed.recommendations
//       : [];
//     const confidence =
//       typeof parsed.confidence === "number"
//         ? parsed.confidence
//         : 0.8;

//     if (!alerts.length && !insights.length && !recommendations.length) {
//       return buildDefaultTextuals(currentAQI, currentTraffic, weather);
//     }

//     return { alerts, insights, recommendations, confidence };
//   } catch (err) {
//     console.error("OpenAI error:", err.message);
//     return buildDefaultTextuals(currentAQI, currentTraffic, weather);
//   }
// }

// // =============== MAIN ENDPOINT ===================

// app.get("/api/predictions", async (req, res) => {
//   const lat = req.query.lat || "28.6139"; // Delhi default
//   const lon = req.query.lon || "77.2090";
//   const locationLabel = req.query.label || "Delhi NCR";

//   try {
//     const now = new Date();
//     const isWeekend = [0, 6].includes(now.getDay()); // Sun=0, Sat=6

//     // 1) Fetch live traffic + weather in parallel
//     const [traffic, weather] = await Promise.all([
//       fetchTraffic(lat, lon),
//       fetchWeather(lat, lon),
//     ]);

//     const trafficCongestion = computeCongestion(traffic);
//     const currentAQI = computeCurrentAQI(trafficCongestion, weather);

//     // 2) Build 6-hour forecasts
//     const timeLabels = getNext6HoursLabels();
//     const aqiForecast = [];
//     const trafficForecast = [];

//     for (let i = 0; i < timeLabels.length; i++) {
//       const futureHour = (now.getHours() + i + 1) % 24;

//       const tForecast = forecastTrafficForHour(
//         trafficCongestion,
//         futureHour,
//         isWeekend
//       );
//       trafficForecast.push({
//         time: timeLabels[i],
//         congestion: tForecast,
//       });

//       const aqiVal = forecastAQIForHour(
//         currentAQI,
//         tForecast,
//         weather,
//         futureHour
//       );
//       const { level, color } = classifyAQI(aqiVal);
//       aqiForecast.push({
//         time: timeLabels[i],
//         aqi: aqiVal,
//         level,
//         color,
//       });
//     }

//     // 3) Ask GPT-5.1 for alerts/insights/recommendations/confidence
//     const aiText = await getAITextuals({
//       locationLabel,
//       lat,
//       lon,
//       currentAQI,
//       currentTraffic: trafficCongestion,
//       weather,
//       aqiForecast,
//       trafficForecast,
//     });

//     // 4) Build response
//     res.json({
//       location: {
//         label: locationLabel,
//         lat,
//         lon,
//       },
//       currentAQI,
//       currentTrafficCongestion: trafficCongestion,
//       weather,
//       predictions: aqiForecast, // for your existing AQI UI
//       trafficForecast,          // NEW: for traffic graph
//       alerts: aiText.alerts,
//       insights: aiText.insights,
//       recommendations: aiText.recommendations,
//       confidence: aiText.confidence,
//       updatedAt: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error("Error in /api/predictions:", err.message);

//     // Very safe fallback
//     const weather = { temperature: 27, humidity: 65, windSpeed: 3.5 };
//     const fallbackAQI = 130;
//     const timeLabels = getNext6HoursLabels();
//     const predictions = timeLabels.map((time, idx) => {
//       const aqi = fallbackAQI + idx * 5;
//       const { level, color } = classifyAQI(aqi);
//       return { time, aqi, level, color };
//     });
//     const { alerts, insights, recommendations, confidence } =
//       buildDefaultTextuals(fallbackAQI, 40, weather);

//     res.json({
//       location: { label: "Unknown", lat: null, lon: null },
//       currentAQI: fallbackAQI,
//       currentTrafficCongestion: 40,
//       weather,
//       predictions,
//       trafficForecast: [],
//       alerts,
//       insights,
//       recommendations,
//       confidence,
//       updatedAt: new Date().toISOString(),
//     });
//   }
// });

// // Health check
// app.get("/health", (req, res) => {
//   res.json({ status: "ok" });
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Backend is running at http://localhost:${PORT}`);
// });















// backend/server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const OpenAI = require("openai"); // kept, but not actively used now

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ----- ENV KEYS -----
const TOMTOM_KEY = process.env.TOMTOM_API_KEY;
const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY; // not used but kept
const PORT = process.env.PORT || 3001;

const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null;

// =============== UTILS ===================

// Next 6 upcoming hours (labels)
function getNext6HoursLabels() {
  const labels = [];
  const now = new Date();

  for (let i = 1; i <= 6; i++) {
    const t = new Date(now.getTime() + i * 60 * 60 * 1000);
    labels.push(
      t.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      })
    );
  }

  return labels;
}

// AQI classification for UI
function classifyAQI(aqi) {
  if (aqi >= 200) return { level: "High", color: "destructive" };
  if (aqi >= 150) return { level: "Moderate", color: "warning" };
  return { level: "Low", color: "success" };
}

// Simple deterministic random based on coordinates
function coordSeed(lat, lon) {
  const la = Number(lat) || 0;
  const lo = Number(lon) || 0;
  return Math.abs(Math.sin(la * 12.9898 + lo * 78.233)) * 10000;
}

function coordRandom(lat, lon, offset = 0) {
  const s = coordSeed(lat, lon) + offset;
  const x = Math.sin(s) * 10000;
  return x - Math.floor(x); // 0–1
}

// Fetch live traffic from TomTom
async function fetchTraffic(lat, lon) {
  if (!TOMTOM_KEY) return null;
  try {
    const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_KEY}&point=${lat},${lon}`;
    const res = await axios.get(url);
    return res.data.flowSegmentData || null;
  } catch (err) {
    console.warn("TomTom traffic error:", err.message);
    return null;
  }
}

// Fetch current weather from OpenWeather (metric units)
async function fetchWeather(lat, lon) {
  if (!OPENWEATHER_KEY) {
    console.warn("No OPENWEATHER_KEY, using default weather.");
    return {
      temperature: 27,
      humidity: 65,
      windSpeed: 3.5,
    };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`;
    const res = await axios.get(url);
    const data = res.data;

    return {
      temperature: data.main?.temp ?? 27,
      humidity: data.main?.humidity ?? 65,
      windSpeed: data.wind?.speed ?? 3.5,
    };
  } catch (err) {
    console.warn("OpenWeather error:", err.message);
    return {
      temperature: 27,
      humidity: 65,
      windSpeed: 3.5,
    };
  }
}

// Compute congestion % from traffic data
function computeCongestion(traffic) {
  if (!traffic || !traffic.currentSpeed || !traffic.freeFlowSpeed) return 0;

  const ratio =
    1 - traffic.currentSpeed / Math.max(traffic.freeFlowSpeed, 1);
  return Math.round(Math.max(0, Math.min(ratio, 1)) * 100);
}

// Base AQI from current traffic + weather
function computeCurrentAQI(congestion, weather) {
  let aqi = 80;

  // Traffic effect
  if (congestion > 80) aqi += 70;
  else if (congestion > 60) aqi += 40;
  else if (congestion > 40) aqi += 20;
  else if (congestion > 20) aqi += 10;
  else aqi += 5;

  // Wind effect
  if (weather.windSpeed < 1) aqi += 40;
  else if (weather.windSpeed < 2.5) aqi += 25;
  else if (weather.windSpeed < 5) aqi += 10;
  else if (weather.windSpeed > 8) aqi -= 5;

  // Humidity effect
  if (weather.humidity > 85) aqi += 25;
  else if (weather.humidity > 70) aqi += 15;
  else if (weather.humidity < 40) aqi -= 5;

  // Clamp
  aqi = Math.max(30, Math.min(aqi, 400));
  return Math.round(aqi);
}

// Estimate traffic for a future hour (rough heuristic + coord-based noise)
function forecastTrafficForHour(baseCongestion, hour, isWeekend, lat, lon, stepIndex) {
  // hour: local hour 0-23
  let pattern;

  if (isWeekend) {
    // weekends: late morning + evening
    if (hour >= 10 && hour <= 13) pattern = 0.7;
    else if (hour >= 18 && hour <= 21) pattern = 0.8;
    else if (hour >= 0 && hour <= 5) pattern = 0.2;
    else pattern = 0.4;
  } else {
    // weekdays: rush hours
    if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)) pattern = 1.0;
    else if (hour >= 11 && hour <= 16) pattern = 0.6;
    else if (hour >= 0 && hour <= 5) pattern = 0.25;
    else pattern = 0.4;
  }

  // Mix pattern with current congestion
  const base = baseCongestion || 30;
  let forecast = base * pattern;

  // Deterministic small noise based on lat/lon + hour
  const noise = (coordRandom(lat, lon, 100 + stepIndex) - 0.5) * 10;
  forecast = Math.max(0, Math.min(100, forecast + noise));

  return Math.round(forecast);
}

// Compute AQI from factors for a future hour
function forecastAQIForHour(currentAQI, trafficPct, weather, futureHour, lat, lon, stepIndex) {
  // start near current AQI
  let aqi = currentAQI;

  // Traffic influence
  if (trafficPct > 80) aqi += 25;
  else if (trafficPct > 60) aqi += 15;
  else if (trafficPct > 40) aqi += 5;
  else if (trafficPct < 20) aqi -= 5;

  // Wind influence
  if (weather.windSpeed < 1) aqi += 25;
  else if (weather.windSpeed < 2.5) aqi += 15;
  else if (weather.windSpeed < 5) aqi += 5;
  else if (weather.windSpeed > 8) aqi -= 10;

  // Humidity
  if (weather.humidity > 85) aqi += 15;
  else if (weather.humidity > 70) aqi += 8;
  else if (weather.humidity < 40) aqi -= 5;

  // Time-of-day inversion
  if (futureHour >= 0 && futureHour <= 4) {
    // night inversion
    aqi += 10;
  } else if (futureHour >= 5 && futureHour <= 9) {
    // morning mixing improves
    aqi -= 10;
  } else if (futureHour >= 18 && futureHour <= 22) {
    // evening stagnation
    aqi += 5;
  }

  // Extra tiny coord-based variation per hour
  const extraNoise = (coordRandom(lat, lon, 200 + stepIndex) - 0.5) * 15;
  aqi += extraNoise;

  // Clamp and smooth
  aqi = Math.max(30, Math.min(aqi, 400));
  return Math.round(aqi);
}

// Fallback textual alerts/insights/recs
function buildDefaultTextuals(currentAQI, trafficCongestion, weather, locationLabel, maxAQI) {
  const alerts = [];
  const peakAQI = maxAQI != null ? maxAQI : currentAQI;

  if (peakAQI >= 220) {
    alerts.push({
      title: "High pollution expected",
      description: `AQI may reach around ${peakAQI} in the next few hours in ${locationLabel}. Sensitive groups should avoid outdoor exposure.`,
      severity: "Critical",
    });
  } else if (peakAQI >= 180) {
    alerts.push({
      title: "Unhealthy air quality",
      description: `Air quality is in the unhealthy range for ${locationLabel}. Consider limiting time spent near main roads.`,
      severity: "High",
    });
  } else if (peakAQI >= 150) {
    alerts.push({
      title: "Moderate air quality risk",
      description:
        "Air quality may cause mild discomfort for sensitive individuals during outdoor activities.",
      severity: "Medium",
    });
  } else {
    alerts.push({
      title: "No critical alerts",
      description: "Air quality is relatively safe over the next few hours.",
      severity: "Low",
    });
  }

  const insights = [
    {
      title: "Traffic & Emissions",
      description: `Current congestion is around ${trafficCongestion}%. Vehicular emissions are a key contributor to AQI in ${locationLabel}.`,
    },
    {
      title: "Weather Impact",
      description: `Wind speed near ${weather.windSpeed.toFixed(
        1
      )} m/s and humidity around ${weather.humidity}% influence how quickly pollutants disperse.`,
    },
  ];

  const recommendations = [];
  if (peakAQI >= 220) {
    recommendations.push(
      "Avoid outdoor exercise during peak pollution hours.",
      "Use masks or air purifiers indoors if possible."
    );
  } else if (peakAQI >= 180) {
    recommendations.push(
      "Sensitive groups should limit time outdoors and stay away from heavy traffic corridors.",
      "Keep windows closed during the most polluted hours."
    );
  } else if (peakAQI >= 140) {
    recommendations.push(
      "Prefer travelling during lower AQI slots, as shown in the forecast.",
      "Choose greener or less congested routes when possible."
    );
  } else {
    recommendations.push(
      "Conditions are relatively good. Outdoor activities are generally safe.",
      "Continue monitoring AQI if traffic suddenly increases."
    );
  }

  const confidence = 0.78;

  return { alerts, insights, recommendations, confidence };
}

// "AI" textuals – now fully local, not calling OpenAI (more stable)
async function getAITextuals({
  locationLabel,
  lat,
  lon,
  currentAQI,
  currentTraffic,
  weather,
  aqiForecast,
  trafficForecast,
}) {
  const maxForecastAQI = aqiForecast.reduce(
    (max, p) => (p.aqi > max ? p.aqi : max),
    currentAQI
  );

  // If you want to re-enable OpenAI later, you can add it here.
  return buildDefaultTextuals(
    currentAQI,
    currentTraffic,
    weather,
    locationLabel,
    maxForecastAQI
  );
}

// =============== MAIN ENDPOINT ===================

app.get("/api/predictions", async (req, res) => {
  const lat = req.query.lat || "28.6139"; // Delhi default
  const lon = req.query.lon || "77.2090";
  const locationLabel = req.query.label || "Delhi NCR";

  try {
    const now = new Date();
    const isWeekend = [0, 6].includes(now.getDay()); // Sun=0, Sat=6

    // 1) Fetch live traffic + weather in parallel
    const [traffic, weather] = await Promise.all([
      fetchTraffic(lat, lon),
      fetchWeather(lat, lon),
    ]);

    const trafficCongestion = computeCongestion(traffic);

    // Base AQI from traffic + weather
    let currentAQI = computeCurrentAQI(trafficCongestion, weather);

    // Extra location-based variation so every city feels different
    const locNoise = Math.round((coordRandom(lat, lon, 5) - 0.5) * 40);
    currentAQI = Math.max(30, Math.min(currentAQI + locNoise, 350));

    // 2) Build 6-hour forecasts
    const timeLabels = getNext6HoursLabels();
    const aqiForecast = [];
    const trafficForecast = [];

    for (let i = 0; i < timeLabels.length; i++) {
      const futureHour = (now.getHours() + i + 1) % 24;

      const tForecast = forecastTrafficForHour(
        trafficCongestion,
        futureHour,
        isWeekend,
        lat,
        lon,
        i
      );
      trafficForecast.push({
        time: timeLabels[i],
        congestion: tForecast,
      });

      const aqiVal = forecastAQIForHour(
        currentAQI,
        tForecast,
        weather,
        futureHour,
        lat,
        lon,
        i
      );
      const { level, color } = classifyAQI(aqiVal);
      aqiForecast.push({
        time: timeLabels[i],
        aqi: aqiVal,
        level,
        color,
      });
    }

    // 3) Compute alerts/insights/recommendations/confidence
    const aiText = await getAITextuals({
      locationLabel,
      lat,
      lon,
      currentAQI,
      currentTraffic: trafficCongestion,
      weather,
      aqiForecast,
      trafficForecast,
    });

    // 4) Build response
    res.json({
      location: {
        label: locationLabel,
        lat,
        lon,
      },
      currentAQI,
      currentTrafficCongestion: trafficCongestion,
      weather,
      predictions: aqiForecast, // for your existing AQI UI
      trafficForecast,          // for traffic graph
      alerts: aiText.alerts,
      insights: aiText.insights,
      recommendations: aiText.recommendations,
      confidence: aiText.confidence,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error in /api/predictions:", err.message);

    // Very safe fallback
    const weather = { temperature: 27, humidity: 65, windSpeed: 3.5 };
    const fallbackAQI = 130;
    const timeLabels = getNext6HoursLabels();
    const predictions = timeLabels.map((time, idx) => {
      const aqi = fallbackAQI + idx * 5;
      const { level, color } = classifyAQI(aqi);
      return { time, aqi, level, color };
    });

    const { alerts, insights, recommendations, confidence } =
      buildDefaultTextuals(
        fallbackAQI,
        40,
        weather,
        "Unknown",
        fallbackAQI + 25
      );

    res.json({
      location: { label: "Unknown", lat: null, lon: null },
      currentAQI: fallbackAQI,
      currentTrafficCongestion: 40,
      weather,
      predictions,
      trafficForecast: [],
      alerts,
      insights,
      recommendations,
      confidence,
      updatedAt: new Date().toISOString(),
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend is running at http://localhost:${PORT}`);
});