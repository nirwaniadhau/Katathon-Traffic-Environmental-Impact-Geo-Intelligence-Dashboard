import { Card } from "@/components/ui/card";
import { Users, TrafficCone, Wind, Building, Lightbulb, Target } from "lucide-react";

interface RecommendationsProps {
  recommendations: {
    citizenAwareness?: string[];
    trafficManagement?: string[];
    pollutionControl?: string[];
    urbanPlanning?: string[];
  };
}

const iconMap: Record<string, any> = {
  citizenAwareness: Users,
  trafficManagement: TrafficCone,
  pollutionControl: Wind,
  urbanPlanning: Building,
};

const colorMap: Record<string, string> = {
  citizenAwareness: "text-blue-600 dark:text-blue-400",
  trafficManagement: "text-emerald-600 dark:text-emerald-400",
  pollutionControl: "text-amber-600 dark:text-amber-400",
  urbanPlanning: "text-purple-600 dark:text-purple-400",
};

const bgColorMap: Record<string, string> = {
  citizenAwareness: "bg-blue-500/15",
  trafficManagement: "bg-emerald-500/15",
  pollutionControl: "bg-amber-500/15",
  urbanPlanning: "bg-purple-500/15",
};

const borderColorMap: Record<string, string> = {
  citizenAwareness: "border-blue-500/20",
  trafficManagement: "border-emerald-500/20",
  pollutionControl: "border-amber-500/20",
  urbanPlanning: "border-purple-500/20",
};

const titleMap: Record<string, string> = {
  citizenAwareness: "Citizen Awareness",
  trafficManagement: "Traffic Management",
  pollutionControl: "Pollution Control",
  urbanPlanning: "Urban Planning",
};

const Recommendations = ({ recommendations }: RecommendationsProps) => {
  if (!recommendations) return null;

  // Convert only NON-EMPTY categories into UI cards
  const recList = Object.entries(recommendations)
    .filter(([, items]) => items && items.length > 0)
    .map(([category, items]) => ({
      category,
      items: items!,
      icon: iconMap[category],
      color: colorMap[category],
      bgColor: bgColorMap[category],
      borderColor: borderColorMap[category],
      title: titleMap[category],
    }));

  if (recList.length === 0) {
    return (
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent mb-2">
            Strategic Recommendations
          </h2>
          <p className="text-foreground/80 font-medium">
            Actionable insights for environmental improvement
          </p>
        </div>
        <Card className="p-8 bg-background/80 backdrop-blur-sm border-2 border-foreground/20 text-center">
          <div className="w-16 h-16 bg-foreground/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="h-8 w-8 text-foreground/60" />
          </div>
          <p className="text-foreground/70 font-medium text-lg">
            No specific recommendations available at this time.
          </p>
          <p className="text-foreground/60 text-sm mt-2">
            Recommendations will appear based on current environmental data analysis.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent mb-2">
          Strategic Recommendations
        </h2>
        <p className="text-foreground/80 font-medium text-lg">
          Actionable insights for environmental improvement and sustainable urban development
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recList.map((rec, index) => (
          <Card
            key={index}
            className={`p-6 bg-background/80 backdrop-blur-sm border-2 ${rec.borderColor} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${rec.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <rec.icon className={`h-6 w-6 ${rec.color}`} />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {rec.title}
                </h3>

                {/* Bullet points with enhanced styling */}
                <ul className="space-y-2">
                  {rec.items.map((item, i) => (
                    <li 
                      key={i} 
                      className="flex items-start gap-2 text-foreground/80 font-medium leading-relaxed"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${rec.color.replace('text', 'bg')}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action indicator */}
            <div className="mt-4 pt-4 border-t border-foreground/10 flex items-center justify-between">
              <span className="text-xs text-foreground/60 font-medium uppercase tracking-wide">
                Priority Action
              </span>
              <Target className={`h-4 w-4 ${rec.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Implementation Timeline */}
      <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <span className="text-lg">📅</span>
          </div>
          <div>
            <p className="text-foreground font-semibold text-sm">
              Implementation Timeline
            </p>
            <p className="text-foreground/70 text-sm">
              These recommendations are designed for phased implementation over the next 6-18 months.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;