// import { Wind, Cloud, Flame } from "lucide-react";
// import { Card } from "@/components/ui/card";

// const airQualityData = [
//   {
//     icon: Wind,
//     label: "PM2.5",
//     value: "87",
//     unit: "μg/m³",
//     status: "Unhealthy",
//     statusColor: "text-danger",
//   },
//   {
//     icon: Cloud,
//     label: "PM10",
//     value: "142",
//     unit: "μg/m³",
//     status: "Very Unhealthy",
//     statusColor: "text-danger",
//   },
//   {
//     icon: Flame,
//     label: "NO₂",
//     value: "68",
//     unit: "μg/m³",
//     status: "Moderate",
//     statusColor: "text-warning",
//   },
// ];

// const AirQualitySnapshot = () => {
//   return (
//     <div className="mb-6">
//       <h2 className="text-2xl font-bold text-foreground mb-4">
//         Air Quality Snapshot
//       </h2>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {airQualityData.map((item, index) => (
//           <Card
//             key={index}
//             className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300"
//           >
//             <div className="flex items-center gap-4 mb-4">
//               <div className="p-3 rounded-lg bg-primary/10">
//                 <item.icon className="h-6 w-6 text-primary" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">{item.label}</p>
//                 <div className="flex items-baseline gap-2">
//                   <span className="text-2xl font-bold text-foreground">
//                     {item.value}
//                   </span>
//                   <span className="text-sm text-muted-foreground">
//                     {item.unit}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className={`text-sm font-semibold ${item.statusColor}`}>
//                 {item.status}
//               </span>
//             </div>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AirQualitySnapshot;



// import { Wind, Cloud, Flame } from "lucide-react";
// import { Card } from "@/components/ui/card";

// interface PollutantsProps {
//   pollutants: {
//     pm25: number | null;
//     pm10: number | null;
//     no2: number | null;
//   };
// }

// // Helper to determine AQI category
// const getStatus = (label: string, value: number) => {
//   if (value == null) return { status: "No Data", color: "text-muted-foreground" };

//   if (label === "PM2.5") {
//     if (value <= 50) return { status: "Good", color: "text-chart-3" };
//     if (value <= 100) return { status: "Moderate", color: "text-warning" };
//     if (value <= 150) return { status: "Unhealthy (Sensitive)", color: "text-danger" };
//     if (value <= 200) return { status: "Unhealthy", color: "text-danger" };
//     return { status: "Very Unhealthy", color: "text-danger" };
//   }

//   if (label === "PM10") {
//     if (value <= 50) return { status: "Good", color: "text-chart-3" };
//     if (value <= 100) return { status: "Moderate", color: "text-warning" };
//     if (value <= 250) return { status: "Unhealthy", color: "text-danger" };
//     return { status: "Very Unhealthy", color: "text-danger" };
//   }

//   if (label === "NO₂") {
//     if (value <= 40) return { status: "Good", color: "text-chart-3" };
//     if (value <= 80) return { status: "Moderate", color: "text-warning" };
//     return { status: "Unhealthy", color: "text-danger" };
//   }

//   return { status: "Unknown", color: "text-muted-foreground" };
// };

// const AirQualitySnapshot = ({ pollutants }: PollutantsProps) => {
//   if (!pollutants) return null;

//   const data = [
//     {
//       icon: Wind,
//       label: "PM2.5",
//       value: pollutants.pm25,
//       unit: "μg/m³",
//     },
//     {
//       icon: Cloud,
//       label: "PM10",
//       value: pollutants.pm10,
//       unit: "μg/m³",
//     },
//     {
//       icon: Flame,
//       label: "NO₂",
//       value: pollutants.no2,
//       unit: "μg/m³",
//     },
//   ];

//   return (
//     <div className="mb-6">
//       <h2 className="text-2xl font-bold text-foreground mb-4">
//         Air Quality Snapshot
//       </h2>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {data.map((item, idx) => {
//           const { status, color } = getStatus(item.label, item.value ?? 0);

//           return (
//             <Card
//               key={idx}
//               className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300"
//             >
//               <div className="flex items-center gap-4 mb-4">
//                 <div className="p-3 rounded-lg bg-primary/10">
//                   <item.icon className="h-6 w-6 text-primary" />
//                 </div>

//                 <div>
//                   <p className="text-sm text-muted-foreground">{item.label}</p>
//                   <div className="flex items-baseline gap-2">
//                     <span className="text-2xl font-bold text-foreground">
//                       {item.value ?? "--"}
//                     </span>
//                     <span className="text-sm text-muted-foreground">
//                       {item.unit}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between">
//                 <span className={`text-sm font-semibold ${color}`}>
//                   {status}
//                 </span>
//               </div>
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default AirQualitySnapshot;




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
  if (value === null) return { status: "No Data", color: "text-muted-foreground" };

  if (label === "PM2.5") {
    if (value <= 50) return { status: "Good", color: "text-chart-3" };
    if (value <= 100) return { status: "Moderate", color: "text-warning" };
    if (value <= 150) return { status: "Unhealthy (Sensitive)", color: "text-danger" };
    if (value <= 200) return { status: "Unhealthy", color: "text-danger" };
    return { status: "Very Unhealthy", color: "text-danger" };
  }

  if (label === "PM10") {
    if (value <= 50) return { status: "Good", color: "text-chart-3" };
    if (value <= 100) return { status: "Moderate", color: "text-warning" };
    if (value <= 250) return { status: "Unhealthy", color: "text-danger" };
    return { status: "Very Unhealthy", color: "text-danger" };
  }

  if (label === "NO₂") {
    if (value <= 40) return { status: "Good", color: "text-chart-3" };
    if (value <= 80) return { status: "Moderate", color: "text-warning" };
    return { status: "Unhealthy", color: "text-danger" };
  }

  return { status: "Unknown", color: "text-muted-foreground" };
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
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Air Quality Snapshot
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((item, idx) => {
          const { status, color } = getStatus(item.label, item.value);

          return (
            <Card
              key={idx}
              className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {item.value !== null ? item.value : "--"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${color}`}>
                  {status}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AirQualitySnapshot;
