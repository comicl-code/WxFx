# Weather Forecast Analyzer — Requirements & Data Flow

## Overview

Add a weather forecast analyzer to LightningMax that pulls NWS numerical model data and text forecasts for targeted locations. Phase 1 focuses on the southern plains (Oklahoma City, Tulsa, Springfield MO, Dallas TX) and Disney World (detailed multi-point coverage).

This extends the existing Next.js app with a new `/weather` section alongside the existing Disney trip optimizer.

---

## Target Locations

| Location | Lat/Lon | NWS Office | Use Case |
|---|---|---|---|
| Oklahoma City, OK | 35.4676, -97.5164 | OUN | Southern plains core |
| Tulsa, OK | 36.1540, -95.9928 | TSA | Southern plains core |
| Springfield, MO | 37.2090, -93.2923 | SGF | Northern edge |
| Dallas, TX | 32.7767, -96.7970 | FWD | Southern edge |
| Magic Kingdom (WDW) | 28.3772, -81.5707 | MLB | Disney detail point |
| EPCOT (WDW) | 28.3747, -81.5494 | MLB | Disney detail point |
| Hollywood Studios (WDW) | 28.3575, -81.5583 | MLB | Disney detail point |
| Animal Kingdom (WDW) | 28.3553, -81.5901 | MLB | Disney detail point |

WDW parks share the same NWS grid office (Melbourne, FL) but have distinct gridpoints — close enough that forecasts will be nearly identical, but we store them separately so the existing per-park day pages can show hyper-local data.

---

## Data Sources (all free, no API key)

### 1. NWS Gridpoint Forecast Data (primary numerical source)
- **Endpoint**: `GET https://api.weather.gov/gridpoints/{office}/{gridX},{gridY}`
- **Resolution**: Hourly values on a 2.5km grid
- **Key layers we'll consume**:
  - `temperature` (°C, we convert to °F)
  - `apparentTemperature` (heat index / wind chill)
  - `probabilityOfPrecipitation` (%)
  - `quantitativePrecipitation` (mm)
  - `skyCover` (%)
  - `windSpeed` (km/h, convert to mph)
  - `windGust`
  - `weather` (structured conditions: thunderstorms, hail, etc.)
- **Freshness**: Updated every 1–2 hours by forecast offices
- **Rate limiting**: No hard limit, but requires `User-Agent` header with app name + contact email. Abusers get blocked.

### 2. NWS Text Forecast (human-readable companion)
- **Endpoint**: `GET https://api.weather.gov/gridpoints/{office}/{gridX},{gridY}/forecast`
- **Returns**: 12-hour period forecasts with `shortForecast`, `detailedForecast`, temperature, wind as text
- **Use**: Display alongside numerical data for quick human interpretation

### 3. NWS Hourly Forecast (structured hourly)
- **Endpoint**: `GET https://api.weather.gov/gridpoints/{office}/{gridX},{gridY}/forecast/hourly`
- **Returns**: Hourly forecast in human-friendly units (°F, mph) with short descriptions
- **Use**: Simpler alternative to raw gridpoint data for display; gridpoint data for analysis

### 4. NWS Active Alerts
- **Endpoint**: `GET https://api.weather.gov/alerts/active?point={lat},{lon}`
- **Returns**: Active watches, warnings, advisories for a point
- **Critical for southern plains**: Tornado watches/warnings, severe thunderstorm warnings, flash flood warnings
- **Use**: Banner alerts on location pages

### 5. NWS Radar (future consideration)
- MRMS composite reflectivity tiles available but adds complexity. Defer to Phase 2.

---

## Requirements

### Functional Requirements

1. **Location dashboard** (`/weather`) — Grid/list of all tracked locations with current conditions summary (temp, precip chance, active alerts count)

2. **Location detail page** (`/weather/[locationId]`) — For each location:
   - Current conditions snapshot (temp, feels-like, wind, sky cover)
   - Active NWS alerts with severity badges (warning/watch/advisory)
   - Hourly forecast timeline (next 24–48h) showing temp + precip probability as a visual chart or timeline
   - 7-day text forecast from NWS (the 12-hour period summaries)
   - Detailed hourly data table (temp, precip %, wind, sky cover)

3. **Disney World integration** — On existing `/day/[date]` pages, show weather conditions for that day's park:
   - Morning/afternoon/evening temp + precip summary
   - Rain risk flag if any hour in the itinerary window exceeds 40% precip probability
   - Link to full weather detail page

4. **Severe weather prominence** — Active tornado/severe thunderstorm warnings should be visually prominent (red banner) on both the dashboard and detail pages

5. **Data freshness indicator** — Show when data was last fetched and when NWS last updated the forecast

