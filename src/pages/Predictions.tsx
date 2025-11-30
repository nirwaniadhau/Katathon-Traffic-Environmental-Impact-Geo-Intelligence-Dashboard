import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, Brain } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";

type AQIPrediction = {
  time: string;
  aqi: number;
  level: "Low" | "Moderate" | "High";
  color: "success" | "warning" | "destructive";
};

type TrafficPoint = {
  time: string;
  congestion: number; // %
};

type WeatherInfo = {
  temperature: number;
  humidity: number;
  windSpeed: number;
};

type AlertInfo = {
  title: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
};

type InsightInfo = {
  title: string;
  description: string;
};

type ApiResponse = {
  location: {
    label: string;
    lat: string;
    lon: string;
  };
  currentAQI: number;
  currentTrafficCongestion: number;
  weather: WeatherInfo;
  predictions: AQIPrediction[];
  trafficForecast: TrafficPoint[];
  alerts: AlertInfo[];
  insights: InsightInfo[];
  recommendations: string[];
  confidence: number; // 0–1
  updatedAt: string;
};

const aqiChartConfig: ChartConfig = {
  aqi: {
    label: "AQI",
    color: "hsl(0 84% 60%)",
  },
};

const trafficChartConfig: ChartConfig = {
  congestion: {
    label: "Traffic Congestion (%)",
    color: "hsl(142 72% 45%)",
  },
};

// ---------- NEW: central place to store the chosen location ----------
type Coords = { lat: string; lon: string; label: string };

