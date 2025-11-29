import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

interface TrendPoint {
  date: string;
  aqi: number | null;
}

interface AQITrendChartProps {
  trend?: {
    label?: string;
    points?: TrendPoint[];
  };
}

const AQITrendChart = ({ trend }: AQITrendChartProps) => {
  // -------- Clean data --------
  const cleanedData =
    trend?.points
      ?.filter((p) => p.aqi !== null)
      ?.map((p) => ({
        ...p,
        date: p.date.split("T")[0], // clean date
      })) || [];

  const hasData = cleanedData.length > 0;

  return (
    <Card className="p-6 bg-background/80 backdrop-blur-sm border-2 border-foreground/20 transition-all duration-300 hover:shadow-xl">
      <div className="mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent mb-2">
          {trend?.label || "Air Quality Trend"}
        </h3>
        <p className="text-foreground/80 font-medium">
          Historical AQI patterns and pollution levels over time
        </p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-64 text-center">
          <div>
            <div className="w-16 h-16 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-foreground/70 font-medium">
              No historical AQI data available for this period.
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={cleanedData}>
            {/* AQI bands with theme-aware colors */}
            <ReferenceArea y1={0} y2={50} fill="rgba(34, 197, 94, 0.15)" /> {/* Good */}
            <ReferenceArea y1={51} y2={100} fill="rgba(234, 179, 8, 0.15)" /> {/* Moderate */}
            <ReferenceArea y1={101} y2={150} fill="rgba(249, 115, 22, 0.15)" /> {/* Unhealthy for Sensitive */}
            <ReferenceArea y1={151} y2={200} fill="rgba(239, 68, 68, 0.15)" /> {/* Unhealthy */}
            <ReferenceArea y1={201} y2={300} fill="rgba(185, 28, 28, 0.15)" /> {/* Very Unhealthy */}
            <ReferenceArea y1={301} y2={500} fill="rgba(127, 29, 29, 0.15)" /> {/* Hazardous */}

            <defs>
              <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--foreground)/0.15)" 
              vertical={false}
            />

            <XAxis
              dataKey="date"
              stroke="hsl(var(--foreground)/0.7)"
              tick={{ 
                fill: "hsl(var(--foreground)/0.8)", 
                fontSize: 11,
                fontWeight: 500 
              }}
              axisLine={{ stroke: "hsl(var(--foreground)/0.3)" }}
              tickLine={{ stroke: "hsl(var(--foreground)/0.3)" }}
            />

            <YAxis
              stroke="hsl(var(--foreground)/0.7)"
              tick={{ 
                fill: "hsl(var(--foreground)/0.8)", 
                fontSize: 11,
                fontWeight: 500 
              }}
              axisLine={{ stroke: "hsl(var(--foreground)/0.3)" }}
              tickLine={{ stroke: "hsl(var(--foreground)/0.3)" }}
              domain={[0, 500]} // AQI scale
              tickCount={6}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value as number;
                  let status = "";
                  let color = "";
                  
                  if (value <= 50) { status = "Good"; color = "#22c55e"; }
                  else if (value <= 100) { status = "Moderate"; color = "#eab308"; }
                  else if (value <= 150) { status = "Unhealthy for Sensitive"; color = "#f97316"; }
                  else if (value <= 200) { status = "Unhealthy"; color = "#ef4444"; }
                  else if (value <= 300) { status = "Very Unhealthy"; color = "#b91c1c"; }
                  else { status = "Hazardous"; color = "#7f1d1d"; }

                  return (
                    <div className="bg-background/95 backdrop-blur-sm border-2 border-foreground/20 rounded-lg p-3 shadow-xl">
                      <p className="font-bold text-foreground mb-1">Date: {label}</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-foreground font-semibold">AQI: {value}</p>
                      </div>
                      <p className="text-sm text-foreground/80 mt-1 font-medium">{status}</p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAqi)"
              dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 2, r: 4 }}
              activeDot={{ 
                r: 6, 
                fill: "hsl(142, 76%, 36%)", 
                stroke: "hsl(var(--background))", 
                strokeWidth: 2 
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* AQI Scale Legend */}
      {hasData && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-foreground/80 font-medium">0-50 Good</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-foreground/80 font-medium">51-100 Moderate</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/20">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-foreground/80 font-medium">101-150 USG</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-foreground/80 font-medium">151-200 Unhealthy</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-700/10 border border-red-700/20">
            <div className="w-2 h-2 rounded-full bg-red-700"></div>
            <span className="text-foreground/80 font-medium">201-300 V. Unhealthy</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AQITrendChart;