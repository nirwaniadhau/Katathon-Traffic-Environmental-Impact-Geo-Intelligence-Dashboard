/**
 * Analytics Service - Fetches real-time air quality and traffic data
 * Air Quality: OpenAQ API (free, no key needed)
 * Traffic: Flask backend at localhost:5000 (proxies TomTom API)
 */

export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  timestamp: string;
}

export interface TrafficData {
  congestion_level: number;
  average_speed: number;
  free_flow_speed: number;
  co2_emissions?: number;
}

export interface CorrelationPoint {
  day: string;
  aqi: number;
  speed: number;
}

export interface HourlyAqiData {
  hour: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  timestamp: string;
}

// Fetch current air quality from WAQI (World Air Quality Index)
export async function fetchAirQualityData(
  latitude: number,
  longitude: number
): Promise<AirQualityData | null> {
  try {
    // WAQI API - free, no key required
    const response = await fetch(
      `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=demo`
    );

    if (!response.ok) {
      console.error("WAQI API error:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status !== "ok" || !data.data) {
      console.warn("No air quality data for this location");
      return null;
    }

    const measurements = data.data;
    
    // Extract pollutant values
    const pm25 = measurements.pm25 || 0;
    const pm10 = measurements.pm10 || 0;
    const no2 = measurements.no2 || 0;
    const aqi = measurements.aqi || Math.round((pm25 + pm10 + no2) / 3);

    console.log("✅ WAQI data received:", { aqi, pm25, pm10, no2, station: measurements.city?.name });

    return {
      aqi,
      pm25,
      pm10,
      no2,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching air quality:", error);
    return null;
  }
}

// Fetch traffic data from Flask backend
export async function fetchTrafficData(
  latitude: number,
  longitude: number
): Promise<TrafficData | null> {
  try {
    const url = `http://localhost:5000/api/traffic?lat=${latitude}&lon=${longitude}`;
    console.log("📡 Fetching traffic from:", url);
    
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Backend error:", response.statusText);
      // Return mock data on error
      return {
        congestion_level: 45,
        average_speed: 30,
        free_flow_speed: 50,
        co2_emissions: 0.27,
      };
    }

    const data = await response.json();
    console.log("✅ Traffic data received:", data);
    
    // Calculate CO2 emissions based on traffic speed and congestion
    // Formula: CO2 = (congestion_level / 100) * average_speed * 0.02
    // Units: kg/h for one vehicle (average car)
    const co2_emissions = data.congestion_level 
      ? (data.congestion_level / 100) * (data.average_speed || 30) * 0.02
      : (data.average_speed || 30) * 0.01;

    return {
      ...data,
      co2_emissions: Math.round(co2_emissions * 100) / 100,
    };
  } catch (error) {
    console.error("Error fetching traffic data:", error);
    // Return mock data as fallback
    return {
      congestion_level: 45,
      average_speed: 30,
      free_flow_speed: 50,
      co2_emissions: 0.27,
    };
  }
}

// Generate 7-day correlation data
export async function fetchCorrelationData(
  latitude: number,
  longitude: number
): Promise<CorrelationPoint[]> {
  try {
    // Try to fetch from backend first
    const url = `http://localhost:5000/api/correlation?lat=${latitude}&lon=${longitude}&days=7`;
    console.log("📡 Fetching correlation from:", url);
    
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Correlation data received:", data);
      return data.data || generateMockCorrelationData();
    }
  } catch (error) {
    console.error("Error fetching correlation data:", error);
  }

  // Fallback to mock data
  console.log("📊 Using mock correlation data");
  return generateMockCorrelationData();
}

// Mock correlation data for UI
function generateMockCorrelationData(): CorrelationPoint[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, i) => ({
    day,
    aqi: 120 + Math.random() * 60 + (i > 4 ? -20 : 0),
    speed: 30 + Math.random() * 20 + (i > 4 ? 10 : 0),
  }));
}

