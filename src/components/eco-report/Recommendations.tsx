// import { Card } from "@/components/ui/card";
// import { Users, TrafficCone, Wind, Building } from "lucide-react";

// const recommendations = [
//   {
//     icon: Users,
//     title: "Citizen Awareness",
//     description:
//       "Launch public campaigns about carpooling and public transport usage during peak hours.",
//     color: "text-chart-2",
//   },
//   {
//     icon: TrafficCone,
//     title: "Traffic Management",
//     description:
//       "Implement dynamic signal timing and congestion-based toll pricing at high-traffic corridors.",
//     color: "text-primary",
//   },
//   {
//     icon: Wind,
//     title: "Pollution Control",
//     description:
//       "Deploy air purification towers near major junctions and enforce stricter emission standards.",
//     color: "text-warning",
//   },
//   {
//     icon: Building,
//     title: "Urban Planning",
//     description:
//       "Develop green belts around highways and expand metro connectivity to reduce vehicle dependency.",
//     color: "text-chart-3",
//   },
// ];

// const Recommendations = () => {
//   return (
//     <div className="mb-6">
//       <h2 className="text-2xl font-bold text-foreground mb-4">
//         Recommendations
//       </h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {recommendations.map((rec, index) => (
//           <Card
//             key={index}
//             className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 group"
//           >
//             <div className="flex items-start gap-4">
//               <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
//                 <rec.icon className={`h-6 w-6 ${rec.color}`} />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-foreground mb-2">
//                   {rec.title}
//                 </h3>
//                 <p className="text-muted-foreground text-sm">
//                   {rec.description}
//                 </p>
//               </div>
//             </div>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Recommendations;


import { Card } from "@/components/ui/card";
import { Users, TrafficCone, Wind, Building } from "lucide-react";

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
  citizenAwareness: "text-chart-2",
  trafficManagement: "text-primary",
  pollutionControl: "text-warning",
  urbanPlanning: "text-chart-3",
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
      title: titleMap[category],
    }));

  if (recList.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Recommendations
        </h2>
        <p className="text-muted-foreground">No recommendations available.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Recommendations
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recList.map((rec, index) => (
          <Card
            key={index}
            className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <rec.icon className={`h-6 w-6 ${rec.color}`} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {rec.title}
                </h3>

                {/* Bullet points */}
                <ul className="text-muted-foreground text-sm space-y-1">
                  {rec.items.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
