import { Card } from "@/components/ui/card";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

interface CorrelationProps {
  correlations: Record<string, number>;
  trend?: { points?: { pm25?: number; pm10?: number; date: string }[] };
  traffic?: { corridors?: { congestionPercent: number; dailyEmissionsTons: number }[] };
}

const formatPairName = (key: string) => {
  const [a, b] = key.split("_");
  return `${a.toUpperCase()} ↔ ${b.toUpperCase()}`;
};

const getCorrelationStrength = (value: number) => {
  const absValue = Math.abs(value);
  if (absValue > 0.7) return { 
    strength: "Strong", 
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/30"
  };
  if (absValue > 0.4) return { 
    strength: "Moderate", 
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/30"
  };
  if (absValue > 0.2) return { 
    strength: "Weak", 
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/30"
  };
  return { 
    strength: "Very Weak", 
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-500/20",
    borderColor: "border-rose-500/30"
  };
};

const CorrelationInsights = ({ correlations, trend, traffic }: CorrelationProps) => {
  if (!correlations) return null;

  // --------------------------------------------
  // 1) PM2.5 ↔ PM10 scatter data
  // --------------------------------------------
  const pmScatter =
    trend?.points
      ?.map((p) => ({
        pm25: p.pm25 ?? null,
        pm10: p.pm10 ?? null,
        date: p.date,
      }))
      ?.filter((p) => p.pm25 && p.pm10) || [];

  // --------------------------------------------
  // 2) Congestion ↔ Emissions scatter data
  // --------------------------------------------
  const congestionScatter =
    traffic?.corridors?.map((c) => ({
      congestionPercent: c.congestionPercent,
      emissions: c.dailyEmissionsTons,
      name: `Corridor ${traffic.corridors?.indexOf(c) + 1}`,
    })) || [];

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent mb-2">
          Correlation Insights
        </h2>
        <p className="text-foreground/80 font-medium text-lg">
          Discover relationships between environmental factors and traffic patterns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* -------------------------------------------------
            1️⃣ SCATTER: PM2.5 vs PM10
        -------------------------------------------------- */}
        <Card className="p-6 bg-background/90 backdrop-blur-md border-2 border-foreground/20 transition-all duration-300 hover:shadow-2xl hover:border-primary/30">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              PM2.5 vs PM10 Correlation
            </h3>
            <p className="text-foreground/70 font-medium">
              Relationship between fine and coarse particulate matter
            </p>
          </div>

          {pmScatter.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--foreground)/0.12)" 
                  strokeWidth={0.5}
                />

                <XAxis
                  type="number"
                  dataKey="pm25"
                  name="PM2.5"
                  stroke="hsl(var(--foreground)/0.8)"
                  tick={{ 
                    fill: "hsl(var(--foreground)/0.9)", 
                    fontSize: 12,
                    fontWeight: 600 
                  }}
                  axisLine={{ stroke: "hsl(var(--foreground)/0.3)", strokeWidth: 1 }}
                  tickLine={{ stroke: "hsl(var(--foreground)/0.3)" }}
                  label={{
                    value: "PM2.5 (µg/m³)",
                    position: "insideBottom",
                    offset: -10,
                    fill: "hsl(var(--foreground)/0.9)",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                />

                <YAxis
                  type="number"
                  dataKey="pm10"
                  name="PM10"
                  stroke="hsl(var(--foreground)/0.8)"
                  tick={{ 
                    fill: "hsl(var(--foreground)/0.9)", 
                    fontSize: 12,
                    fontWeight: 600 
                  }}
                  axisLine={{ stroke: "hsl(var(--foreground)/0.3)", strokeWidth: 1 }}
                  tickLine={{ stroke: "hsl(var(--foreground)/0.3)" }}
                  label={{
                    value: "PM10 (µg/m³)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    fill: "hsl(var(--foreground)/0.9)",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                />

                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background/95 backdrop-blur-sm border-2 border-primary/30 rounded-xl p-4 shadow-2xl">
                          <p className="font-bold text-foreground text-lg mb-3">Pollutant Correlation</p>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-foreground/80 font-semibold">PM2.5:</span>
                              <span className="text-foreground font-bold">{data.pm25} µg/m³</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-foreground/80 font-semibold">PM10:</span>
                              <span className="text-foreground font-bold">{data.pm10} µg/m³</span>
                            </div>
                            {data.date && (
                              <div className="flex justify-between items-center pt-2 border-t border-foreground/10">
                                <span className="text-foreground/60 text-sm">Date:</span>
                                <span className="text-foreground/80 text-sm font-medium">{data.date.split('T')[0]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ strokeDasharray: "3 3", stroke: "hsl(var(--foreground)/0.15)", strokeWidth: 1 }}
                />
                
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '10px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'hsl(var(--foreground)/0.9)'
                  }}
                />

                <Scatter
                  name="PM Data Points"
                  data={pmScatter}
                  fill="hsl(142, 76%, 36%)"
                >
                  {pmScatter.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="hsl(142, 76%, 36%)"
                      stroke="hsl(142, 76%, 26%)"
                      strokeWidth={1}
                      opacity={0.8}
                      r={6}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80 text-center">
              <div className="max-w-sm">
                <div className="w-20 h-20 bg-foreground/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌫️</span>
                </div>
                <p className="text-foreground/70 font-medium text-lg mb-2">
                  Insufficient Particulate Data
                </p>
                <p className="text-foreground/60 text-sm">
                  PM2.5 and PM10 measurements are required to display correlation analysis.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* -------------------------------------------------
            2️⃣ SCATTER: Congestion vs Emissions
        -------------------------------------------------- */}
        <Card className="p-6 bg-background/90 backdrop-blur-md border-2 border-foreground/20 transition-all duration-300 hover:shadow-2xl hover:border-amber-500/30">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Congestion vs Emissions
            </h3>
            <p className="text-foreground/70 font-medium">
              Impact of traffic congestion on daily emissions
            </p>
          </div>

          {congestionScatter.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--foreground)/0.12)" 
                  strokeWidth={0.5}
                />

                <XAxis
                  type="number"
                  dataKey="congestionPercent"
                  name="Congestion"
                  stroke="hsl(var(--foreground)/0.8)"
                  tick={{ 
                    fill: "hsl(var(--foreground)/0.9)", 
                    fontSize: 12,
                    fontWeight: 600 
                  }}
                  axisLine={{ stroke: "hsl(var(--foreground)/0.3)", strokeWidth: 1 }}
                  tickLine={{ stroke: "hsl(var(--foreground)/0.3)" }}
                  label={{
                    value: "Congestion (%)",
                    position: "insideBottom",
                    offset: -10,
                    fill: "hsl(var(--foreground)/0.9)",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                />

                <YAxis
                  type="number"
                  dataKey="emissions"
                  name="Emissions"
                  stroke="hsl(var(--foreground)/0.8)"
                  tick={{ 
                    fill: "hsl(var(--foreground)/0.9)", 
                    fontSize: 12,
                    fontWeight: 600 
                  }}
                  axisLine={{ stroke: "hsl(var(--foreground)/0.3)", strokeWidth: 1 }}
                  tickLine={{ stroke: "hsl(var(--foreground)/0.3)" }}
                  label={{
                    value: "Emissions (tons/day)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    fill: "hsl(var(--foreground)/0.9)",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                />

                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background/95 backdrop-blur-sm border-2 border-amber-500/30 rounded-xl p-4 shadow-2xl">
                          <p className="font-bold text-foreground text-lg mb-3">{data.name}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-foreground/80 font-semibold">Congestion:</span>
                              <span className="text-foreground font-bold">{data.congestionPercent}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-foreground/80 font-semibold">Emissions:</span>
                              <span className="text-foreground font-bold">{data.emissions} tons/day</span>
                            </div>
                            <div className="pt-2 border-t border-foreground/10">
                              <p className="text-foreground/60 text-sm font-medium">
                                Higher congestion typically leads to increased emissions
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ strokeDasharray: "3 3", stroke: "hsl(var(--foreground)/0.15)", strokeWidth: 1 }}
                />
                
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '10px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'hsl(var(--foreground)/0.9)'
                  }}
                />

                <Scatter
                  name="Traffic Corridors"
                  data={congestionScatter}
                  fill="hsl(38, 92%, 50%)"
                >
                  {congestionScatter.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="hsl(38, 92%, 50%)"
                      stroke="hsl(38, 92%, 40%)"
                      strokeWidth={1}
                      opacity={0.8}
                      r={6}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80 text-center">
              <div className="max-w-sm">
                <div className="w-20 h-20 bg-foreground/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚦</span>
                </div>
                <p className="text-foreground/70 font-medium text-lg mb-2">
                  Traffic Data Required
                </p>
                <p className="text-foreground/60 text-sm">
                  Congestion and emissions data from traffic corridors needed for analysis.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* -------------------------------------------------
          3️⃣ Correlation Summary
      -------------------------------------------------- */}
      <Card className="p-8 bg-background/90 backdrop-blur-md border-2 border-foreground/20 transition-all duration-300 hover:shadow-2xl">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Statistical Correlation Summary
          </h3>
          <p className="text-foreground/70 font-medium text-lg">
            Pearson correlation coefficients between key environmental metrics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(correlations).map(([key, value], index) => {
            const { strength, color, bgColor, borderColor } = getCorrelationStrength(value);
            const direction = value > 0 ? "Positive" : value < 0 ? "Negative" : "Neutral";
            const directionColor = value > 0 ? "text-emerald-600" : value < 0 ? "text-rose-600" : "text-foreground/60";
            
            return (
              <div
                key={index}
                className={`p-5 rounded-2xl border-2 ${borderColor} ${bgColor} transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-foreground font-bold text-lg leading-tight">
                    {formatPairName(key)}
                  </span>
                  <div className={`text-2xl font-black ${color} group-hover:scale-110 transition-transform`}>
                    {value > 0 ? "+" : ""}
                    {value.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/80 font-semibold text-sm">Strength:</span>
                    <span className={`font-bold ${color} text-sm`}>{strength}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/80 font-semibold text-sm">Direction:</span>
                    <span className={`font-bold ${directionColor} text-sm`}>{direction}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-foreground/10">
                  <span className="text-xs text-foreground/60 font-medium uppercase tracking-wide">
                    Correlation Coefficient
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Future Enhancements Notice */}
      <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <span className="text-lg">🚀</span>
          </div>
          <div>
            <p className="text-foreground font-semibold text-sm">
              Advanced Correlation Analysis Coming Soon
            </p>
            <p className="text-foreground/70 text-sm">
              Noise ↔ Traffic and Fuel Waste ↔ Congestion correlations will be available with additional data streams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrelationInsights;