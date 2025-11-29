import { Cloud, Fuel, Users, Leaf, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OverviewProps {
  overview: {
    totalCO2Tons: number;
    fuelWastedLiters: number;
    affectedPopulation: number;
    ecoScore: number;
  };
}

// Format number with commas (e.g. 5200 → 5,200)
const formatNumber = (num: number) => {
  return num.toLocaleString("en-IN");
};

const SummaryMetrics = ({ overview }: OverviewProps) => {
  if (!overview) return null;

  const metrics = [
    {
      icon: Cloud,
      label: "Total CO₂ Emissions",
      value: `${overview.totalCO2Tons} tons`,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-500/15",
      borderColor: "border-rose-500/20",
      description: "Estimated daily CO₂ footprint",
      trend: "increasing",
      trendColor: "text-rose-600",
      trendIcon: TrendingUp
    },
    {
      icon: Fuel,
      label: "Fuel Wasted",
      value: `${formatNumber(overview.fuelWastedLiters)} L`,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/15",
      borderColor: "border-amber-500/20",
      description: "Due to traffic congestion",
      trend: "high",
      trendColor: "text-amber-600",
      trendIcon: TrendingUp
    },
    {
      icon: Users,
      label: "Affected Population",
      value:
        overview.affectedPopulation >= 1_000_000
          ? `${(overview.affectedPopulation / 1_000_000).toFixed(1)}M`
          : formatNumber(overview.affectedPopulation),
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/15",
      borderColor: "border-blue-500/20",
      description: "Exposed to elevated pollution",
      trend: "significant",
      trendColor: "text-blue-600",
      trendIcon: TrendingUp
    },
    {
      icon: Leaf,
      label: "Eco-Score",
      value: `${overview.ecoScore}/100`,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/15",
      borderColor: "border-emerald-500/20",
      description: "Environmental performance",
      trend: overview.ecoScore > 70 ? "good" : "needs improvement",
      trendColor: overview.ecoScore > 70 ? "text-emerald-600" : "text-amber-600",
      trendIcon: overview.ecoScore > 70 ? TrendingDown : TrendingUp
    },
  ];

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent mb-2">
          Environmental Overview
        </h2>
        <p className="text-foreground/80 font-medium text-lg">
          Key metrics and impact indicators for urban sustainability
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card
            key={index}
            className={`p-6 bg-background/80 backdrop-blur-sm border-2 ${metric.borderColor} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group`}
          >
            {/* Header with Icon and Trend */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${metric.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div className="flex items-center gap-1">
                <metric.trendIcon className={`h-4 w-4 ${metric.trendColor}`} />
                <span className={`text-xs font-semibold ${metric.trendColor} uppercase tracking-wide`}>
                  {metric.trend}
                </span>
              </div>
            </div>

            {/* Metric Value */}
            <div className="mb-2">
              <div className="text-2xl font-bold text-foreground mb-1">
                {metric.value}
              </div>
              <p className="text-sm font-semibold text-foreground/80 leading-tight">
                {metric.label}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-foreground/70 font-medium leading-relaxed">
              {metric.description}
            </p>

            {/* Progress Bar for Eco-Score */}
            {metric.label === "Eco-Score" && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-foreground/70 font-medium mb-1">
                  <span>Performance</span>
                  <span>{overview.ecoScore}%</span>
                </div>
                <div className="w-full bg-foreground/10 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      overview.ecoScore > 70 ? 'bg-emerald-500' : 
                      overview.ecoScore > 50 ? 'bg-amber-500' : 'bg-rose-500'
                    } transition-all duration-500`}
                    style={{ width: `${overview.ecoScore}%` }}
                  />
                </div>
              </div>
            )}

            {/* Impact Indicator for other metrics */}
            {metric.label !== "Eco-Score" && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-foreground/60 font-medium uppercase tracking-wide">
                  Daily Impact
                </span>
                <div className={`w-2 h-2 rounded-full ${metric.trendColor.replace('text', 'bg')}`} />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Summary Note */}
      <div className="mt-6 p-4 rounded-xl bg-foreground/5 border border-foreground/10">
        <p className="text-sm text-foreground/80 font-medium text-center">
          📊 These metrics provide a comprehensive view of environmental impact and help prioritize sustainability initiatives.
        </p>
      </div>
    </div>
  );
};

export default SummaryMetrics;