export default function Predictions() {
  const [searchParams] = useSearchParams();

  const [coords, setCoords] = useState<Coords>({
    lat: "28.6139",
    lon: "77.2090",
    label: "Delhi NCR",
  });

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1) Decide which location to use (URL > localStorage > default)
  useEffect(() => {
    const urlLat = searchParams.get("lat");
    const urlLon = searchParams.get("lon");
    const urlLabel = searchParams.get("label");

    if (urlLat && urlLon) {
      setCoords({
        lat: urlLat,
        lon: urlLon,
        label: urlLabel || "Selected location",
      });
      return;
    }

    // No URL params → try localStorage (set by LiveMap)
    try {
      const raw = localStorage.getItem("geoSense:lastLocation");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.lat && saved?.lon) {
          setCoords({
            lat: String(saved.lat),
            lon: String(saved.lon),
            label: saved.label || "Selected location",
          });
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to read saved location", e);
    }

    // else keep default Delhi NCR
  }, [searchParams]);

  async function fetchPredictions(lat: string, lon: string, label: string) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `http://localhost:3001/api/predictions?lat=${lat}&lon=${lon}&label=${encodeURIComponent(
          label,
        )}`,
      );

      if (!res.ok) {
        throw new Error(`Backend error: ${res.status}`);
      }

      const json: ApiResponse = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Prediction fetch error:", err);
      setError(err.message ?? "Failed to load predictions");
    } finally {
      setLoading(false);
    }
  }

  // 2) Whenever coords change → call backend for that place
  useEffect(() => {
    fetchPredictions(coords.lat, coords.lon, coords.label);
    const id = setInterval(
      () => fetchPredictions(coords.lat, coords.lon, coords.label),
      5 * 60 * 1000,
    );
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords.lat, coords.lon, coords.label]);

  const isError = !!error;
  const isLoading = loading && !data;

  const currentAQI = data?.currentAQI ?? 0;
  const currentLevel =
    currentAQI >= 200 ? "High" : currentAQI >= 150 ? "Moderate" : "Low";

  const peakPrediction = data?.predictions?.reduce<AQIPrediction | null>(
    (max, p) => (!max || p.aqi > max.aqi ? p : max),
    null,
  );

  const confidencePercent = data ? Math.round((data.confidence || 0.8) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          AI-Powered Predictions
        </h1>
        <p className="text-muted-foreground mt-1">
          6-hour AQI & traffic forecast using live traffic and real-time weather data
        </p>

        {data && (
          <p className="text-xs text-muted-foreground mt-1">
            {data.location.label} • Updated{" "}
            {new Date(data.updatedAt).toLocaleTimeString("en-IN", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>

      {/* LOADING / ERROR */}
      {isLoading && (
        <Card className="border-2">
          <CardContent className="py-10 text-center text-muted-foreground">
            Fetching live predictions…
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card className="border-2 border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Failed to load predictions
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => fetchPredictions(coords.lat, coords.lon, coords.label)}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          {/* TOP METRICS */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current AQI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.currentAQI}</div>
                <Badge
                  variant="outline"
                  className={`mt-2 ${
                    currentLevel === "High"
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : currentLevel === "Moderate"
                      ? "bg-warning/10 text-warning border-warning/30"
                      : "bg-success/10 text-success border-success/30"
                  }`}
                >
                  {currentLevel}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Peak Predicted AQI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">
                  {peakPrediction ? peakPrediction.aqi : "--"}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {peakPrediction ? `Expected at ${peakPrediction.time}` : "Awaiting forecast"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Current traffic: {data.currentTrafficCongestion}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Forecast Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{confidencePercent}%</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on AI-assisted model
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Temp {data.weather.temperature.toFixed(1)}°C • Humidity {data.weather.humidity}% • Wind{" "}
                  {data.weather.windSpeed.toFixed(1)} m/s
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AQI FORECAST */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>6-Hour AQI Forecast</CardTitle>
              <CardDescription>
                {data.location.label} • Live data from backend (traffic + weather)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={aqiChartConfig} className="h-[260px] mb-6">
                <LineChart data={data.predictions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="aqi"
                    stroke="var(--color-aqi)"
                    strokeWidth={2}
                    dot
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.predictions.map((pred, idx) => (
                  <div key={idx} className="p-4 rounded-lg border-2 bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{pred.time}</span>
                      <Badge
                        variant="outline"
                        className={`${
                          pred.color === "destructive"
                            ? "bg-destructive/10 text-destructive border-destructive/30"
                            : pred.color === "warning"
                            ? "bg-warning/10 text-warning border-warning/30"
                            : "bg-success/10 text-success border-success/30"
                        }`}
                      >
                        {pred.level}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold">{pred.aqi}</div>
                    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          pred.color === "destructive"
                            ? "bg-gradient-alert"
                            : pred.color === "warning"
                            ? "bg-warning"
                            : "bg-gradient-eco"
                        }`}
                        style={{ width: `${Math.min((pred.aqi / 300) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* TRAFFIC FORECAST */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>6-Hour Traffic Forecast</CardTitle>
              <CardDescription>
                Estimated congestion levels based on current traffic and time-of-day patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trafficChartConfig} className="h-[260px] mb-6">
                <LineChart data={data.trafficForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="congestion"
                    stroke="var(--color-congestion)"
                    strokeWidth={2}
                    dot
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.trafficForecast.map((t, idx) => (
                  <div key={idx} className="p-4 rounded-lg border-2 bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t.time}</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        {t.congestion}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Estimated congestion based on live traffic & daily patterns
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ALERTS + INSIGHTS */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Critical Alerts */}
            <Card className="border-2 border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Critical Alerts
                </CardTitle>
                <CardDescription>Areas and periods predicted to reach concerning levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.alerts && data.alerts.length > 0 ? (
                  data.alerts.map((alert, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-card border-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            alert.severity === "Critical"
                              ? "bg-destructive/10 text-destructive border-destructive/30"
                              : alert.severity === "High"
                              ? "bg-warning/10 text-warning border-warning/30"
                              : "bg-success/10 text-success border-success/30"
                          }`}
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No critical alerts for the next 6 hours.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Model Insights */}
            <Card className="border-2 border-primary/20 bg-gradient-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Model Insights
                </CardTitle>
                <CardDescription>How we generate these predictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.insights && data.insights.length > 0 ? (
                  data.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="font-medium text-sm">{insight.title}</p>
                        <p className="text-xs text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Insights unavailable for this run.
                  </p>
                )}

                {data.recommendations && data.recommendations.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-sm mb-1">Recommendations</p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                      {data.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button className="w-full mt-4 bg-gradient-primary hover:opacity-90">
                  View Model Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}