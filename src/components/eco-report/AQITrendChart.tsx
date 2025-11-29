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
    <Card className="p-6 bg-card border-border">
      <h3 className="text-xl font-bold text-foreground mb-6">
        {trend?.label || "Air Quality Trend"}
      </h3>

      {!hasData ? (
        <p className="text-muted-foreground">
          No historical AQI data available for this period.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cleanedData}>
            {/* AQI bands (professional visual touch) */}
            <ReferenceArea y1={0} y2={50} fill="rgba(0,150,0,0.1)" />
            <ReferenceArea y1={51} y2={100} fill="rgba(255,200,0,0.1)" />
            <ReferenceArea y1={101} y2={200} fill="rgba(255,100,0,0.12)" />
            <ReferenceArea y1={201} y2={300} fill="rgba(255,0,0,0.12)" />
            <ReferenceArea y1={301} y2={500} fill="rgba(150,0,0,0.12)" />

            <defs>
              <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(152, 76%, 55%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(152, 76%, 55%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />

            <XAxis
              dataKey="date"
              stroke="hsl(150, 5%, 65%)"
              tick={{ fill: "hsl(150, 5%, 65%)", fontSize: 12 }}
            />

            <YAxis
              stroke="hsl(150, 5%, 65%)"
              tick={{ fill: "hsl(150, 5%, 65%)", fontSize: 12 }}
              domain={[0, 500]} // AQI scale
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 16%, 12%)",
                border: "1px solid hsl(220, 14%, 20%)",
                borderRadius: "0.5rem",
                color: "hsl(150, 5%, 95%)",
              }}
              formatter={(value: any) => `AQI: ${value}`}
              labelFormatter={(value) => `Date: ${value}`}
            />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke="hsl(152, 76%, 55%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAqi)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default AQITrendChart;
