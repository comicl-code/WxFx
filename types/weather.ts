/** A single hour's weather conditions, normalized to US customary units */
export interface HourlyCondition {
  time: string; // ISO timestamp
  tempF: number;
  feelsLikeF: number;
  precipProbability: number; // 0–100
  precipAmountIn: number; // inches
  skyCover: number; // 0–100
  windSpeedMph: number;
  windGustMph: number;
  conditions: string; // 'Thunderstorms', 'Partly Cloudy', etc.
  isDaytime: boolean;
}

/** A 12-hour forecast period from NWS */
export interface DayForecast {
  name: string; // 'Saturday' or 'Saturday Night'
  number: number;
  tempF: number;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  detailedForecast: string;
  isDaytime: boolean;
  icon: string;
}

/** An active NWS weather alert */
export interface WeatherAlert {
  id: string;
  event: string; // 'Tornado Warning', 'Severe Thunderstorm Watch'
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  urgency: 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown';
  certainty: string;
  headline: string;
  description: string;
  instruction: string | null;
  onset: string;
  expires: string;
  senderName: string;
  areaDesc: string;
}

/** Aggregated weather data for a location */
export interface LocationWeather {
  locationId: string;
  hourly: HourlyCondition[];
  forecast: DayForecast[];
  alerts: WeatherAlert[];
  fetchedAt: string;
  nwsUpdateTime: string | null;
}

/** NWS grid info resolved from /points */
export interface NWSGridInfo {
  office: string;
  gridX: number;
  gridY: number;
  radarStation: string;
}

export type AlertSeverity = WeatherAlert['severity'];

/** Region grouping for display */
export type Region = 'southern-plains' | 'wdw';

/** Location config — coordinates + metadata */
export interface WeatherLocation {
  id: string;
  name: string;
  shortName: string;
  lat: number;
  lon: number;
  region: Region;
  state: string;
}