// Fetch historical AQI data for the last 24 hours from OpenAQ
export async function fetchHourlyAqiData(latitude: number, longitude: number): Promise<HourlyAqiData[]> {
  try {
    // Get current time and 24 hours ago in ISO format
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 24);
    
    const params = new URLSearchParams({
      coordinates: `${latitude},${longitude}`,
      radius: '15000', // widen search radius to ensure nearby station data
      date_from: startDate.toISOString(),
      date_to: endDate.toISOString(),
      limit: '1000',
      parameter: 'pm25,pm10,no2',
      order_by: 'datetime',
      sort: 'asc',
      has_geo: 'true'
    });

    let response = await fetch(`https://api.openaq.org/v2/measurements?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`OpenAQ API error: ${response.statusText}`);
    }

    let data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      // Fallback: find nearest monitoring location and query its measurements
      const locParams = new URLSearchParams({
        coordinates: `${latitude},${longitude}`,
        radius: '50000',
        limit: '1',
        order_by: 'distance',
        has_geo: 'true'
      });
      const locRes = await fetch(`https://api.openaq.org/v2/locations?${locParams.toString()}`);
      const locData = await locRes.json();
      const locationId = locData?.results?.[0]?.id;
      if (locationId) {
        const byLocParams = new URLSearchParams({
          location_id: String(locationId),
          date_from: startDate.toISOString(),
          date_to: endDate.toISOString(),
          limit: '1000',
          parameter: 'pm25,pm10,no2',
          order_by: 'datetime',
          sort: 'asc'
        });
        response = await fetch(`https://api.openaq.org/v2/measurements?${byLocParams.toString()}`);
        data = await response.json();
      }
    }

    if (!data.results || data.results.length === 0) {
      console.warn('OpenAQ returned no measurements for this area');
      return generateMockHourlyAqiData();
    }

    // Group by hour and calculate average AQI for each hour
    const hourlyData: Record<string, { aqi: number[]; pm25: number[]; pm10: number[]; no2: number[]; timestamps: string[] }> = {};
    
    // AQI calculator using US EPA breakpoints for PM2.5; if PM2.5 missing we approximate from PM10
    const pm25ToAqi = (pm25: number) => {
      const bp = [
        { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
        { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
        { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
        { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
        { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
        { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
        { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
      ];
      for (const b of bp) {
        if (pm25 >= b.cLow && pm25 <= b.cHigh) {
          return Math.round(((b.iHigh - b.iLow) / (b.cHigh - b.cLow)) * (pm25 - b.cLow) + b.iLow);
        }
      }
      return Math.min(500, Math.max(0, Math.round(pm25 * 2)));
    };

    data.results.forEach((measurement: any) => {
      const date = new Date(measurement.date.utc);
      const hourKey = date.toISOString().substring(0, 13) + ':00:00Z'; // Group by hour
      
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = { aqi: [], pm25: [], pm10: [], no2: [], timestamps: [] };
      }
      
      // Compute AQI primarily from PM2.5
      if (measurement.parameter === 'pm25') {
        hourlyData[hourKey].aqi.push(pm25ToAqi(measurement.value));
      }
      if (measurement.parameter === 'pm25') {
        hourlyData[hourKey].pm25.push(measurement.value);
      } else if (measurement.parameter === 'pm10') {
        hourlyData[hourKey].pm10.push(measurement.value);
      } else if (measurement.parameter === 'no2') {
        hourlyData[hourKey].no2.push(measurement.value);
      }
      hourlyData[hourKey].timestamps.push(measurement.date.utc);
    });

    // Process into hourly averages
    const processedData = Object.entries(hourlyData).map(([hour, data]) => {
      // If AQI not computed for an hour (no PM2.5), estimate from PM10 when available
      let avgAqi = 0;
      if (data.aqi.length > 0) {
        avgAqi = Math.round(data.aqi.reduce((a, b) => a + b, 0) / data.aqi.length);
      } else if (data.pm10.length > 0) {
        const pm10Avg = data.pm10.reduce((a, b) => a + b, 0) / data.pm10.length;
        avgAqi = Math.round(pm10Avg * 1.2); // rough mapping to AQI scale
      } else if (data.no2.length > 0) {
        const no2Avg = data.no2.reduce((a, b) => a + b, 0) / data.no2.length;
        avgAqi = Math.round(no2Avg * 1.5);
      }
      return {
        hour: new Date(hour).toLocaleTimeString([], { hour: '2-digit', hour12: true }),
        aqi: avgAqi,
        pm25: data.pm25.length > 0 ? Math.round(data.pm25.reduce((a, b) => a + b, 0) / data.pm25.length * 10) / 10 : 0,
        pm10: data.pm10.length > 0 ? Math.round(data.pm10.reduce((a, b) => a + b, 0) / data.pm10.length * 10) / 10 : 0,
        no2: data.no2.length > 0 ? Math.round(data.no2.reduce((a, b) => a + b, 0) / data.no2.length * 10) / 10 : 0,
        timestamp: data.timestamps[0] // Use first timestamp in the hour
      };
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Ensure we have data for the last 24 hours, filling in gaps if necessary
    return fillMissingHours(processedData, 24);
  } catch (error) {
    console.error('Error fetching hourly AQI data:', error);
    return generateMockHourlyAqiData();
  }
}

// Helper function to generate mock hourly AQI data for fallback
function generateMockHourlyAqiData(): HourlyAqiData[] {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - 23 + i);
    const aqi = Math.max(20, Math.min(300, 50 + Math.sin(i * 0.2) * 50 + (Math.random() * 20 - 10)));
    return {
      hour: date.toLocaleTimeString([], { hour: '2-digit', hour12: true }),
      aqi: Math.round(aqi),
      pm25: Math.round(aqi / 2 + (Math.random() * 10 - 5)),
      pm10: Math.round(aqi / 2 + 10 + (Math.random() * 10 - 5)),
      no2: Math.round(aqi / 4 + (Math.random() * 5 - 2.5)),
      timestamp: date.toISOString()
    };
  });
  return hours;
}

// Helper function to fill in missing hours in the data
function fillMissingHours(data: HourlyAqiData[], hours: number): HourlyAqiData[] {
  const result: HourlyAqiData[] = [];
  const now = new Date();
  
  for (let i = 0; i < hours; i++) {
    const targetTime = new Date(now);
    targetTime.setHours(now.getHours() - (hours - 1 - i));
    const targetHour = targetTime.toLocaleTimeString([], { hour: '2-digit', hour12: true });
    
    const existingData = data.find(d => d.hour === targetHour);
    
    if (existingData) {
      result.push(existingData);
    } else {
      // If no data for this hour, use the previous hour's data or create a default
      const lastData = result.length > 0 ? result[result.length - 1] : null;
      result.push({
        hour: targetHour,
        aqi: lastData?.aqi || 50,
        pm25: lastData?.pm25 || 25,
        pm10: lastData?.pm10 || 35,
        no2: lastData?.no2 || 12,
        timestamp: targetTime.toISOString()
      });
    }
  }
  
  return result;
}

// Fetch all analytics data for a location
export async function fetchAnalyticsData(latitude: number, longitude: number) {
  const [aqi, traffic, correlation, hourlyAqi] = await Promise.all([
    fetchAirQualityData(latitude, longitude),
    fetchTrafficData(latitude, longitude),
    fetchCorrelationData(latitude, longitude),
    fetchHourlyAqiData(latitude, longitude)
  ]);

  return { aqi, traffic, correlation, hourlyAqi };
}