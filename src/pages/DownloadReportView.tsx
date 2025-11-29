import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function DownloadReportView() {
  const [params] = useSearchParams();
  const city = params.get("city");
  const range = params.get("range");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(
        `http://localhost:5000/api/eco-report?city=${city}&range=${range}`
      );
      const json = await res.json();
      setData(json);
    };
    load();
  }, [city, range]);

  if (!data) return <div>Loading report…</div>;

  return (
    <div
      style={{
        padding: "32px",
        fontFamily: "Helvetica",
        maxWidth: "750px",
        margin: "0 auto",
        color: "#111",
      }}
    >
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
        Environmental Impact Report — {city}
      </h1>

      <p>Range: {range}</p>

      {/* Render Insights */}
      <h2 style={{ marginTop: "32px" }}>Executive Summary</h2>
      <p style={{ lineHeight: 1.6 }}>
        • Total CO₂ Emissions: {data.environment.overview.totalCO2} tons <br />
        • Population at risk: {data.environment.overview.affectedPopulation} <br />
        • Highest AQI: {data.airQuality.highestAqi} <br />
        • Most polluted corridor: {data.traffic.corridors[0].name}
      </p>

      <h2 style={{ marginTop: "28px" }}>Trend Charts</h2>
      <img src={data.airQuality.chartImage} width="700" />

      <h2 style={{ marginTop: "28px" }}>Emission Breakdown</h2>
      <img src={data.environment.breakdownChart} width="700" />

      <h2 style={{ marginTop: "28px" }}>Recommendations</h2>
      <ul>
        {data.insights.recommendations.map((r: any) => (
          <li key={r.title}>
            <strong>{r.title}</strong>: {r.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