### Non-Functional Requirements

1. **Caching**: NWS data cached server-side (Next.js `revalidate`) at 15-minute intervals. NWS updates forecasts every 1–2 hours; 15 min is a good balance.
2. **Alerts polling**: Alerts should poll more frequently — 5-minute `revalidate` for the alerts endpoint.
3. **Mobile responsive**: All weather pages must work well on mobile (cards stack, tables scroll horizontally).
4. **NWS User-Agent compliance**: All server-side requests include `User-Agent: LightningMax/1.0 (contact@example.com)` — configurable via env var.
5. **Graceful degradation**: If NWS API is down, show stale cached data with a "data may be outdated" warning.
6. **No client-side NWS calls**: All NWS requests go through our API routes (same pattern as existing queue-times proxy) to avoid CORS and enable caching.

---

## High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        NWS API (api.weather.gov)                │
│                                                                 │
│  /points/{lat},{lon}          → grid office + gridX,Y coords    │
│  /gridpoints/{office}/{x},{y} → raw numerical forecast layers   │
│  /gridpoints/.../forecast     → 7-day text forecast             │
│  /gridpoints/.../forecast/hourly → hourly text forecast         │
│  /alerts/active?point=...     → active watches/warnings         │
└──────────────┬──────────────────────────────────────────────────┘
               │  server-side fetch (User-Agent required)
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js API Routes (app/api/weather/)         │
│                                                                 │
│  /api/weather/[locationId]/gridpoint   → cached numerical data  │
│  /api/weather/[locationId]/forecast    → cached text forecast   │
│  /api/weather/[locationId]/hourly     → cached hourly forecast  │
│  /api/weather/[locationId]/alerts      → cached active alerts   │
│                                                                 │
│  Caching: Next.js revalidate (15 min forecast, 5 min alerts)   │
│  Transform: °C→°F, km/h→mph, ISO durations→hour slots          │
└──────────────┬──────────────────────────────────────────────────┘
               │  JSON responses
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Client Layer                                  │
│                                                                 │
│  hooks/useWeather.ts          SWR hook, polls /api/weather/     │
│  hooks/useWeatherAlerts.ts    SWR hook, polls alerts (5 min)    │
│                                                                 │
│  components/weather/                                            │
│    WeatherDashboard.tsx       Location grid overview             │
│    WeatherDetail.tsx          Single-location deep dive          │
│    HourlyTimeline.tsx         Visual hourly temp+precip bar      │
│    AlertBanner.tsx            Severe weather warning banner       │
│    WeatherSummaryCard.tsx     Compact card for day pages          │
│                                                                 │
│  pages                                                          │
│    app/weather/page.tsx             Dashboard (all locations)    │
│    app/weather/[locationId]/page.tsx Location detail             │
│    app/day/[date]/page.tsx          Existing — add weather card  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Layer Design

### Location Config (`data/weatherLocations.ts`)

```typescript
interface WeatherLocation {
  id: string;                    // 'okc', 'tulsa', 'springfield-mo', 'dallas', 'mk', 'ep', etc.
  name: string;                  // 'Oklahoma City, OK'
  shortName: string;             // 'OKC'
  lat: number;
  lon: number;
  gridOffice: string;            // 'OUN' — resolved once from /points, then hardcoded
  gridX: number;                 // resolved once from /points, then hardcoded
  gridY: number;
  region: 'southern-plains' | 'wdw';
  parkId?: ParkId;               // links to existing park system for WDW locations
}
```

We resolve `gridOffice`/`gridX`/`gridY` once manually via the `/points` endpoint and hardcode them — no need to call `/points` at runtime.

### NWS API Client (`lib/api/nwsWeather.ts`)

```typescript
// Core fetch functions (server-side only)
fetchGridpointData(location: WeatherLocation): Promise<NWSGridpointData>
fetchForecast(location: WeatherLocation): Promise<NWSForecast>
fetchHourlyForecast(location: WeatherLocation): Promise<NWSHourlyForecast>
fetchActiveAlerts(location: WeatherLocation): Promise<NWSAlert[]>
```

All requests include the required `User-Agent` header. Raw NWS responses are transformed into our own typed interfaces with US-customary units.

### Transformed Types (`types/weather.ts`)

