// // import { Card } from "@/components/ui/card";
// // import { Progress } from "@/components/ui/progress";

// // const corridors = [
// //   {
// //     rank: 1,
// //     name: "PVNR Expressway",
// //     congestion: 89,
// //     emissions: "524 kg",
// //     aqi: 178,
// //   },
// //   {
// //     rank: 2,
// //     name: "ORR - Gachibowli Junction",
// //     congestion: 82,
// //     emissions: "487 kg",
// //     aqi: 165,
// //   },
// //   {
// //     rank: 3,
// //     name: "LB Nagar - Dilsukhnagar",
// //     congestion: 76,
// //     emissions: "421 kg",
// //     aqi: 152,
// //   },
// //   {
// //     rank: 4,
// //     name: "Mehdipatnam Junction",
// //     congestion: 71,
// //     emissions: "398 kg",
// //     aqi: 143,
// //   },
// //   {
// //     rank: 5,
// //     name: "Kukatpally Y-Junction",
// //     congestion: 68,
// //     emissions: "365 kg",
// //     aqi: 138,
// //   },
// // ];

// // const TopPollutedCorridors = () => {
// //   return (
// //     <div className="mb-6">
// //       <h2 className="text-2xl font-bold text-foreground mb-4">
// //         Top 5 Polluted Corridors
// //       </h2>
// //       <Card className="p-6 bg-card border-border">
// //         <div className="space-y-4">
// //           {corridors.map((corridor) => (
// //             <div
// //               key={corridor.rank}
// //               className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
// //             >
// //               <div className="flex items-center gap-4 flex-1">
// //                 <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold">
// //                   {corridor.rank}
// //                 </div>
// //                 <div className="flex-1 min-w-0">
// //                   <p className="font-semibold text-foreground mb-2">
// //                     {corridor.name}
// //                   </p>
// //                   <div className="space-y-1">
// //                     <div className="flex items-center gap-2">
// //                       <span className="text-xs text-muted-foreground w-24">
// //                         Congestion
// //                       </span>
// //                       <Progress
// //                         value={corridor.congestion}
// //                         className="flex-1 h-2"
// //                       />
// //                       <span className="text-xs font-semibold text-warning w-12 text-right">
// //                         {corridor.congestion}%
// //                       </span>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="flex items-center gap-6 md:gap-8">
// //                 <div>
// //                   <p className="text-xs text-muted-foreground">Daily Emissions</p>
// //                   <p className="text-sm font-semibold text-foreground">
// //                     {corridor.emissions}
// //                   </p>
// //                 </div>
// //                 <div className="px-4 py-2 rounded-lg bg-danger/20 border border-danger/30">
// //                   <p className="text-xs text-muted-foreground">AQI</p>
// //                   <p className="text-lg font-bold text-danger">
// //                     {corridor.aqi}
// //                   </p>
// //                 </div>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </Card>
// //     </div>
// //   );
// // };

// // export default TopPollutedCorridors;



// import { Card } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";

// interface Corridor {
//   id: number;
//   name: string;
//   congestionPercent: number;
//   dailyEmissionsTons: number;
//   aqi: number;
//   issue: string;
// }

// const TopPollutedCorridors = ({ corridors }: { corridors: Corridor[] }) => {
//   if (!corridors || corridors.length === 0) return null;

//   return (
//     <div className="mb-6">
//       <h2 className="text-2xl font-bold text-foreground mb-4">
//         Top Polluted Corridors
//       </h2>

//       <Card className="p-6 bg-card border-border">
//         <div className="space-y-4">
//           {corridors.map((corridor, index) => (
//             <div
//               key={corridor.id}
//               className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
//             >
//               {/* Rank + Name + Congestion */}
//               <div className="flex items-center gap-4 flex-1">
//                 <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold">
//                   {index + 1}
//                 </div>

//                 <div className="flex-1 min-w-0">
//                   <p className="font-semibold text-foreground mb-1">
//                     {corridor.name}
//                   </p>

//                   <p className="text-xs text-muted-foreground mb-2">
//                     {corridor.issue}
//                   </p>

//                   <div className="flex items-center gap-2">
//                     <span className="text-xs text-muted-foreground w-24">
//                       Congestion
//                     </span>

//                     <Progress
//                       value={corridor.congestionPercent}
//                       className="flex-1 h-2"
//                     />

//                     <span className="text-xs font-semibold text-warning w-12 text-right">
//                       {corridor.congestionPercent}%
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Emissions + AQI */}
//               <div className="flex items-center gap-6 md:gap-8">
//                 <div>
//                   <p className="text-xs text-muted-foreground">Daily Emissions</p>
//                   <p className="text-sm font-semibold text-foreground">
//                     {corridor.dailyEmissionsTons} tons
//                   </p>
//                 </div>

//                 <div className="px-4 py-2 rounded-lg bg-danger/20 border border-danger/30">
//                   <p className="text-xs text-muted-foreground">AQI</p>
//                   <p className="text-lg font-bold text-danger">
//                     {corridor.aqi}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default TopPollutedCorridors;



import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Corridor {
  id: number;
  name: string;
  congestionPercent: number;
  dailyEmissionsTons: number;
  aqi: number;
  issue: string;
}

const TopPollutedCorridors = ({ corridors }: { corridors: Corridor[] }) => {
  if (!corridors || corridors.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Top Polluted Corridors
        </h2>
        <Card className="p-6 bg-card border-border text-muted-foreground">
          No corridor data available.
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Top Polluted Corridors
      </h2>

      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          {corridors.map((corridor, index) => (
            <div
              key={corridor.id}
              className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              {/* Rank + Name + Congestion */}
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground mb-1">
                    {corridor.name}
                  </p>

                  <p className="text-xs text-muted-foreground mb-2">
                    {corridor.issue}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24">
                      Congestion
                    </span>

                    <Progress
                      value={corridor.congestionPercent ?? 0}
                      className="flex-1 h-2"
                    />

                    <span className="text-xs font-semibold text-warning w-12 text-right">
                      {corridor.congestionPercent ?? 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Emissions + AQI */}
              <div className="flex items-center gap-6 md:gap-8">
                <div>
                  <p className="text-xs text-muted-foreground">Daily Emissions</p>
                  <p className="text-sm font-semibold text-foreground">
                    {(corridor.dailyEmissionsTons ?? 0).toFixed(2)} tons
                  </p>
                </div>

                <div className="px-4 py-2 rounded-lg bg-danger/20 border border-danger/30">
                  <p className="text-xs text-muted-foreground">AQI</p>
                  <p className="text-lg font-bold text-danger">
                    {corridor.aqi ?? "--"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TopPollutedCorridors;
