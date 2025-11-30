import { useState, useEffect } from "react";
import { FileDown, Download } from "lucide-react";
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
  const [exporting, setExporting] = useState(false);

  const cityNames: any = {
  hyderabad: "Hyderabad",
  bangalore: "Bangalore",
  mumbai: "Mumbai",
  delhi: "Delhi",

  chennai: "Chennai",
  pune: "Pune",
  kolkata: "Kolkata",
  ahmedabad: "Ahmedabad",
  jaipur: "Jaipur",
  lucknow: "Lucknow",
  surat: "Surat",
  nagpur: "Nagpur",
  visakhapatnam: "Visakhapatnam",
  bhopal: "Bhopal",
  patna: "Patna",
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

  // --------------------------------------------------------
  // PDF Download with loading state
  // --------------------------------------------------------
  const exportPDF = async () => {
    try {
      setExporting(true);
      window.open(
        `http://localhost:5000/api/download-report?city=${city}&range=${duration}`
      );
      // Simulate a delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground/80 font-medium">Loading Environmental Report...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
            <FileDown className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">No Data Available</h2>
          <p className="text-foreground/80 font-medium">Unable to load environmental report data.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-primary hover:bg-primary/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { airQuality, environment, traffic, insights, timeWindow } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent">
              Environmental Impact Report
            </h1>
            <p className="text-foreground/80 font-medium">
              {cityNames[city]} — {durationLabels[duration]}
            </p>
          </div>

          <Button 
            className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 border-2 border-primary/20"
            onClick={exportPDF}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 p-6 rounded-lg bg-background/80 backdrop-blur-sm border-2 border-foreground/10 transition-all duration-300">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground block">Select City</label>
            <Select value={city} onValueChange={setCity}>
  <SelectTrigger className="w-48 bg-background/90 border-foreground/20 text-foreground transition-colors duration-200 hover:border-foreground/30">
    <SelectValue />
  </SelectTrigger>

  <SelectContent className="bg-background border-foreground/20 text-foreground">
    {Object.entries(cityNames).map(([value, label]) => (
      <SelectItem
        key={value}
        value={value}
        className="focus:bg-primary/10"
      >
        {label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground block">Time Range</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-48 bg-background/90 border-foreground/20 text-foreground transition-colors duration-200 hover:border-foreground/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-foreground/20 text-foreground">
                <SelectItem value="7days" className="focus:bg-primary/10">Last 7 days</SelectItem>
                <SelectItem value="15days" className="focus:bg-primary/10">Last 15 days</SelectItem>
                <SelectItem value="30days" className="focus:bg-primary/10">Last 30 days</SelectItem>
                <SelectItem value="3months" className="focus:bg-primary/10">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Report Content */}
        <div id="report-content" className="space-y-8">
          <SummaryMetrics overview={environment.overview} />
          <AirQualitySnapshot pollutants={airQuality.pollutants} />
          <TopPollutedCorridors corridors={traffic.corridors} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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