```typescript
interface HourlyCondition {
  time: string;                  // ISO timestamp
  tempF: number;
  feelsLikeF: number;
  precipProbability: number;     // 0–100
  precipAmountIn: number;        // inches
  skyCover: number;              // 0–100
  windSpeedMph: number;
  windGustMph: number;
  conditions: string;            // 'Thunderstorms', 'Partly Cloudy', etc.
}

interface DayForecast {
  name: string;                  // 'Saturday' or 'Saturday Night'
  tempF: number;
  windSpeed: string;
  shortForecast: string;
  detailedForecast: string;
  isDaytime: boolean;
}

interface WeatherAlert {
  id: string;
  event: string;                 // 'Tornado Warning', 'Severe Thunderstorm Watch'
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  urgency: string;
  headline: string;
  description: string;
  onset: string;
  expires: string;
  senderName: string;
}

interface LocationWeather {
  location: WeatherLocation;
  current: HourlyCondition;      // nearest-hour from hourly data
  hourly: HourlyCondition[];     // next 48–168 hours
  forecast: DayForecast[];       // 7-day periods
  alerts: WeatherAlert[];
  fetchedAt: string;
  nwsUpdateTime: string;        // from Last-Modified header
}
```

---

## Vercel Deployment Considerations

| Concern | Solution |
|---|---|
| **Serverless function timeout** | Free tier: 10s. NWS API typically responds in 1–3s, but can spike to 8s+. Use Next.js `revalidate` so stale data is served instantly while revalidation happens in background (ISR). |
| **Cold starts** | Vercel edge functions not needed — standard serverless is fine since we're caching. |
| **Environment variables** | `NWS_USER_AGENT` — required contact string for NWS API compliance. Set in Vercel dashboard. |
| **No API keys needed** | NWS API is free and keyless. No secrets to manage. |
| **Bandwidth** | NWS gridpoint responses are ~50–100KB each. With 8 locations × 4 endpoints = 32 upstream requests per cache cycle. Negligible. |
| **Domain** | Deploy alongside existing app — weather is just new routes under `/weather`. No separate deployment needed. |
| **Preview deployments** | Vercel auto-creates previews for PRs — weather routes work out of the box since NWS API has no origin restrictions server-side. |

---

## File Structure (new files only)

```
data/
  weatherLocations.ts            # Location configs with pre-resolved grid coords

types/
  weather.ts                     # HourlyCondition, DayForecast, WeatherAlert, etc.

lib/api/
  nwsWeather.ts                  # NWS API client (server-side fetch)

app/api/weather/
  [locationId]/
    gridpoint/route.ts           # Proxy → NWS gridpoint numerical data
    forecast/route.ts            # Proxy → NWS 7-day text forecast
    hourly/route.ts              # Proxy → NWS hourly forecast
    alerts/route.ts              # Proxy → NWS active alerts

hooks/
  useWeather.ts                  # SWR hook for forecast data
  useWeatherAlerts.ts            # SWR hook for alerts (faster poll)

components/weather/
  WeatherDashboard.tsx           # All-locations overview grid
  LocationWeatherCard.tsx        # Summary card per location
  WeatherDetail.tsx              # Full location detail view
  HourlyTimeline.tsx             # Visual hourly forecast bar/chart
  AlertBanner.tsx                # Severe weather alert banner
  DayWeatherSummary.tsx          # Compact card for Disney day pages

app/weather/
  page.tsx                       # Dashboard page
  [locationId]/
    page.tsx                     # Location detail page
```

---

## Implementation Order

1. **Types + location config** — `types/weather.ts`, `data/weatherLocations.ts` (resolve grid coords for all 8 locations)
2. **NWS API client** — `lib/api/nwsWeather.ts` with unit conversion and error handling
3. **API proxy routes** — `app/api/weather/[locationId]/*` with `revalidate` caching
4. **SWR hooks** — `hooks/useWeather.ts`, `hooks/useWeatherAlerts.ts`
5. **Weather dashboard** — `app/weather/page.tsx` + `WeatherDashboard` + `LocationWeatherCard`
6. **Location detail page** — `app/weather/[locationId]/page.tsx` + `WeatherDetail` + `HourlyTimeline`
7. **Alert system** — `AlertBanner` + `useWeatherAlerts` integration
8. **Disney day page integration** — Add `DayWeatherSummary` to existing `/day/[date]` pages
9. **Navigation** — Add weather link to existing `TripNav`

---

## Open Questions

1. **Contact email for NWS User-Agent** — What email should we use? This is visible in HTTP headers.
2. **Additional locations** — Easy to add more later; just resolve the grid coords via `/points` and add to the config.
3. **Radar/maps** — Phase 2? Could embed NWS radar imagery or integrate Mapbox/Leaflet for interactive maps.
4. **Historical data** — NWS API only provides forecasts (up to 7 days out). For historical weather analysis, we'd need a different source (e.g., Iowa Environmental Mesonet).
5. **Push notifications for severe weather** — Out of scope for Phase 1, but the alert polling infrastructure makes this feasible later.
