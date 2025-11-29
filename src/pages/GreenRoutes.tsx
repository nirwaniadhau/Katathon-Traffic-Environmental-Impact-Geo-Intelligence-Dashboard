import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navigation, Leaf, Clock, Wind, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

export default function Routes() {
  const routes = [
    {
      name: "Fastest Route",
      distance: "18.5 km",
      time: "40 min",
      aqi: 180,
      level: "Unhealthy",
      variant: "destructive",
      recommended: false,
    },
    {
      name: "Eco-Friendly Route",
      distance: "21.2 km",
      time: "45 min",
      aqi: 90,
      level: "Good",
      variant: "success",
      recommended: true,
    },
    {
      name: "Balanced Route",
      distance: "19.8 km",
      time: "42 min",
      aqi: 120,
      level: "Moderate",
      variant: "warning",
      recommended: false,
    },
  ];

  // Inline mini map component for each route card
  function RouteMiniMap({ variant }: { variant: "destructive" | "success" | "warning" }) {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<tt.Map | null>(null);

    useEffect(() => {
      if (mapInstance.current) return;

      const API_KEY = (import.meta as any).env?.VITE_TOMTOM_API_KEY || "AzGEUMVIRRspEdOPAtDny0QaYBIDAR9G";
      if (!API_KEY) return;

      // Simple mock paths around Delhi (lng, lat)
      const start: [number, number] = [77.2090, 28.6139]; // CP
      const end: [number, number] = [77.1025, 28.5562]; // IGI Airport

      const fastestPath: [number, number][] = [
        start,
        [77.196, 28.600],
        [77.170, 28.590],
        [77.150, 28.575],
        end,
      ];

      const ecoPath: [number, number][] = [
        start,
        [77.220, 28.620],
        [77.210, 28.590],
        [77.170, 28.565],
        [77.135, 28.560],
        end,
      ];

      const balancedPath: [number, number][] = [
        start,
        [77.205, 28.605],
        [77.185, 28.590],
        [77.165, 28.575],
        end,
      ];

      const path =
        variant === "success" ? ecoPath : variant === "warning" ? balancedPath : fastestPath;

      const mid = path[Math.floor(path.length / 2)];

      mapInstance.current = tt.map({
        key: API_KEY,
        container: mapRef.current as HTMLDivElement,
        center: mid,
        zoom: 11,
        style: { map: "basic_main" },
        dragPan: false,
        scrollZoom: "center",
        interactive: false,
      });

      // draw route
      mapInstance.current.on("load", () => {
        const sourceId = `route-${variant}`;
        if (mapInstance.current?.getSource(sourceId)) return;

        mapInstance.current?.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: path,
            },
            properties: {},
          },
        } as any);

        const color =
          variant === "success"
            ? "#16a34a"
            : variant === "warning"
            ? "#f59e0b"
            : "#ef4444";

        mapInstance.current?.addLayer({
          id: `${sourceId}-layer`,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": color, "line-width": 5, "line-opacity": 0.9 },
        });

        // Start and end markers
        new (tt as any).Marker({ color: "#2563eb" }).setLngLat(start).addTo(mapInstance.current as any);
        new (tt as any).Marker({ color: "#9333ea" }).setLngLat(end).addTo(mapInstance.current as any);
      });

      return () => {
        mapInstance.current && mapInstance.current.remove();
      };
    }, [variant]);

    return (
      <div
        ref={mapRef}
        className="w-full rounded-md overflow-hidden border"
        style={{ height: 140 }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Navigation className="h-8 w-8 text-primary" />
          Green Route Planner
        </h1>
        <p className="text-muted-foreground mt-1">Find routes with optimal air quality and minimal traffic</p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Plan Your Journey</CardTitle>
          <CardDescription>Enter start and end locations to find the best eco-friendly route</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Starting Point</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Connaught Place" className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Indira Gandhi Airport" className="pl-9" />
              </div>
            </div>
          </div>
          <Button className="w-full mt-4 bg-gradient-primary hover:opacity-90">
            <Navigation className="mr-2 h-4 w-4" />
            Find Green Routes
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {routes.map((route, idx) => (
          <Card 
            key={idx} 
            className={`border-2 ${route.recommended ? 'border-success/50 bg-success/5' : ''}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{route.name}</CardTitle>
                  {route.recommended && (
                    <Badge className="bg-gradient-eco text-success-foreground">
                      <Leaf className="mr-1 h-3 w-3" />
                      Recommended
                    </Badge>
                  )}
                </div>
                <Badge 
                  variant="outline"
                  className={`
                    ${route.variant === 'success' ? 'bg-success/10 text-success border-success/30' : ''}
                    ${route.variant === 'warning' ? 'bg-warning/10 text-warning border-warning/30' : ''}
                    ${route.variant === 'destructive' ? 'bg-destructive/10 text-destructive border-destructive/30' : ''}
                  `}
                >
                  AQI {route.aqi} • {route.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="font-semibold">{route.distance}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{route.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Air Quality</p>
                    <p className="font-semibold">{route.level}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <RouteMiniMap variant={route.variant as any} />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-gradient-primary hover:opacity-90">
                  Select Route
                </Button>
                <Button variant="outline" className="flex-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-success/30 bg-success/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-success" />
            Sustainable Travel Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 rounded-lg bg-card border">
              <h3 className="font-semibold mb-1 text-sm">Prefer Carpooling</h3>
              <p className="text-xs text-muted-foreground">During rush hour to reduce traffic congestion and emissions</p>
            </div>
            <div className="p-3 rounded-lg bg-card border">
              <h3 className="font-semibold mb-1 text-sm">Avoid High Pollution Zones</h3>
              <p className="text-xs text-muted-foreground">NH-8 between 6-8 PM shows elevated NO₂ levels</p>
            </div>
            <div className="p-3 rounded-lg bg-card border">
              <h3 className="font-semibold mb-1 text-sm">Use Public Transport</h3>
              <p className="text-xs text-muted-foreground">Metro and buses are eco-friendly alternatives</p>
            </div>
            <div className="p-3 rounded-lg bg-card border">
              <h3 className="font-semibold mb-1 text-sm">Plan Off-Peak Travel</h3>
              <p className="text-xs text-muted-foreground">Travel outside 8-10 AM and 6-8 PM for better air quality</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
