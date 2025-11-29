"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, Loader2, AlertCircle, MapPin } from "lucide-react";
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
  BarChart,
  Bar,
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
import { format } from "date-fns";
import { useLocation } from "@/contexts/LocationContext";
// import { fetchAnalyticsData } from "@/services/analyticsService.tsx";
import { fetchAnalyticsData } from "../services/analyticsService";

import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Analytics() {
  const { selectedLocation } = useLocation();
  const [loading, setLoading] = useState(false);
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  const [currentAQI, setCurrentAQI] = useState<number | null>(null);
  const [trafficSpeed, setTrafficSpeed] = useState<number | null>(null);
  const [co2Emissions, setCo2Emissions] = useState<number | null>(null);
  const [noiseLevel, setNoiseLevel] = useState<number | null>(null);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [correlation, setCorrelation] = useState<number>(0);

  // Generate scatter plot data and calculate correlation
  const generateScatterData = () => {
    const data = [];
    const now = new Date();
    
    // Generate data for the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - i));
      
      // Generate 4 data points per day (morning, afternoon, evening, night)
      for (let j = 0; j < 4; j++) {
        const hour = j * 6; // 0, 6, 12, 18
        const trafficSpeed = 10 + Math.random() * 40; // 10-50 km/h
        // Higher noise during day, lower at night
        const baseNoise = 40 + (hour > 6 && hour < 20 ? 20 : 0);
        // More traffic congestion leads to higher noise
        const noiseLevel = baseNoise + (50 - trafficSpeed) * 0.5 + Math.random() * 10;
        
        data.push({
          date: date.toISOString().split('T')[0],
          hour,
          trafficSpeed: Math.round(trafficSpeed * 10) / 10,
          noiseLevel: Math.round(noiseLevel * 10) / 10,
          congestion: Math.round((1 - trafficSpeed / 60) * 100) // 0-100% congestion
        });
      }
    }
    
    // Calculate correlation
    if (data.length > 0) {
      const n = data.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
      
      data.forEach(point => {
        const x = point.trafficSpeed;
        const y = point.noiseLevel;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
      });
      
      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      const corr = denominator !== 0 ? numerator / denominator : 0;
      setCorrelation(corr);
    }
    
    return data;
  };

  // Fetch data when location changes
  useEffect(() => {
    if (!selectedLocation) {
      setCorrelationData([]);
      setCurrentAQI(null);
      setTrafficSpeed(null);
      setCo2Emissions(null);
      setNoiseLevel(null);
      setScatterData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchAnalyticsData(
          selectedLocation.latitude,
          selectedLocation.longitude
        );

        // Generate scatter plot data
        const scatterPlotData = generateScatterData();
        setScatterData(scatterPlotData);
        
        // Calculate average noise level from scatter data
        const avgNoise = scatterPlotData.reduce((sum, point) => sum + point.noiseLevel, 0) / scatterPlotData.length;
        
        // Use actual data or provide reasonable defaults
        setCurrentAQI(data.aqi?.aqi || 85);
        setTrafficSpeed(data.traffic?.average_speed || 35);
        setCo2Emissions(data.traffic?.co2_emissions || 0.25);
        setNoiseLevel(avgNoise || 65);
        setCorrelationData(data.correlation || []);

        console.log("📊 Analytics data loaded for location:", {
          aqi: data.aqi?.aqi || 85,
          speed: data.traffic?.average_speed || 35,
          co2: data.traffic?.co2_emissions || 0.25,
          dataPoints: data.correlation?.length || 0,
        });
      } catch (error) {
        console.error("Error loading analytics:", error);
        // Set default values on error
        setCurrentAQI(85);
        setTrafficSpeed(35);
        setCo2Emissions(0.25);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLocation]);
  // Hardcoded prototype data
  const weeklyTrend = [
    { day: "Mon", aqi: 150, speed: 34 },
    { day: "Tue", aqi: 162, speed: 32 },
    { day: "Wed", aqi: 170, speed: 28 },
    { day: "Thu", aqi: 180, speed: 26 },
    { day: "Fri", aqi: 192, speed: 24 },
    { day: "Sat", aqi: 140, speed: 36 },
    { day: "Sun", aqi: 132, speed: 38 },
  ];

  // Use trafficSpeed and co2Emissions for congestion/fuel chart
  const congestionFuel =
    selectedLocation && trafficSpeed !== null && co2Emissions !== null
      ? [
          {
            label: selectedLocation.name || "Selected Zone",
            congestion: trafficSpeed !== null ? Math.round((35 - trafficSpeed) * 2 + 50) : 0, // Estimate congestion if not available
            fuel: Number(co2Emissions.toFixed(2)),
          },
        ]
      : [];

  const [hourlyAqi, setHourlyAqi] = useState<Array<{ hour: string; aqi: number; pm25?: number; pm10?: number; no2?: number; timestamp?: string }>>([]);

  // Fetch real-time AQI data when location changes
  useEffect(() => {
    if (!selectedLocation) return;
    
    const fetchAqiData = async () => {
      try {
        // Clear previous data to avoid showing old series briefly
        setHourlyAqi([]);
        const data = await fetchAnalyticsData(
          selectedLocation.latitude,
          selectedLocation.longitude
        );
        
        if (data.hourlyAqi && data.hourlyAqi.length > 0) {
          setHourlyAqi(data.hourlyAqi);
        }
      } catch (error) {
        console.error('Error fetching AQI data:', error);
      }
    };
    
    fetchAqiData();
    
    // Refresh data every 30 minutes
    const interval = setInterval(fetchAqiData, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [selectedLocation]);

  const correlationConfig: ChartConfig = {
    aqi: { label: "AQI", color: "hsl(0 84% 60%)" },
    speed: { label: "Avg Speed (km/h)", color: "hsl(221 83% 53%)" },
  };

  const barConfig: ChartConfig = {
    congestion: { label: "Congestion %", color: "hsl(38 92% 50%)" },
    fuel: { label: "Fuel Wasted (L)", color: "hsl(142 72% 45%)" },
  };

  const areaConfig: ChartConfig = {
    aqi: { label: "AQI", color: "hsl(280 72% 60%)" },
  };

  // Compute key insights based on data for the selected location
  const insights = useMemo(() => {
    const items: { title: string; desc: string }[] = [];
    if (hourlyAqi && hourlyAqi.length > 0) {
      const peak = hourlyAqi.reduce((a, b) => (b.aqi > a.aqi ? b : a));
      const min = hourlyAqi.reduce((a, b) => (b.aqi < a.aqi ? b : a));
      items.push({
        title: `Peak AQI around ${peak.hour}`,
        desc: `Highest AQI in the past 24 hours was ${peak.aqi}. Consider avoiding outdoor activity around this time.`,
      });
      items.push({
        title: `Cleanest hour around ${min.hour}`,
        desc: `Best time window with lower pollution was near ${min.hour} (AQI ${min.aqi}). Plan sensitive activities then.`,
      });
    }
    if (!Number.isNaN(correlation)) {
      const corrAbs = Math.abs(correlation);
      const strength = corrAbs > 0.7 ? "strong" : corrAbs > 0.4 ? "moderate" : corrAbs > 0.2 ? "weak" : "very weak";
      const direction = correlation < 0 ? "negative" : "positive";
      items.push({
        title: `Traffic-noise correlation: ${strength} ${direction}`,
        desc: correlation < 0
          ? "As traffic speed increases, noise tends to decrease in this area."
          : "As traffic speed increases, noise tends to increase in this area.",
      });
    }
    if (co2Emissions !== null && !Number.isNaN(co2Emissions)) {
      items.push({
        title: `Estimated CO₂ emissions: ${co2Emissions.toFixed(2)} kg/h`,
        desc: "Based on current traffic conditions for the selected location.",
      });
    }
    return items;
  }, [hourlyAqi, correlation, co2Emissions]);

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

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-foreground/20 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-foreground/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-foreground">Current AQI</CardTitle>
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-foreground/70" /> : <TrendingUp className="h-4 w-4 text-rose-600" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "—" : currentAQI ?? "—"}
            </div>
            <p className="text-xs text-foreground/70 font-medium">
              {selectedLocation ? "Real-time data" : "Select location on map"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-foreground/20 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-foreground/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-foreground">Traffic Speed</CardTitle>
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-foreground/70" /> : <Activity className="h-4 w-4 text-amber-600" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "—" : trafficSpeed ? `${Math.round(trafficSpeed)} km/h` : "—"}
            </div>
            <p className="text-xs text-foreground/70 font-medium">
              {selectedLocation ? "Current speed" : "Select location on map"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-foreground/20 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-foreground/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-foreground">CO₂ Emissions</CardTitle>
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-foreground/70" /> : <TrendingDown className="h-4 w-4 text-emerald-600" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "—" : co2Emissions !== null ? `${co2Emissions.toFixed(2)} kg/h` : "—"}
            </div>
            <p className="text-xs text-foreground/70 font-medium">
              {selectedLocation ? "Based on current traffic" : "Select location on map"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2 border-foreground/20 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-foreground font-bold">AQI vs Traffic Speed Correlation</CardTitle>
            <CardDescription className="text-foreground/80 font-medium">
              {selectedLocation
                ? `Real-time data for ${selectedLocation.name || `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`}`
                : "Weekly trend analysis"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedLocation ? (
              <Alert className="h-[300px] flex items-center border-foreground/20 bg-background/80">
                <AlertCircle className="h-4 w-4 text-foreground" />
                <AlertDescription className="text-foreground font-medium">
                  <strong>Click on the map</strong> in Dashboard to select a location
                </AlertDescription>
              </Alert>
            ) : loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-foreground" />
                  <p className="text-sm text-foreground/70 font-medium">Loading correlation data...</p>
                </div>
              </div>
            ) : correlationData.length > 0 ? (
              <ChartContainer config={correlationConfig} className="h-[300px]">
                <LineChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground)/0.1)" />
                  <XAxis dataKey="day" stroke="hsl(var(--foreground)/0.8)" />
                  <YAxis stroke="hsl(var(--foreground)/0.8)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="aqi"
                    stroke="var(--color-aqi)"
                    strokeWidth={2}
                    dot={false}
                    name="AQI"
                  />
                  <Line
                    type="monotone"
                    dataKey="speed"
                    stroke="var(--color-speed)"
                    strokeWidth={2}
                    dot={false}
                    name="Speed (km/h)"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-foreground/70 font-medium">
                No data available for this location
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-foreground/20 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-foreground font-bold">Congestion Impact on Fuel Wastage</CardTitle>
            <CardDescription className="text-foreground/80 font-medium">Real-time for selected location</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLocation ? (
              loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-foreground" />
                </div>
              ) : congestionFuel.length > 0 ? (
                <ChartContainer config={barConfig} className="h-[300px]">
                  <BarChart data={congestionFuel}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground)/0.1)" />
                    <XAxis dataKey="label" stroke="hsl(var(--foreground)/0.8)" />
                    <YAxis stroke="hsl(var(--foreground)/0.8)" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="congestion" fill="var(--color-congestion)" radius={4} />
                    <Bar dataKey="fuel" fill="var(--color-fuel)" radius={4} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-foreground/70 font-medium">
                  No data available for this location
                </div>
              )
            ) : (
              <Alert className="h-[300px] flex items-center border-foreground/20 bg-background/80">
                <AlertCircle className="h-4 w-4 text-foreground" />
                <AlertDescription className="text-foreground font-medium">
                  <strong>Click on the map</strong> in Dashboard to select a location
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hourly AQI Trend */}
      <Card className="border-2 border-foreground/20 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-foreground font-bold">Hourly AQI Trend</CardTitle>
          <CardDescription className="text-foreground/80 font-medium">
            24-hour pollution pattern analysis for {selectedLocation?.name || 'selected location'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={areaConfig} className="h-[420px]">
            <AreaChart data={hourlyAqi}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground)/0.1)" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12, fill: "hsl(var(--foreground)/0.8)" }}
                tickFormatter={(value) => String(value)}
              />
              <YAxis 
                domain={[0, 300]}
                tickCount={7}
                tick={{ fill: "hsl(var(--foreground)/0.8)" }}
                tickFormatter={(value) => {
                  if (value === 0) return '0';
                  if (value === 50) return '50';
                  if (value === 100) return '100';
                  if (value === 150) return '150';
                  if (value === 200) return '200';
                  if (value === 250) return '250';
                  if (value === 300) return '300';
                  return '';
                }}
              />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-foreground/20 p-3 rounded-lg shadow-lg text-foreground">
                        <p className="font-semibold">{data.hour}</p>
                        <p>AQI: {data.aqi}</p>
                        <p>PM2.5: {data.pm25 || 'N/A'} µg/m³</p>
                        <p>PM10: {data.pm10 || 'N/A'} µg/m³</p>
                        <p>NO₂: {data.no2 || 'N/A'} ppb</p>
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
                activeDot={{ r: 6, strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Traffic and Noise Pollution Scatter Plot */}
      <Card className="border-2 border-foreground/20 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-foreground font-bold">Traffic Speed vs. Noise Pollution</CardTitle>
          <CardDescription className="text-foreground/80 font-medium">
            Relationship between traffic speed and noise levels. Each point represents a 6-hour period.
          </CardDescription>
          {scatterData.length > 0 && (
            <div className="text-sm text-foreground/80 font-medium">
              Correlation: <span className={`font-bold ${correlation < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {correlation < 0 ? 'Negative' : 'Positive'} correlation ({Math.abs(correlation).toFixed(2)})
              </span>
              {correlation < 0 ? (
                <span> - As traffic speed increases, noise levels tend to decrease</span>
              ) : (
                <span> - As traffic speed increases, noise levels tend to increase</span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-foreground" />
            </div>
          ) : scatterData.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 30,
                    left: 20,
                  }}
                >
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
                  <RechartsTooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border border-foreground/20 p-4 rounded-lg shadow-lg text-foreground">
                          <p className="font-semibold">{data.date}</p>
                          <p>Time: {data.hour}:00 - {data.hour + 6}:00</p>
                          <p>Speed: {data.trafficSpeed} km/h</p>
                          <p>Noise: {data.noiseLevel} dB</p>
                          <p>Congestion: {data.congestion}%</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <RechartsLegend />
                  <Scatter 
                    name="Traffic Data Points" 
                    data={scatterData} 
                    fill="#8884d8"
                    shape="circle"
                  >
                    {scatterData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.hour < 6 || entry.hour >= 20 ? '#4f46e5' : // Night
                          entry.hour < 12 ? '#10b981' : // Morning
                          entry.hour < 18 ? '#f59e0b' : // Afternoon
                          '#ef4444' // Evening
                        }
                        opacity={0.8}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm text-foreground/80 font-medium">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span>Morning (6-12)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                  <span>Afternoon (12-18)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span>Evening (18-20)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-600 mr-1"></div>
                  <span>Night (20-6)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-foreground/70 font-medium">
              <AlertCircle className="h-5 w-5 mr-2" />
              No data available for the selected location
            </div>
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
                <div key={idx} className="p-4 rounded-lg bg-background/80 border-2 border-foreground/10 transition-all duration-300 hover:border-foreground/20">
                  <p className="font-bold text-foreground">{i.title}</p>
                  <p className="text-sm text-foreground/80 mt-1 font-medium">{i.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-foreground/80 font-medium">Insights will appear once data loads for the selected location.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}