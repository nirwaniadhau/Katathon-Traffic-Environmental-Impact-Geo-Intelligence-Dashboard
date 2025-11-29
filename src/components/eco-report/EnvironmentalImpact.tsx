import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { AlertTriangle } from "lucide-react";

interface BreakdownProps {
  breakdown: {
    vehicles: number;
    industry: number;
    construction: number;
    others: number;
  };
}

const colorMap: Record<string, string> = {
  vehicles: "hsl(152, 76%, 55%)",
  industry: "hsl(220, 70%, 60%)",
  construction: "hsl(38, 92%, 50%)",
  others: "hsl(340, 75%, 55%)",
};

const labelMap: Record<string, string> = {
  vehicles: "Vehicles",
  industry: "Industry",
  construction: "Construction",
  others: "Others",
};

const EnvironmentalImpact = ({ breakdown }: BreakdownProps) => {
  if (!breakdown || Object.keys(breakdown).length === 0) {
    return (
      <Card className="p-6 bg-card border-border text-muted-foreground flex gap-3 items-center">
        <AlertTriangle className="h-5 w-5 text-warning" />
        No environmental contribution data available.
      </Card>
    );
  }

  // Convert fractional values to percentages safely
  const chartData = Object.entries(breakdown).map(([key, value]) => ({
    name: labelMap[key],
    value: Math.round(((value ?? 0) * 100)),
    color: colorMap[key],
  }));

  // Determine dominant source for summary
  const maxItem = chartData.reduce((a, b) => (a.value > b.value ? a : b));

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-xl font-bold text-foreground mb-6">
        Environmental Impact Breakdown
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => `${value}%`}
            contentStyle={{
              backgroundColor: "hsl(220, 16%, 12%)",
              border: "1px solid hsl(220, 14%, 20%)",
              borderRadius: "0.5rem",
              color: "hsl(150, 5%, 95%)",
            }}
          />

          <Legend
            verticalAlign="bottom"
            height={40}
            iconType="circle"
            wrapperStyle={{ color: "hsl(150, 5%, 95%)" }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Insight summary */}
      <div className="mt-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          <span className="font-semibold text-foreground">{maxItem.name}</span>{" "}
          is the dominant pollution contributor at{" "}
          <span className="font-semibold">{maxItem.value}%</span>. This indicates
          that city planners should prioritize policies addressing{" "}
          <span className="font-semibold text-foreground lowercase">
            {maxItem.name}
          </span>{" "}
          emissions first.  
        </p>
      </div>
    </Card>
  );
};

export default EnvironmentalImpact;
