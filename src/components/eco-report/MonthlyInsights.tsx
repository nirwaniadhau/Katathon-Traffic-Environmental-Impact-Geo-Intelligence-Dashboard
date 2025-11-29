import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
} from "lucide-react";

interface MonthlyProps {
  monthly: {
    avgPm25: number | null;
    maxPm25: number | null;
    maxPm25Date: string | null;
    dataPoints: number;
  };
}

// Helper: classify PM2.5 into Indian AQI category
const classifyPm25 = (value: number | null) => {
  if (value === null) return { label: "No Data", type: "neutral", color: "text-foreground/60" };

  if (value <= 30) return { label: "Good", type: "positive", color: "text-emerald-600 dark:text-emerald-400" };
  if (value <= 60) return { label: "Satisfactory", type: "positive", color: "text-green-600 dark:text-green-400" };
  if (value <= 90) return { label: "Moderate", type: "warning", color: "text-amber-600 dark:text-amber-400" };
  if (value <= 120) return { label: "Poor", type: "negative", color: "text-orange-600 dark:text-orange-400" };
  if (value <= 250) return { label: "Very Poor", type: "negative", color: "text-red-600 dark:text-red-400" };
  return { label: "Severe", type: "negative", color: "text-rose-700 dark:text-rose-300" };
};

const MonthlyInsights = ({ monthly }: MonthlyProps) => {
  if (!monthly) return null;

  const insights = [];

  // No data
  if (monthly.dataPoints === 0) {
    insights.push({
      icon: AlertTriangle,
      text: "No sufficient historical PM2.5 data available for this period.",
      type: "warning",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400"
    });
  } else {
    // 1️⃣ Average PM2.5 analysis
    const avgClass = classifyPm25(monthly.avgPm25);
    insights.push({
      icon: BarChart3,
      text: `Average PM2.5 level was ${monthly.avgPm25} µg/m³ — classified as "${avgClass.label}".`,
      type: avgClass.type,
      bgColor: avgClass.type === "positive" ? "bg-emerald-500/10" : 
               avgClass.type === "warning" ? "bg-amber-500/10" : "bg-red-500/10",
      borderColor: avgClass.type === "positive" ? "border-emerald-500/20" : 
                   avgClass.type === "warning" ? "border-amber-500/20" : "border-red-500/20",
      iconColor: avgClass.color
    });

    // 2️⃣ Worst day (Peak Pollution Alert)
    if (monthly.maxPm25 && monthly.maxPm25Date) {
      const maxClass = classifyPm25(monthly.maxPm25);
      insights.push({
        icon: Calendar,
        text: `Peak pollution recorded on ${monthly.maxPm25Date} (PM2.5: ${monthly.maxPm25} µg/m³ — ${maxClass.label}).`,
        type: "negative",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
        iconColor: maxClass.color
      });
    }

    // 3️⃣ Overall air quality pattern
    if (monthly.avgPm25! > 120) {
      insights.push({
        icon: TrendingUp,
        text: "Air quality remained poor for most days, indicating heavy particulate buildup likely from traffic and seasonal conditions.",
        type: "negative",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
        iconColor: "text-red-600 dark:text-red-400"
      });
    } else if (monthly.avgPm25! > 60) {
      insights.push({
        icon: TrendingUp,
        text: "Air quality fluctuated between moderate and poor levels during the period, suggesting variable pollution sources.",
        type: "warning",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        iconColor: "text-amber-600 dark:text-amber-400"
      });
    } else {
      insights.push({
        icon: CheckCircle,
        text: "Air quality stayed generally within healthy to satisfactory limits throughout the period.",
        type: "positive",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        iconColor: "text-emerald-600 dark:text-emerald-400"
      });
    }

    // 4️⃣ Data reliability
    insights.push({
      icon: CheckCircle,
      text: `Analysis based on ${monthly.dataPoints} data points, ensuring statistical reliability.`,
      type: "positive",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400"
    });
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent mb-2">
          Monthly Air Quality Insights
        </h2>
        <p className="text-foreground/80 font-medium text-lg">
          Comprehensive analysis of PM2.5 trends and pollution patterns
        </p>
      </div>

      <Card className="p-6 bg-background/80 backdrop-blur-sm border-2 border-foreground/20 transition-all duration-300 hover:shadow-xl">
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 p-5 rounded-xl border-2 ${insight.borderColor} ${insight.bgColor} transition-all duration-300 hover:scale-[1.02] hover:shadow-md group`}
            >
              <div className={`p-2 rounded-lg bg-background/80 ${insight.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                <insight.icon
                  className={`h-5 w-5 ${insight.iconColor}`}
                />
              </div>
              <p className="text-foreground leading-relaxed font-medium flex-1">
                {insight.text}
              </p>
            </div>
          ))}
        </div>

        {/* PM2.5 Classification Legend */}
        <div className="mt-6 pt-6 border-t border-foreground/10">
          <h4 className="text-foreground font-bold mb-3 text-sm uppercase tracking-wide">
            PM2.5 Classification Scale (µg/m³)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-foreground/80 font-medium">0-30: Good</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-foreground/80 font-medium">31-60: Satisfactory</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-foreground/80 font-medium">61-90: Moderate</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-foreground/80 font-medium">91-120: Poor</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-foreground/80 font-medium">121-250: Very Poor</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <span className="text-foreground/80 font-medium">250+: Severe</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyInsights;