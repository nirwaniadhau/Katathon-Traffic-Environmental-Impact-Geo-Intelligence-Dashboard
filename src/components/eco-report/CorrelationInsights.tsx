// import { Card } from "@/components/ui/card";
// import {
//   ScatterChart,
//   Scatter,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";

// interface CorrelationProps {
//   correlations: Record<string, number>;
//   trend?: { points?: { pm25?: number; pm10?: number; date: string }[] };
// }

// const formatPairName = (key: string) => {
//   const [a, b] = key.split("_");
//   return `${a.toUpperCase()} ↔ ${b.toUpperCase()}`;
// };

// const CorrelationInsights = ({ correlations, trend }: CorrelationProps) => {
//   if (!correlations) return null;

//   const scatterData =
//     trend?.points
//       ?.map(p => ({
//         pm25: p.pm25 ?? null,
//         pm10: p.pm10 ?? null,
//       }))
//       ?.filter(p => p.pm25 && p.pm10) || [];

//   return (
//     <div className="mb-6">
//       <h2 className="text-2xl font-bold text-foreground mb-4">
//         Correlation Insights
//       </h2>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//         {/* SCATTER PLOT: PM2.5 vs PM10 */}
//         <Card className="p-6 bg-card border-border">
//           <h3 className="text-lg font-semibold text-foreground mb-4">
//             PM2.5 vs PM10 Correlation
//           </h3>

//           {scatterData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={250}>
//               <ScatterChart>
//                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
//                 <XAxis
//                   dataKey="pm25"
//                   name="PM2.5"
//                   stroke="hsl(150, 5%, 65%)"
//                   label={{ value: "PM2.5 (µg/m³)", position: "insideBottom", offset: -5 }}
//                 />
//                 <YAxis
//                   dataKey="pm10"
//                   name="PM10"
//                   stroke="hsl(150, 5%, 65%)"
//                   label={{ value: "PM10 (µg/m³)", angle: -90, position: "insideLeft" }}
//                 />
//                 <Tooltip />
//                 <Scatter data={scatterData} fill="hsl(152, 76%, 55%)" />
//               </ScatterChart>
//             </ResponsiveContainer>
//           ) : (
//             <p className="text-muted-foreground">Not enough data to display scatter plot.</p>
//           )}
//         </Card>

//         {/* SUMMARY BOX */}
//         <Card className="p-6 bg-card border-border">
//           <h3 className="text-lg font-semibold text-foreground mb-4">
//             Correlation Summary
//           </h3>

//           <div className="space-y-4">
//             {Object.entries(correlations).map(([key, value], index) => (
//               <div
//                 key={index}
//                 className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
//               >
//                 <span className="text-foreground font-medium">{formatPairName(key)}</span>
//                 <span
//                   className={`text-2xl font-bold ${
//                     value > 0.7
//                       ? "text-primary"
//                       : value > 0.4
//                       ? "text-warning"
//                       : value > 0
//                       ? "text-chart-2"
//                       : "text-danger"
//                   }`}
//                 >
//                   {value > 0 ? "+" : ""}
//                   {value.toFixed(2)}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </Card>
//       </div>

//       {/* FUTURE ADD-ONS (Noise & Fuel) - Coming When Backend is Ready */}
//       <div className="text-sm text-muted-foreground mt-4">
//         Advanced correlations (Noise ↔ Traffic, Fuel Waste ↔ Congestion) will
//         appear once backend provides noise & vehicle-speed data.
//       </div>
//     </div>
//   );
// };

// export default CorrelationInsights;




import { Card } from "@/components/ui/card";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CorrelationProps {
  correlations: Record<string, number>;
  trend?: { points?: { pm25?: number; pm10?: number; date: string }[] };
  traffic?: { corridors?: { congestionPercent: number; dailyEmissionsTons: number }[] };
}

const formatPairName = (key: string) => {
  const [a, b] = key.split("_");
  return `${a.toUpperCase()} ↔ ${b.toUpperCase()}`;
};

const CorrelationInsights = ({ correlations, trend, traffic }: CorrelationProps) => {
  if (!correlations) return null;

  // --------------------------------------------
  // 1) PM2.5 ↔ PM10 scatter data
  // --------------------------------------------
  const pmScatter =
    trend?.points
      ?.map((p) => ({
        pm25: p.pm25 ?? null,
        pm10: p.pm10 ?? null,
      }))
      ?.filter((p) => p.pm25 && p.pm10) || [];

  // --------------------------------------------
  // 2) Congestion ↔ Emissions scatter data
  // --------------------------------------------
  const congestionScatter =
    traffic?.corridors?.map((c) => ({
      congestionPercent: c.congestionPercent,
      emissions: c.dailyEmissionsTons,
    })) || [];

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Correlation Insights
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* -------------------------------------------------
            1️⃣ SCATTER: PM2.5 vs PM10
        -------------------------------------------------- */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            PM2.5 vs PM10 Correlation
          </h3>

          {pmScatter.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />

                <XAxis
                  type="number"
                  dataKey="pm25"
                  name="PM2.5"
                  stroke="hsl(150, 5%, 65%)"
                  label={{
                    value: "PM2.5 (µg/m³)",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />

                <YAxis
                  type="number"
                  dataKey="pm10"
                  name="PM10"
                  stroke="hsl(150, 5%, 65%)"
                  label={{
                    value: "PM10 (µg/m³)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Legend />

                <Scatter
                  name="PM Data"
                  data={pmScatter}
                  fill="hsl(152, 76%, 55%)"
                />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground">
              Not enough PM2.5 and PM10 data available.
            </p>
          )}
        </Card>

        {/* -------------------------------------------------
            2️⃣ SCATTER: Congestion vs Emissions
        -------------------------------------------------- */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Congestion vs Emissions
          </h3>

          {congestionScatter.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />

                <XAxis
                  type="number"
                  dataKey="congestionPercent"
                  name="Congestion"
                  stroke="hsl(150, 5%, 65%)"
                  label={{
                    value: "Congestion (%)",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />

                <YAxis
                  type="number"
                  dataKey="emissions"
                  name="Emissions"
                  stroke="hsl(150, 5%, 65%)"
                  label={{
                    value: "Emissions (tons/day)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Legend />

                <Scatter
                  name="Corridors"
                  data={congestionScatter}
                  fill="hsl(38, 92%, 55%)"
                />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground">
              Not enough congestion/emissions data available.
            </p>
          )}
        </Card>
      </div>

      {/* -------------------------------------------------
          3️⃣ Correlation Summary
      -------------------------------------------------- */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Correlation Summary
        </h3>

        <div className="space-y-4">
          {Object.entries(correlations).map(([key, value], index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
            >
              <span className="text-foreground font-medium">
                {formatPairName(key)}
              </span>

              <span
                className={`text-2xl font-bold ${
                  value > 0.7
                    ? "text-primary"
                    : value > 0.4
                    ? "text-warning"
                    : value > 0
                    ? "text-chart-2"
                    : "text-danger"
                }`}
              >
                {value > 0 ? "+" : ""}
                {value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-sm text-muted-foreground mt-4">
        More advanced correlations (Noise ↔ Traffic, Fuel Waste ↔ Congestion)
        will appear once backend provides additional data streams.
      </p>
    </div>
  );
};

export default CorrelationInsights;

