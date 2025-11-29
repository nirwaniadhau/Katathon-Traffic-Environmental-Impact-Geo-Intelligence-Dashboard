// import { Cloud, Droplet, Users, Leaf } from "lucide-react";
// import { Card } from "@/components/ui/card";

// interface OverviewProps {
//   overview: {
//     totalCO2Tons: number;
//     fuelWastedLiters: number;
//     affectedPopulation: number;
//     ecoScore: number;
//   };
// }

// const SummaryMetrics = ({ overview }: OverviewProps) => {
//   if (!overview) return null;

//   const metrics = [
//     {
//       icon: Cloud,
//       label: "Total CO₂ Emissions",
//       value: overview.totalCO2Tons,
//       unit: "tons",
//       trend: "+12%", // optional – keep static OR calculate later
//       color: "text-danger",
//     },
//     {
//       icon: Droplet,
//       label: "Fuel Wasted",
//       value: overview.fuelWastedLiters,
//       unit: "liters",
//       trend: "+8%",
//       color: "text-warning",
//     },
//     {
//       icon: Users,
//       label: "Affected Population",
//       value: (overview.affectedPopulation / 1_000_000).toFixed(1) + "M",
//       unit: "citizens",
//       trend: "+5%",
//       color: "text-chart-2",
//     },
//     {
//       icon: Leaf,
//       label: "Eco-Score",
//       value: overview.ecoScore,
//       unit: "/100",
//       trend: "-3%",
//       color: "text-primary",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//       {metrics.map((metric, index) => (
//         <Card
//           key={index}
//           className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 relative overflow-hidden group"
//         >
//           <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//           <div className="relative">
//             <div className="flex items-start justify-between mb-4">
//               <metric.icon className={`h-8 w-8 ${metric.color}`} />
//               <span
//                 className={`text-sm font-semibold ${
//                   metric.trend.startsWith("+")
//                     ? "text-danger"
//                     : "text-primary"
//                 }`}
//               >
//                 {metric.trend}
//               </span>
//             </div>
//             <p className="text-muted-foreground text-sm mb-2">{metric.label}</p>
//             <div className="flex items-baseline gap-2">
//               <span className="text-3xl font-bold text-foreground">
//                 {metric.value}
//               </span>
//               <span className="text-muted-foreground text-sm">
//                 {metric.unit}
//               </span>
//             </div>
//           </div>
//         </Card>
//       ))}
//     </div>
//   );
// };

// export default SummaryMetrics;



import { Cloud, Fuel, Users, Leaf } from "lucide-react";
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
      label: "Total CO₂ Emissions (Daily Estimate)",
      value: `${overview.totalCO2Tons} tons`,
      color: "text-danger",
      description: "Estimated daily CO₂ footprint of the city",
    },
    {
      icon: Fuel,
      label: "Fuel Wasted (Due to Congestion)",
      value: `${formatNumber(overview.fuelWastedLiters)} L`,
      color: "text-warning",
      description: "Liters wasted across major traffic corridors",
    },
    {
      icon: Users,
      label: "Affected Population",
      value:
        overview.affectedPopulation >= 1_000_000
          ? `${(overview.affectedPopulation / 1_000_000).toFixed(1)}M`
          : formatNumber(overview.affectedPopulation),
      color: "text-chart-2",
      description: "People potentially exposed to elevated pollution levels",
    },
    {
      icon: Leaf,
      label: "Eco-Score",
      value: `${overview.ecoScore}/100`,
      color: "text-primary",
      description: "Environmental performance indicator",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((m, i) => (
        <Card
          key={i}
          className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <m.icon className={`h-8 w-8 ${m.color}`} />
          </div>

          <p className="text-sm text-muted-foreground mb-1">{m.label}</p>

          <div className="text-3xl font-bold text-foreground mb-1">
            {m.value}
          </div>

          <p className="text-xs text-muted-foreground">{m.description}</p>
        </Card>
      ))}
    </div>
  );
};

export default SummaryMetrics;
