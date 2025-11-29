"use client";
import { MetricCard } from "@/components/MetricCard";
import { TechGrid } from "@/components/TechGrid";
import { Wind, Navigation2, Fuel, AlertTriangle } from "lucide-react";
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

export default function Dashboard() {
  return (
    <div className="relative space-y-6 animate-in fade-in-50 duration-500">
      <TechGrid />

      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold tracking-tight text-primary drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
          Traffic & Environmental Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-time monitoring of traffic congestion and air quality
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        <MetricCard
          title="Average AQI"
          value="175"
          subtitle="Unhealthy • Last updated 2 min ago"
          icon={Wind}
          variant="destructive"
        />
        <MetricCard
          title="Traffic Congestion"
          value="68%"
          subtitle="Above average • Rush hour"
          icon={Navigation2}
          variant="warning"
        />
        <MetricCard
          title="Fuel Wasted"
          value="145 L/hr"
          subtitle="Estimated across all zones"
          icon={Fuel}
          variant="warning"
        />
        <MetricCard
          title="Active Alerts"
          value="3"
          subtitle="High pollution zones detected"
          icon={AlertTriangle}
          variant="destructive"
        />
      </div>

      {/* Live Map (expanded to take Quick Stats area) */}
      <div className="grid gap-6 lg:grid-cols-3 relative z-10">
        <Card className="lg:col-span-3 border-2 glass glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Live Map View</CardTitle>
                <CardDescription>
                  Interactive traffic and pollution visualization
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="bg-success/10 text-success border-success/30"
                >
                  Traffic
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-destructive/30"
                >
                  AQI
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Live Map Component Here */}
            <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary/30">
              <LiveMap />
            </div>

            {/* Legend Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <div className="w-3 h-3 rounded-full bg-success mr-2" />
                Good (0-50)
              </Button>
              <Button variant="outline" size="sm">
                <div className="w-3 h-3 rounded-full bg-warning mr-2" />
                Moderate (51-100)
              </Button>
              <Button variant="outline" size="sm">
                <div className="w-3 h-3 rounded-full bg-destructive mr-2" />
                Unhealthy (100+)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="border-2 border-warning/30 bg-warning/5 glass relative z-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Active Environmental Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
              <div className="flex-1">
                <p className="font-medium">MG Road - Critical AQI Level</p>
                <p className="text-sm text-muted-foreground">
                  AQI: 245 • 82% Traffic Congestion • Avoid during 6-8 PM
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-2 h-2 rounded-full bg-warning mt-2" />
              <div className="flex-1">
                <p className="font-medium">Ring Road - High NO₂ Levels</p>
                <p className="text-sm text-muted-foreground">
                  AQI: 182 • 78% Traffic Congestion • Use alternate routes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-2 h-2 rounded-full bg-warning mt-2" />
              <div className="flex-1">
                <p className="font-medium">NH-8 Corridor - Elevated Emissions</p>
                <p className="text-sm text-muted-foreground">
                  AQI: 156 • Expected to worsen during evening
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}