import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
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
  if (value === null) return { label: "No Data", type: "neutral" };

  if (value <= 30) return { label: "Good", type: "positive" };
  if (value <= 60) return { label: "Satisfactory", type: "positive" };
  if (value <= 90) return { label: "Moderate", type: "warning" };
  if (value <= 120) return { label: "Poor", type: "negative" };
  if (value <= 250) return { label: "Very Poor", type: "negative" };
  return { label: "Severe", type: "negative" };
};

const MonthlyInsights = ({ monthly }: MonthlyProps) => {
  if (!monthly) return null;

  const insights = [];

  // No data
  if (monthly.dataPoints === 0) {
    insights.push({
      icon: AlertTriangle,
      text: "No sufficient historical PM2.5 data for this period.",
      type: "warning",
    });
  } else {
    // 1️⃣ Average PM2.5 analysis
    const avgClass = classifyPm25(monthly.avgPm25);

    insights.push({
      icon: TrendingUp,
      text: `Average fine particulate level (PM2.5) was ${monthly.avgPm25} µg/m³ — classified as "${avgClass.label}".`,
      type: avgClass.type,
    });

    // 2️⃣ Worst day (Peak Pollution Alert)
    if (monthly.maxPm25 && monthly.maxPm25Date) {
      const maxClass = classifyPm25(monthly.maxPm25);
      insights.push({
        icon: AlertTriangle,
        text: `Worst pollution recorded on ${monthly.maxPm25Date} (PM2.5: ${monthly.maxPm25} µg/m³ — ${maxClass.label}).`,
        type: "negative",
      });
    }

    // 3️⃣ Overall air quality pattern
    if (monthly.avgPm25! > 120) {
      insights.push({
        icon: TrendingUp,
        text: "Air quality remained poor for most days, indicating heavy particulate buildup likely from traffic + seasonal conditions.",
        type: "negative",
      });
    } else if (monthly.avgPm25! > 60) {
      insights.push({
        icon: TrendingUp,
        text: "Air quality fluctuated between moderate and poor levels during the period.",
        type: "warning",
      });
    } else {
      insights.push({
        icon: CheckCircle,
        text: "Air quality stayed generally within healthy to satisfactory limits.",
        type: "positive",
      });
    }
  }

  // Color mapping
  const getIconColor = (type: string) => {
    switch (type) {
      case "negative":
        return "text-danger";
      case "warning":
        return "text-warning";
      case "positive":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Monthly Air Quality Insights
      </h2>

      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <insight.icon
                className={`h-5 w-5 mt-1 ${getIconColor(insight.type)}`}
              />
              <p className="text-foreground leading-snug">{insight.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default MonthlyInsights;
