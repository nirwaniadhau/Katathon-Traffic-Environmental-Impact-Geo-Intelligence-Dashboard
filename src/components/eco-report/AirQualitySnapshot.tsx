import { Wind, Cloud, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PollutantsProps {
  pollutants: {
    pm25: number | null;
    pm10: number | null;
    no2: number | null;
  };
}

// Determine PM2.5 / PM10 / NO2 category
const getStatus = (label: string, value: number | null) => {
  if (value === null) return { status: "No Data", color: "text-foreground/60" };

  if (label === "PM2.5") {
    if (value <= 50) return { status: "Good", color: "text-emerald-600 dark:text-emerald-400" };
    if (value <= 100) return { status: "Moderate", color: "text-amber-600 dark:text-amber-400" };
    if (value <= 150) return { status: "Unhealthy (Sensitive)", color: "text-orange-600 dark:text-orange-400" };
    if (value <= 200) return { status: "Unhealthy", color: "text-red-600 dark:text-red-400" };
    return { status: "Very Unhealthy", color: "text-red-700 dark:text-red-300" };
  }

  if (label === "PM10") {
    if (value <= 50) return { status: "Good", color: "text-emerald-600 dark:text-emerald-400" };
    if (value <= 100) return { status: "Moderate", color: "text-amber-600 dark:text-amber-400" };
    if (value <= 250) return { status: "Unhealthy", color: "text-red-600 dark:text-red-400" };
    return { status: "Very Unhealthy", color: "text-red-700 dark:text-red-300" };
  }

  if (label === "NO₂") {
    if (value <= 40) return { status: "Good", color: "text-emerald-600 dark:text-emerald-400" };
    if (value <= 80) return { status: "Moderate", color: "text-amber-600 dark:text-amber-400" };
    return { status: "Unhealthy", color: "text-red-600 dark:text-red-400" };
  }

  return { status: "Unknown", color: "text-foreground/60" };
};

const AirQualitySnapshot = ({ pollutants }: PollutantsProps) => {
  if (!pollutants) return null;

  const data = [
    {
      icon: Wind,
      label: "PM2.5",
      value: pollutants.pm25,
      unit: "μg/m³",
    },
    {
      icon: Cloud,
      label: "PM10",
      value: pollutants.pm10,
      unit: "μg/m³",
    },
    {
      icon: Flame,
      label: "NO₂",
      value: pollutants.no2,
      unit: "μg/m³",
    },
  ];

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent mb-2">
          Air Quality Snapshot
        </h2>
        <p className="text-foreground/80 font-medium">
          Real-time pollutant levels and health impact assessment
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((item, idx) => {
          const { status, color } = getStatus(item.label, item.value);

          return (
            <Card
              key={idx}
              className="p-6 bg-background/80 backdrop-blur-sm border-2 border-foreground/20 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:scale-[1.02] group"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="p-3 rounded-xl bg-primary/15 group-hover:bg-primary/20 transition-all duration-300">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground/80 mb-1">
                    {item.label}
                  </p>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">
                      {item.value !== null ? item.value : "--"}
                    </span>
                    <span className="text-sm font-medium text-foreground/70">
                      {item.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-foreground/10">
                <span className={`text-sm font-bold ${color} transition-colors duration-200`}>
                  {status}
                </span>
                <div className={`w-3 h-3 rounded-full ${color.replace('text', 'bg')} opacity-80`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-foreground/80 font-medium">Good</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-foreground/80 font-medium">Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-foreground/80 font-medium">Unhealthy (Sensitive)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-foreground/80 font-medium">Unhealthy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-700"></div>
          <span className="text-foreground/80 font-medium">Very Unhealthy</span>
        </div>
      </div>
    </div>
  );
};

export default AirQualitySnapshot;