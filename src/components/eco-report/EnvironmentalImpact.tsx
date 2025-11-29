import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { AlertTriangle, TrendingUp, Target } from "lucide-react";

interface BreakdownProps {
  breakdown: {
    vehicles: number;
    industry: number;
    construction: number;
    others: number;
  };
}

const colorMap: Record<string, string> = {
  vehicles: "hsl(142, 76%, 36%)", // Green
  industry: "hsl(217, 91%, 60%)", // Blue
  construction: "hsl(38, 92%, 50%)", // Amber
  others: "hsl(340, 75%, 55%)", // Rose
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
      <Card className="p-6 bg-background/80 backdrop-blur-sm border-2 border-foreground/20 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center gap-3 text-foreground/70">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          <p className="font-medium">No environmental contribution data available for analysis.</p>
        </div>
      </Card>
    );
  }

  // Convert fractional values to percentages safely
  const chartData = Object.entries(breakdown).map(([key, value]) => ({
    name: labelMap[key],
    value: Math.round(((value ?? 0) * 100)),
    color: colorMap[key],
    rawValue: value ?? 0
  }));

  // Determine dominant source for summary
  const maxItem = chartData.reduce((a, b) => (a.value > b.value ? a : b));
  const totalContribution = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-6 bg-background/80 backdrop-blur-sm border-2 border-foreground/20 transition-all duration-300 hover:shadow-xl">
      <div className="mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent mb-2">
          Environmental Impact Breakdown
        </h3>
        <p className="text-foreground/80 font-medium">
          Pollution source distribution and contribution analysis
        </p>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${value}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={index} 
                  fill={entry.color}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background/95 backdrop-blur-sm border-2 border-foreground/20 rounded-xl p-4 shadow-2xl">
                      <p className="font-bold text-foreground text-lg mb-2">{data.name}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-foreground/80 font-semibold">Contribution:</span>
                          <span className="text-foreground font-bold">{data.value}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-foreground/80 font-semibold">Raw Value:</span>
                          <span className="text-foreground font-bold">{data.rawValue.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={60}
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ 
                color: "hsl(var(--foreground)/0.9)",
                fontSize: '12px',
                fontWeight: '600'
              }}
              formatter={(value) => (
                <span className="text-foreground/90 font-semibold text-sm">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="bg-background/80 backdrop-blur-sm rounded-full p-4 border-2 border-foreground/10">
            <p className="text-2xl font-bold text-foreground">{totalContribution}%</p>
            <p className="text-xs text-foreground/70 font-medium mt-1">Total</p>
          </div>
        </div>
      </div>

      {/* Insight summary */}
      <div className="mt-6 p-4 rounded-xl bg-foreground/5 border border-foreground/10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/15">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-foreground font-bold mb-2">Key Insight</p>
            <p className="text-foreground/80 leading-relaxed">
              <span className="font-semibold text-foreground">{maxItem.name}</span>{" "}
              dominates pollution sources at{" "}
              <span className="font-bold text-foreground">{maxItem.value}%</span>. 
              This indicates priority should be given to policies targeting{" "}
              <span className="font-semibold text-foreground lowercase">
                {maxItem.name}
              </span>{" "}
              emissions for maximum environmental impact.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {chartData.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-background/60 border border-foreground/10 hover:border-foreground/20 transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-foreground/80 font-medium text-sm">
                {item.name}
              </span>
            </div>
            <span className="text-foreground font-bold text-sm">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default EnvironmentalImpact;