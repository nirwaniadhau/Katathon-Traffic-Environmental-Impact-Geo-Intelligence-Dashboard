

import { useState, useEffect } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import SummaryMetrics from "@/components/eco-report/SummaryMetrics";
import AirQualitySnapshot from "@/components/eco-report/AirQualitySnapshot";
import TopPollutedCorridors from "@/components/eco-report/TopPollutedCorridors";
import EnvironmentalImpact from "@/components/eco-report/EnvironmentalImpact";
import AQITrendChart from "@/components/eco-report/AQITrendChart";
import CorrelationInsights from "@/components/eco-report/CorrelationInsights";
import MonthlyInsights from "@/components/eco-report/MonthlyInsights";
import Recommendations from "@/components/eco-report/Recommendations";

const EcoReport = () => {
  const [city, setCity] = useState("hyderabad");
  const [duration, setDuration] = useState("7days");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const cityNames: any = {
    hyderabad: "Hyderabad",
    bangalore: "Bangalore",
    mumbai: "Mumbai",
    delhi: "Delhi",
  };

  const durationLabels: any = {
    "7days": "Last 7 days",
    "15days": "Last 15 days",
    "30days": "Last 30 days",
    "3months": "Last 3 months",
  };

  // --------------------------------------------------------
  // Fetch API Data
  // --------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5000/api/eco-report?city=${city}&range=${duration}`
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [city, duration]);

  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!data) return null;

  const { airQuality, environment, traffic, insights, timeWindow } = data;

  // --------------------------------------------------------
  // NEW PDF Download (Puppeteer via Flask)
  // --------------------------------------------------------
  const exportPDF = () => {
    window.open(
      `http://localhost:5000/api/download-report?city=${city}&range=${duration}`
    );
  };

  // --------------------------------------------------------
  // UI
  // --------------------------------------------------------
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Environmental Impact Report</h1>
            <p className="text-muted-foreground">
              {cityNames[city]} — {durationLabels[duration]}
            </p>
          </div>

          <Button className="bg-primary" onClick={exportPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-40 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hyderabad">Hyderabad</SelectItem>
              <SelectItem value="bangalore">Bangalore</SelectItem>
              <SelectItem value="mumbai">Mumbai</SelectItem>
              <SelectItem value="delhi">Delhi</SelectItem>
            </SelectContent>
          </Select>

          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="w-40 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="15days">Last 15 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Report Content */}
        <div id="report-content">
          <SummaryMetrics overview={environment.overview} />
          <AirQualitySnapshot pollutants={airQuality.pollutants} />
          <TopPollutedCorridors corridors={traffic.corridors} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <EnvironmentalImpact breakdown={environment.emissionBreakdown} />
            <AQITrendChart trend={airQuality.trend} />
          </div>

          <CorrelationInsights
            correlations={insights.correlations}
            trend={airQuality.trend}
          />

          <MonthlyInsights monthly={airQuality.monthlyInsights} />

          <Recommendations recommendations={insights.recommendations} />
        </div>
      </div>
    </div>
  );
};

export default EcoReport;
