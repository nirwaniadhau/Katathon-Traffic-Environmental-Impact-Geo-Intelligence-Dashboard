"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TrendingUp, TrendingDown, Activity, AlertCircle, MapPin, Fuel } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  Scatter,
  ScatterChart,
  ZAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  Cell
} from "recharts";
import { useLocation } from "@/contexts/LocationContext";
import { fetchAnalyticsData } from "../services/analyticsService";

export default function Analytics() {
  const { selectedLocation } = useLocation();
  const [loading, setLoading] = useState(false);
  
  // Metrics State
  const [currentAQI, setCurrentAQI] = useState<number | null>(null);
  const [trafficSpeed, setTrafficSpeed] = useState<number | null>(null);
  const [co2Emissions, setCo2Emissions] = useState<number | null>(null); // In kg/h or Liters
  
  // Chart Data State
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [hourlyAqi, setHourlyAqi] = useState<any[]>([]);
  const [hourlyFuel, setHourlyFuel] = useState<any[]>([]); // New state for 24h fuel chart
  const [correlation, setCorrelation] = useState<number>(0);

  // --- Helpers for Random Generation & Calculation ---

  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Formula: Calculate Fuel Consumption (Liters) based on Speed (km/h)
  // Logic: Lower speed (congestion) = Higher fuel consumption per km/effective time due to idling/stop-start.
  const calculateFuelMetrics = (speed: number) => {
    // Base constant for a standard vehicle
    const baseConsumption = 5.0; 
    
    // Congestion penalty: significantly increases as speed drops below 30km/h
    const congestionFactor = speed < 30 ? (30 - speed) * 0.15 : 0;
    
    // Random fluctuation factor (driver behavior)
    const variance = Math.random() * 0.5;

    const totalFuelLiters = baseConsumption + congestionFactor + variance;
    
    // Convert Liters to CO2 kg (Approx 2.3kg CO2 per Liter of Petrol)
    const co2 = totalFuelLiters * 0.23; // scaled down for hourly view per vehicle representation
    
    return {
      fuelLiters: parseFloat(totalFuelLiters.toFixed(2)),
      co2Kg: parseFloat(co2.toFixed(2))
    };
  };

  const generateScatterData = () => {
    const data = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - i));
      for (let j = 0; j < 4; j++) {
        const hour = j * 6;
        const speed = 10 + Math.random() * 40;
        const baseNoise = 40 + (hour > 6 && hour < 20 ? 20 : 0);
        const noise = baseNoise + (50 - speed) * 0.5 + Math.random() * 10;
        data.push({
          date: date.toISOString().split('T')[0],
          hour,
          trafficSpeed: Math.round(speed * 10) / 10,
          noiseLevel: Math.round(noise * 10) / 10,
          congestion: Math.round((1 - speed / 60) * 100)
        });
      }
    }
    
    // Calculate correlation
    if (data.length > 0) {
      const n = data.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
      data.forEach(p => {
        sumX += p.trafficSpeed;
        sumY += p.noiseLevel;
        sumXY += p.trafficSpeed * p.noiseLevel;
        sumX2 += p.trafficSpeed ** 2;
        sumY2 += p.noiseLevel ** 2;
      });
      const num = n * sumXY - sumX * sumY;
      const den = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));
      setCorrelation(den !== 0 ? num / den : 0);
    }
    return data;
  };

  // --- Main Effect: Triggered on Location Selection ---

  useEffect(() => {
    if (!selectedLocation) {
      // Reset everything if no location
      setCorrelationData([]);
      setCurrentAQI(null);
      setTrafficSpeed(null);
      setCo2Emissions(null);
      setHourlyAqi([]);
      setHourlyFuel([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch real/simulated base data (keep existing service call)
        const apiData = await fetchAnalyticsData(
          selectedLocation.latitude,
          selectedLocation.longitude
        );

        // 2. Generate RANDOM metrics for the card view
        const randomSpeed = getRandomInt(10, 65); // Random speed between 10km/h and 65km/h
        const randomAQI = getRandomInt(45, 250);  // Random AQI between Good and Hazardous
        
        // 3. Calculate Fuel/CO2 based on the random speed
        const { co2Kg, fuelLiters } = calculateFuelMetrics(randomSpeed);

        // 4. Update State
        setTrafficSpeed(randomSpeed);
        setCurrentAQI(randomAQI);
        setCo2Emissions(co2Kg);
        setScatterData(generateScatterData());
        setCorrelationData(apiData.correlation || []);

        // 5. Generate 24-Hour Trend Data for AQI (Randomized curve)
        const generatedHourlyAqi = Array.from({ length: 24 }).map((_, i) => {
          // Peak hours (8am-10am, 5pm-7pm) have higher AQI
          const isPeak = (i >= 8 && i <= 10) || (i >= 17 && i <= 19);
          const variance = Math.floor(Math.random() * 20) - 10;
          const base = isPeak ? randomAQI + 30 : randomAQI - 20;
          return {
            hour: `${i}:00`,
            aqi: Math.max(10, base + variance)
          };
        });
        setHourlyAqi(generatedHourlyAqi);

        // 6. Generate 24-Hour Fuel & Emissions Trend
        // This reflects the "Fuel Consumption & Emissions" chart requirement
        const generatedHourlyFuel = Array.from({ length: 24 }).map((_, i) => {
          // Traffic pattern: Slower during day = Higher fuel consumption
          const isTrafficHours = (i >= 8 && i <= 20);
          const speedAtHour = isTrafficHours ? randomSpeed : randomSpeed + 20; // Faster at night
          const metrics = calculateFuelMetrics(speedAtHour);
          
          return {
            hour: `${i}:00`,
            fuel: metrics.fuelLiters,
            emissions: metrics.co2Kg,
            speed: speedAtHour
          };
        });
        setHourlyFuel(generatedHourlyFuel);

      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLocation]);


  // --- Configs ---

  const correlationConfig: ChartConfig = {
    aqi: { label: "AQI", color: "hsl(0 84% 60%)" },
    speed: { label: "Avg Speed (km/h)", color: "hsl(221 83% 53%)" },
  };

  // Updated Config for the 24-hour Fuel Chart
  const fuelConfig: ChartConfig = {
    fuel: { label: "Fuel (L)", color: "hsl(38 92% 50%)" },
    emissions: { label: "CO₂ (kg)", color: "hsl(142 72% 45%)" },
  };

  const areaConfig: ChartConfig = {
    aqi: { label: "AQI", color: "hsl(280 72% 60%)" },
  };

  // Insights Logic
  const insights = useMemo(() => {
    const items: { title: string; desc: string }[] = [];
    if (hourlyAqi.length > 0) {
      const peak = hourlyAqi.reduce((a, b) => (b.aqi > a.aqi ? b : a));
      items.push({
        title: `Peak AQI around ${peak.hour}`,
        desc: `Highest AQI was ${peak.aqi}. Avoid outdoor activity.`,
      });
    }
    if (co2Emissions !== null) {
      items.push({
        title: `Est. CO₂ Emissions: ${co2Emissions.toFixed(2)} kg/h`,
        desc: `Based on avg speed of ${trafficSpeed} km/h (Higher congestion = Higher Emissions).`,
      });
    }
    if (!Number.isNaN(correlation) && correlation !== 0) {
        const direction = correlation < 0 ? "negative" : "positive";
        items.push({
          title: `Traffic-Noise Correlation: ${Math.abs(correlation).toFixed(2)}`,
          desc: `There is a ${direction} correlation between speed and noise levels.`,
        });
    }
    return items;
  }, [hourlyAqi, correlation, co2Emissions, trafficSpeed]);

  return (
    <div className="relative space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent">
            Analytics & Insights
          </h1>
          <p className="text-foreground/80 font-medium">Historical data and correlation analysis</p>
        </div>
      </div>

      {selectedLocation && (
        <Alert className="border-primary/50 bg-primary/10 backdrop-blur-sm">
          <MapPin className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground font-medium">
            <strong>📍 Location:</strong> {selectedLocation.name || `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Metric Cards - displaying Random Values */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* AQI CARD */}
        <Card className="border-2 border-foreground/20 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-foreground">Current AQI</CardTitle>
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-foreground/70" /> : <TrendingUp className="h-4 w-4 text-rose-600" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentAQI && currentAQI > 150 ? 'text-rose-600' : 'text-foreground'}`}>
              {loading ? "—" : currentAQI ?? "—"}
            </div>
            <p className="text-xs text-foreground/70 font-medium">
              Real-time Simulation
            </p>
          </CardContent>
        </Card>

        {/* SPEED CARD */}
        <Card className="border-2 border-foreground/20 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-foreground">Avg Traffic Speed</CardTitle>
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-foreground/70" /> : <Activity className="h-4 w-4 text-amber-600" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "—" : trafficSpeed ? `${trafficSpeed} km/h` : "—"}
            </div>
            <p className="text-xs text-foreground/70 font-medium">
              {trafficSpeed && trafficSpeed < 20 ? "Heavy Congestion" : "Moderate Flow"}
            </p>
          </CardContent>
        </Card>

        {/* EMISSIONS CARD - Calculated from Formula */}
        <Card className="border-2 border-foreground/20 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-foreground">Est. CO₂ Emissions</CardTitle>
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-foreground/70" /> : <Fuel className="h-4 w-4 text-emerald-600" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "—" : co2Emissions !== null ? `${co2Emissions.toFixed(2)} kg/h` : "—"}
            </div>
            <p className="text-xs text-foreground/70 font-medium">
              Calculated based on speed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Chart 1: AQI vs Speed Correlation */}
        <Card className="border-2 border-foreground/20 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-foreground font-bold">AQI vs Traffic Speed Correlation</CardTitle>
            <CardDescription className="text-foreground/80 font-medium">
              Historical analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedLocation ? (
               <Alert className="h-[300px] flex items-center border-foreground/20 bg-background/80">
                <AlertCircle className="h-4 w-4 text-foreground" />
                <AlertDescription className="text-foreground font-medium">
                  Select a location to view data
                </AlertDescription>
              </Alert>
            ) : loading ? (
              <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-foreground" />
              </div>
            ) : correlationData.length > 0 ? (
              <ChartContainer config={correlationConfig} className="h-[300px]">
                <LineChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground)/0.1)" />
                  <XAxis dataKey="day" stroke="hsl(var(--foreground)/0.8)" />
                  <YAxis stroke="hsl(var(--foreground)/0.8)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="aqi" stroke="var(--color-aqi)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="speed" stroke="var(--color-speed)" strokeWidth={2} dot={false} />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-foreground/70">No correlation data</div>
            )}
          </CardContent>
        </Card>

        {/* Chart 2: Fuel Consumption & Emissions (24-Hour) - UPDATED */}
        <Card className="border-2 border-foreground/20 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-foreground font-bold">Fuel Consumption & Emissions (24h)</CardTitle>
            <CardDescription className="text-foreground/80 font-medium">
              Daily trend based on traffic efficiency
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLocation ? (
              loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-foreground" />
                </div>
              ) : hourlyFuel.length > 0 ? (
                <ChartContainer config={fuelConfig} className="h-[300px]">
                  <AreaChart data={hourlyFuel}>
                    <defs>
                      <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-fuel)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-fuel)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-emissions)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-emissions)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground)/0.1)" />
                    <XAxis dataKey="hour" stroke="hsl(var(--foreground)/0.8)" fontSize={12} interval={3} />
                    <YAxis stroke="hsl(var(--foreground)/0.8)" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="fuel" 
                      stroke="var(--color-fuel)" 
                      fillOpacity={1} 
                      fill="url(#colorFuel)" 
                      name="Fuel (L)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="emissions" 
                      stroke="var(--color-emissions)" 
                      fillOpacity={1} 
                      fill="url(#colorEmissions)" 
                      name="CO₂ (kg)"
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-foreground/70">No fuel data available</div>
              )
            ) : (
              <Alert className="h-[300px] flex items-center border-foreground/20 bg-background/80">
                <AlertCircle className="h-4 w-4 text-foreground" />
                <AlertDescription className="text-foreground font-medium">
                   Select a location to view data
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart 3: Hourly AQI Trend */}
      <Card className="border-2 border-foreground/20 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-foreground font-bold">Hourly AQI Trend</CardTitle>
          <CardDescription className="text-foreground/80 font-medium">
            24-hour pollution pattern for {selectedLocation?.name || 'selected location'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={areaConfig} className="h-[420px]">
            <AreaChart data={hourlyAqi}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground)/0.1)" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12, fill: "hsl(var(--foreground)/0.8)" }}
              />
              <YAxis 
                domain={[0, 300]}
                tick={{ fill: "hsl(var(--foreground)/0.8)" }}
              />
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-foreground/20 p-3 rounded-lg shadow-lg text-foreground">
                        <p className="font-semibold">{payload[0].payload.hour}</p>
                        <p>AQI: {payload[0].value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="aqi"
                name="AQI"
                stroke="var(--color-aqi)"
                fill="var(--color-aqi)"
                fillOpacity={0.2}
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Chart 4: Scatter Plot */}
      <Card className="border-2 border-foreground/20 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-foreground font-bold">Traffic Speed vs. Noise Pollution</CardTitle>
          <CardDescription className="text-foreground/80 font-medium">
            Relationship between traffic speed and noise levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-foreground" />
            </div>
          ) : scatterData.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground)/0.1)" />
                  <XAxis 
                    type="number" 
                    dataKey="trafficSpeed" 
                    name="Traffic Speed" 
                    unit=" km/h"
                    domain={[0, 60]}
                    stroke="hsl(var(--foreground)/0.8)"
                    label={{ value: 'Traffic Speed (km/h)', position: 'insideBottomRight', offset: -10, fill: "hsl(var(--foreground)/0.8)" }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="noiseLevel" 
                    name="Noise Level" 
                    unit=" dB"
                    domain={[30, 90]}
                    stroke="hsl(var(--foreground)/0.8)"
                    label={{ value: 'Noise Level (dB)', angle: -90, position: 'insideLeft', fill: "hsl(var(--foreground)/0.8)" }}
                  />
                  <ZAxis range={[50, 400]} dataKey="congestion" name="Congestion" />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                     if (active && payload && payload.length) {
                       const data = payload[0].payload;
                       return (
                         <div className="bg-background border border-foreground/20 p-2 rounded shadow text-sm">
                           <p>Speed: {data.trafficSpeed} km/h</p>
                           <p>Noise: {data.noiseLevel} dB</p>
                         </div>
                       );
                     }
                     return null;
                  }} />
                  <Scatter name="Traffic Data" data={scatterData} fill="#8884d8">
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.hour < 12 ? '#10b981' : '#f59e0b'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-foreground/70">No data available</div>
          )}
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="border-2 border-primary/30 bg-primary/10 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-bold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((i, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-background/80 border-2 border-foreground/10">
                  <p className="font-bold text-foreground">{i.title}</p>
                  <p className="text-sm text-foreground/80 mt-1 font-medium">{i.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-foreground/80 font-medium">Insights will appear once data loads.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
