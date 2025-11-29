import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Brain } from "lucide-react";
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

export default function Predictions() {
  const predictions = [
    { time: "6:00 PM", aqi: 210, level: "High", color: "destructive" },
    { time: "7:00 PM", aqi: 225, level: "Very High", color: "destructive" },
    { time: "8:00 PM", aqi: 195, level: "Moderate", color: "warning" },
    { time: "9:00 PM", aqi: 175, level: "Moderate", color: "warning" },
    { time: "10:00 PM", aqi: 150, level: "Moderate", color: "warning" },
    { time: "11:00 PM", aqi: 135, level: "Low", color: "success" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          AI-Powered Predictions
        </h1>
        <p className="text-muted-foreground mt-1">Forecasting air quality and traffic patterns for the next 6 hours</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Current AQI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">175</div>
            <Badge variant="outline" className="mt-2 bg-warning/10 text-warning border-warning/30">
              Unhealthy
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Peak Predicted AQI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">225</div>
            <p className="text-xs text-muted-foreground mt-2">Expected at 7:00 PM</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Forecast Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">87%</div>
            <p className="text-xs text-muted-foreground mt-2">Based on ML model</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>6-Hour AQI Forecast</CardTitle>
          <CardDescription>Delhi NCR • Updated 2 minutes ago</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ aqi: { label: "AQI", color: "hsl(0 84% 60%)" } } as ChartConfig}
            className="h-[280px] mb-6"
          >
            <LineChart data={predictions.map(p => ({ time: p.time, aqi: p.aqi }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="aqi" stroke="var(--color-aqi)" strokeWidth={2} dot />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {predictions.map((pred, idx) => (
              <div key={idx} className="p-4 rounded-lg border-2 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{pred.time}</span>
                  <Badge 
                    variant="outline" 
                    className={`
                      ${pred.color === 'destructive' ? 'bg-destructive/10 text-destructive border-destructive/30' : ''}
                      ${pred.color === 'warning' ? 'bg-warning/10 text-warning border-warning/30' : ''}
                      ${pred.color === 'success' ? 'bg-success/10 text-success border-success/30' : ''}
                    `}
                  >
                    {pred.level}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{pred.aqi}</div>
                <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      pred.color === 'destructive' ? 'bg-gradient-alert' : 
                      pred.color === 'warning' ? 'bg-warning' : 
                      'bg-gradient-eco'
                    }`}
                    style={{ width: `${Math.min((pred.aqi / 300) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2 border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Critical Alerts
            </CardTitle>
            <CardDescription>Areas predicted to reach hazardous levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-card border-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">NH-8 Corridor</p>
                  <p className="text-sm text-muted-foreground">AQI may reach 240 by 7 PM</p>
                </div>
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                  Critical
                </Badge>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-card border-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">MG Road Junction</p>
                  <p className="text-sm text-muted-foreground">PM2.5 levels increasing rapidly</p>
                </div>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                  High
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-gradient-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Model Insights
            </CardTitle>
            <CardDescription>How we generate predictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium text-sm">Traffic Pattern Analysis</p>
                <p className="text-xs text-muted-foreground">Historical congestion data correlates with AQI spikes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium text-sm">Weather Conditions</p>
                <p className="text-xs text-muted-foreground">Wind speed and direction affect pollutant dispersion</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium text-sm">Time-Based Patterns</p>
                <p className="text-xs text-muted-foreground">Rush hours consistently show elevated pollution levels</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-gradient-primary hover:opacity-90">
              View Model Details
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
