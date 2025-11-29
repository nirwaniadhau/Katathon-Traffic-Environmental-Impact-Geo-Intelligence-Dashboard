// src/components/Dashboard.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { MetricCard } from "@/components/MetricCard";
import { TechGrid } from "@/components/TechGrid";
import { Wind, Navigation2, Fuel, AlertTriangle, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveMap } from "@/components/LiveMap";

function locKey(lat: number, lng: number) {
  return `metrics:${lat.toFixed(4)},${lng.toFixed(4)}`;
}

// tiny deterministic hash from coords -> seed (0..1)
function coordSeed(lat: number, lng: number) {
  const s = Math.sin(lat * 127.1 + lng * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

// seeded PRNG using the seed in [0,1)
function seededRand(seed: number) {
  let t = seed;
  return () => {
    t = (t * 9301 + 49297) % 233280;
    return t / 233280;
  };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

type Metrics = {
  aqi: number;
  aqiLabel: string;
  congestionPct: number;
  fuelLph: number;
  alerts: Array<{ id: string; level: "critical" | "high" | "moderate"; title: string; desc: string }>;
  ts: number;
};

// map numeric AQI -> label
function aqiLabelFromValue(aqi: number) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

// generate alerts from aqi + randomness
const ALERT_TEMPLATES = [
  { level: "critical", title: "Critical AQI Level", hint: "Avoid area—health risk" },
  { level: "high", title: "High NO₂ Levels", hint: "Use alternate routes" },
  { level: "high", title: "Traffic Bottleneck", hint: "Expect delays" },
  { level: "moderate", title: "Elevated Emissions", hint: "Worsening during evening" },
  { level: "moderate", title: "Construction Work", hint: "Slow traffic expected" },
];

function generateMetrics(lat: number, lng: number): Metrics {
  const seed = coordSeed(lat, lng);
  const rand = seededRand(Math.floor(seed * 1e6));
  const aqiBase = Math.round(30 + Math.pow(rand(), 1.2) * 270);
  const congestion = Math.round(clamp(10 + Math.round(rand() * 85), 10, 95));
  const fuel = Math.round(clamp(20 + congestion * (5 + rand() * 1.5), 20, 500));
  const aqiLabel = aqiLabelFromValue(aqiBase);

  const alerts: Metrics["alerts"] = [];
  const alertChance = clamp((aqiBase - 50) / 300 + rand() * 0.5, 0, 1);
  const count = alertChance > 0.6 ? Math.ceil(alertChance * 3) : Math.floor(alertChance * 2);
  
  for (let i = 0; i < Math.max(0, count); i++) {
    const idx = Math.floor(rand() * ALERT_TEMPLATES.length);
    const tmpl = ALERT_TEMPLATES[idx];
    const id = `${lat.toFixed(4)}:${lng.toFixed(4)}:${i}:${tmpl.title.replace(/\s+/g, "-")}`;
    alerts.push({
      id,
      level: tmpl.level as any,
      title: tmpl.title,
      desc: `${tmpl.hint} • AQI: ${aqiBase} • ${congestion}% Traffic Congestion`,
    });
  }

  return {
    aqi: aqiBase,
    aqiLabel,
    congestionPct: congestion,
    fuelLph: fuel,
    alerts,
    ts: Date.now(),
  };
}

// persist and load helpers
function saveMetricsForLocation(lat: number, lng: number, metrics: Metrics) {
  try {
    localStorage.setItem(locKey(lat, lng), JSON.stringify(metrics));
  } catch (e) {
    console.warn("Failed saving metrics to localStorage", e);
  }
}

function loadMetricsForLocation(lat: number, lng: number): Metrics | null {
  try {
    const v = localStorage.getItem(locKey(lat, lng));
    if (!v) return null;
    return JSON.parse(v) as Metrics;
  } catch (e) {
    return null;
  }
}

// human-friendly "last updated X min ago"
function timeAgo(ts: number) {
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)} hr ago`;
}

export default function Dashboard() {
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 });
  const [metrics, setMetrics] = useState<Metrics | null>(() => loadMetricsForLocation(28.6139, 77.2090));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLocationChange = useCallback((payload: { lat: number; lng: number } | null) => {
    if (!payload) return;
    const { lat, lng } = payload;
    setCenter({ lat, lng });

    const fromStorage = loadMetricsForLocation(lat, lng);
    if (fromStorage) {
      setMetrics(fromStorage);
      return;
    }

    const gen = generateMetrics(lat, lng);
    setMetrics(gen);
    saveMetricsForLocation(lat, lng, gen);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const gen = generateMetrics(center.lat, center.lng);
    setMetrics(gen);
    saveMetricsForLocation(center.lat, center.lng, gen);
    setIsRefreshing(false);
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!metrics) {
      const gen = generateMetrics(center.lat, center.lng);
      setMetrics(gen);
      saveMetricsForLocation(center.lat, center.lng, gen);
    }
  }, []);

  return (
    <div className="relative space-y-6 animate-in fade-in-50 duration-500">
      <TechGrid />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent transition-all duration-500">
            Traffic & Environmental Dashboard
          </h1>
          <p className="text-foreground/80 transition-colors duration-300 font-medium">
            Real-time monitoring of traffic congestion and air quality — showing data for{" "}
            <span className="font-semibold text-foreground">
              {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
            </span>
          </p>
        </div>

        <Button 
          onClick={handleRefresh}
          size="sm"
          variant="outline"
          className="transition-all duration-300 hover:scale-105 hover:shadow-md border-foreground/20 hover:border-foreground/40 bg-background/80 text-foreground font-medium"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        <MetricCard
          title="Average AQI"
          value={metrics ? String(metrics.aqi) : "—"}
          subtitle={metrics ? `${metrics.aqiLabel} • Last updated ${timeAgo(metrics.ts)}` : "No data"}
          icon={Wind}
          variant={metrics ? (metrics.aqi > 150 ? "destructive" : metrics.aqi > 100 ? "warning" : "default") : "default"}
        />
        <MetricCard
          title="Traffic Congestion"
          value={metrics ? `${metrics.congestionPct}%` : "—"}
          subtitle={metrics ? `${metrics.congestionPct > 75 ? "Above average • Rush hour" : "Normal"} • Last updated ${timeAgo(metrics.ts)}` : "No data"}
          icon={Navigation2}
          variant={metrics ? (metrics.congestionPct > 75 ? "warning" : "default") : "default"}
        />
        <MetricCard
          title="Fuel Wasted"
          value={metrics ? `${metrics.fuelLph} L/hr` : "—"}
          subtitle={metrics ? `Estimated across all zones • Last updated ${timeAgo(metrics.ts)}` : "No data"}
          icon={Fuel}
          variant="warning"
        />
        <MetricCard
          title="Active Alerts"
          value={metrics ? String(metrics.alerts.length) : "0"}
          subtitle={metrics ? `${metrics.alerts.length} active • Last updated ${timeAgo(metrics.ts)}` : "No data"}
          icon={AlertTriangle}
          variant={metrics && metrics.alerts.length > 0 ? "destructive" : "default"}
        />
      </div>

      {/* Live Map */}
      <div className="grid gap-6 lg:grid-cols-3 relative z-10">
        <Card className="lg:col-span-3 border-2 bg-background/90 backdrop-blur-md transition-all duration-500 hover:shadow-xl border-foreground/20 hover:border-foreground/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-foreground font-bold text-xl">
                  Live Map View
                </CardTitle>
                <CardDescription className="text-foreground/80 font-medium">
                  Interactive traffic and pollution visualization
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-600/30 font-semibold"
                >
                  Traffic
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-rose-600/20 text-rose-700 dark:text-rose-300 border-rose-600/30 font-semibold"
                >
                  AQI
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-foreground/30 transition-all duration-500 hover:border-foreground/50 hover:shadow-lg">
              <LiveMap
                onLocationChange={(c: any) => {
                  if (c?.lat != null && c?.lng != null) handleLocationChange(c);
                }}
                onCenterChange={(c: any) => {
                  if (c?.lat != null && c?.lng != null) handleLocationChange(c);
                }}
                center={center}
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 border-emerald-600/30 hover:border-emerald-600/50 bg-emerald-600/10 text-foreground font-medium">
                <div className="w-3 h-3 rounded-full bg-emerald-600 mr-2 transition-colors duration-300" />
                Good (0-50)
              </Button>
              <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 border-amber-600/30 hover:border-amber-600/50 bg-amber-600/10 text-foreground font-medium">
                <div className="w-3 h-3 rounded-full bg-amber-600 mr-2 transition-colors duration-300" />
                Moderate (51-100)
              </Button>
              <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 border-rose-600/30 hover:border-rose-600/50 bg-rose-600/10 text-foreground font-medium">
                <div className="w-3 h-3 rounded-full bg-rose-600 mr-2 transition-colors duration-300" />
                Unhealthy (100+)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="relative z-10 border-2 bg-amber-600/10 backdrop-blur-md transition-all duration-500 hover:shadow-lg border-amber-600/30 hover:border-amber-600/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-bold text-xl transition-colors duration-300">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 transition-colors duration-300" />
            Active Environmental Alerts
          </CardTitle>
          <CardDescription className="text-foreground/80 font-medium transition-colors duration-300">
            Showing alerts for {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics && metrics.alerts.length > 0 ? (
              metrics.alerts.map((alert, index) => (
                <div 
                  key={alert.id}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-background/80 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-md border-foreground/20 hover:border-foreground/30 animate-in slide-in-from-left-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 transition-colors duration-300 ${
                    alert.level === "critical" ? "bg-rose-600" : 
                    alert.level === "high" ? "bg-amber-600" : 
                    "bg-amber-500"
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-foreground transition-colors duration-300">
                      {alert.title}
                    </p>
                    <p className="text-sm text-foreground/80 font-medium transition-colors duration-300">
                      {alert.desc}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg border bg-background/80 text-center transition-all duration-500 hover:shadow-md border-foreground/20">
                <p className="text-foreground/80 font-medium transition-colors duration-300">
                  No active alerts for this area. Environmental conditions are stable.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}