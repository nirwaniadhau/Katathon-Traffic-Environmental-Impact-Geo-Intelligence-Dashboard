import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Car, Clock, Cloud } from "lucide-react";

interface Corridor {
  id: number;
  name: string;
  congestionPercent: number;
  dailyEmissionsTons: number;
  aqi: number;
  issue: string;
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return "text-emerald-600 dark:text-emerald-400";
  if (aqi <= 100) return "text-green-600 dark:text-green-400";
  if (aqi <= 150) return "text-amber-600 dark:text-amber-400";
  if (aqi <= 200) return "text-orange-600 dark:text-orange-400";
  if (aqi <= 300) return "text-red-600 dark:text-red-400";
  return "text-rose-700 dark:text-rose-300";
};

const getAQIBgColor = (aqi: number) => {
  if (aqi <= 50) return "bg-emerald-500/15 border-emerald-500/30";
  if (aqi <= 100) return "bg-green-500/15 border-green-500/30";
  if (aqi <= 150) return "bg-amber-500/15 border-amber-500/30";
  if (aqi <= 200) return "bg-orange-500/15 border-orange-500/30";
  if (aqi <= 300) return "bg-red-500/15 border-red-500/30";
  return "bg-rose-500/15 border-rose-500/30";
};

const getCongestionColor = (percent: number) => {
  if (percent <= 30) return "bg-emerald-500";
  if (percent <= 60) return "bg-amber-500";
  if (percent <= 80) return "bg-orange-500";
  return "bg-red-500";
};

const TopPollutedCorridors = ({ corridors }: { corridors: Corridor[] }) => {
  if (!corridors || corridors.length === 0) {
    return (
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent mb-2">
            Critical Pollution Corridors
          </h2>
          <p className="text-foreground/80 font-medium">
            High-impact traffic zones requiring immediate attention
          </p>
        </div>
        <Card className="p-8 bg-background/80 backdrop-blur-sm border-2 border-foreground/20 text-center">
          <div className="w-16 h-16 bg-foreground/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-foreground/60" />
          </div>
          <p className="text-foreground/70 font-medium text-lg mb-2">
            No Corridor Data Available
          </p>
          <p className="text-foreground/60 text-sm">
            Traffic corridor analysis requires congestion and emissions data from monitoring systems.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent mb-2">
          Critical Pollution Corridors
        </h2>
        <p className="text-foreground/80 font-medium text-lg">
          High-impact traffic zones requiring immediate attention and intervention
        </p>
      </div>

      <Card className="p-6 bg-background/80 backdrop-blur-sm border-2 border-foreground/20 transition-all duration-300 hover:shadow-xl">
        <div className="space-y-4">
          {corridors.map((corridor, index) => (
            <div
              key={corridor.id}
              className="flex flex-col lg:flex-row lg:items-center gap-4 p-5 rounded-xl bg-background/60 border border-foreground/10 transition-all duration-300 hover:border-foreground/20 hover:bg-background/70 hover:shadow-md group"
            >
              {/* Rank + Name + Details */}
              <div className="flex items-start gap-4 flex-1">
                {/* Rank Badge */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                    {index + 1}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getCongestionColor(corridor.congestionPercent ?? 0)}`} />
                </div>

                {/* Corridor Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-4 w-4 text-foreground/70" />
                    <p className="font-bold text-foreground text-lg">
                      {corridor.name}
                    </p>
                  </div>

                  <p className="text-sm text-foreground/70 font-medium mb-3 leading-relaxed">
                    {corridor.issue}
                  </p>

                  {/* Congestion Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-foreground/60" />
                        <span className="text-xs font-semibold text-foreground/80">
                          Traffic Congestion
                        </span>
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        {corridor.congestionPercent ?? 0}%
                      </span>
                    </div>
                    <Progress
                      value={corridor.congestionPercent ?? 0}
                      className="h-2 bg-foreground/10"
                    />
                  </div>
                </div>
              </div>

              {/* Metrics Sidebar */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-3 lg:w-48">
                {/* Emissions */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Cloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-xs font-semibold text-foreground/70">Emissions</p>
                    <p className="text-sm font-bold text-foreground">
                      {(corridor.dailyEmissionsTons ?? 0).toFixed(1)} tons
                    </p>
                  </div>
                </div>

                {/* AQI */}
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${getAQIBgColor(corridor.aqi ?? 0)}`}>
                  <AlertTriangle className={`h-4 w-4 ${getAQIColor(corridor.aqi ?? 0)}`} />
                  <div>
                    <p className="text-xs font-semibold text-foreground/70">Air Quality</p>
                    <p className={`text-lg font-black ${getAQIColor(corridor.aqi ?? 0)}`}>
                      {corridor.aqi ?? "--"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-6 border-t border-foreground/10">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-foreground/70 font-medium">Critical (80%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm text-foreground/70 font-medium">High (60-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-sm text-foreground/70 font-medium">Moderate (30-60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-foreground/70 font-medium">Low (0-30%)</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TopPollutedCorridors;