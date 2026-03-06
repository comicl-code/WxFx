import type {
  WeatherLocation,
  NWSGridInfo,
  HourlyCondition,
  DayForecast,
  WeatherAlert,
} from '@/types/weather';
import { cToF, kmhToMph, mmToIn, isoDurationToHours } from '@/lib/utils/units';
import { isDaytime } from '@/lib/utils/time';

const NWS_BASE = 'https://api.weather.gov';
const USER_AGENT =
  process.env.NWS_USER_AGENT || 'WxFx/1.0 (michaelccollins@icloud.com)';

// In-memory cache for grid info (resolved once per location per process lifetime)
const gridCache = new Map<string, NWSGridInfo>();

async function nwsFetch(url: string): Promise<Response> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/geo+json',
    },
  });
  if (!res.ok) {
    throw new Error(`NWS API error: ${res.status} ${res.statusText} for ${url}`);
  }
  return res;
}

/** Resolve grid coordinates from /points endpoint. Cached in memory. */
export async function resolveGrid(
  location: WeatherLocation
): Promise<NWSGridInfo> {
  const cached = gridCache.get(location.id);
  if (cached) return cached;

  const res = await nwsFetch(
    `${NWS_BASE}/points/${location.lat},${location.lon}`
  );
  const data = await res.json();
  const props = data.properties;

  const info: NWSGridInfo = {
    office: props.gridId,
    gridX: props.gridX,
    gridY: props.gridY,
    radarStation: props.radarStation,
  };

  gridCache.set(location.id, info);
  return info;
}

/** Fetch raw gridpoint numerical data and transform to HourlyCondition[] */
export async function fetchGridpointData(
  location: WeatherLocation
): Promise<{ hourly: HourlyCondition[]; updateTime: string | null }> {
  const grid = await resolveGrid(location);
  const url = `${NWS_BASE}/gridpoints/${grid.office}/${grid.gridX},${grid.gridY}`;
  const res = await nwsFetch(url);
  const data = await res.json();
  const props = data.properties;
  const updateTime = props.updateTime || null;

  // Build a time-indexed map from the various layers
  const timeMap = new Map<
    string,
    Partial<HourlyCondition>
  >();

  function expandLayer(
    layerName: string,
    field: keyof HourlyCondition,
    transform: (v: number) => number = (v) => v
  ) {
    const layer = props[layerName];
    if (!layer?.values) return;

    for (const entry of layer.values) {
      // entry.validTime = "2026-03-06T10:00:00+00:00/PT1H"
      const [startStr, durationStr] = entry.validTime.split('/');
      const hours = isoDurationToHours(durationStr);
      const start = new Date(startStr);

      for (let h = 0; h < hours; h++) {
        const time = new Date(start.getTime() + h * 3600000).toISOString();
        if (!timeMap.has(time)) timeMap.set(time, {});
        const slot = timeMap.get(time)!;
        (slot as Record<string, unknown>)[field] = transform(entry.value);
      }
    }
  }

  // Expand each NWS layer into our hourly slots
  expandLayer('temperature', 'tempF', cToF);
  expandLayer('apparentTemperature', 'feelsLikeF', cToF);
  expandLayer('probabilityOfPrecipitation', 'precipProbability');
  expandLayer('quantitativePrecipitation', 'precipAmountIn', mmToIn);
  expandLayer('skyCover', 'skyCover');
  expandLayer('windSpeed', 'windSpeedMph', kmhToMph);
  expandLayer('windGust', 'windGustMph', kmhToMph);

  // Extract weather conditions text
  const weatherLayer = props.weather?.values;
  if (weatherLayer) {
    for (const entry of weatherLayer) {
      const [startStr, durationStr] = entry.validTime.split('/');
      const hours = isoDurationToHours(durationStr);
      const start = new Date(startStr);

      for (let h = 0; h < hours; h++) {
        const time = new Date(start.getTime() + h * 3600000).toISOString();
        if (!timeMap.has(time)) timeMap.set(time, {});
        const slot = timeMap.get(time)!;

        // NWS weather values is an array of condition objects
        const conditions = entry.value;
        if (Array.isArray(conditions) && conditions.length > 0) {
          const desc = conditions
            .filter(
              (c: { weather: string | null }) => c.weather && c.weather !== 'null'
            )
            .map(
              (c: { weather: string; intensity: string | null }) =>
                c.intensity && c.intensity !== 'null'
                  ? `${c.intensity} ${c.weather}`
                  : c.weather
            )
            .join(', ');
          slot.conditions = desc || 'Fair';
        }
      }
    }
  }

  // Convert map to sorted array
  const hourly: HourlyCondition[] = Array.from(timeMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, slot]) => ({
      time,
      tempF: slot.tempF ?? 0,
      feelsLikeF: slot.feelsLikeF ?? slot.tempF ?? 0,
      precipProbability: slot.precipProbability ?? 0,
      precipAmountIn: slot.precipAmountIn ?? 0,
      skyCover: slot.skyCover ?? 0,
      windSpeedMph: slot.windSpeedMph ?? 0,
      windGustMph: slot.windGustMph ?? 0,
      conditions: slot.conditions || getDefaultCondition(slot.skyCover ?? 0),
      isDaytime: isDaytime(time),
    }));

  return { hourly, updateTime };
}

function getDefaultCondition(skyCover: number): string {
  if (skyCover < 20) return 'Clear';
  if (skyCover < 50) return 'Partly Cloudy';
  if (skyCover < 85) return 'Mostly Cloudy';
  return 'Cloudy';
}

/** Fetch 7-day text forecast (12-hour periods) */
export async function fetchForecast(
  location: WeatherLocation
): Promise<DayForecast[]> {
  const grid = await resolveGrid(location);
  const url = `${NWS_BASE}/gridpoints/${grid.office}/${grid.gridX},${grid.gridY}/forecast`;
  const res = await nwsFetch(url);
  const data = await res.json();

  return data.properties.periods.map(
    (p: {
      number: number;
      name: string;
      temperature: number;
      windSpeed: string;
      windDirection: string;
      shortForecast: string;
      detailedForecast: string;
      isDaytime: boolean;
      icon: string;
    }) => ({
      number: p.number,
      name: p.name,
      tempF: p.temperature,
      windSpeed: p.windSpeed,
      windDirection: p.windDirection,
      shortForecast: p.shortForecast,
      detailedForecast: p.detailedForecast,
      isDaytime: p.isDaytime,
      icon: p.icon,
    })
  );
}

/** Fetch active alerts for a location */
export async function fetchAlerts(
  location: WeatherLocation
): Promise<WeatherAlert[]> {
  const url = `${NWS_BASE}/alerts/active?point=${location.lat},${location.lon}`;
  const res = await nwsFetch(url);
  const data = await res.json();

  if (!data.features || data.features.length === 0) return [];

  return data.features.map(
    (f: {
      properties: {
        id: string;
        event: string;
        severity: string;
        urgency: string;
        certainty: string;
        headline: string;
        description: string;
        instruction: string | null;
        onset: string;
        expires: string;
        senderName: string;
        areaDesc: string;
      };
    }) => {
      const p = f.properties;
      return {
        id: p.id,
        event: p.event,
        severity: p.severity as WeatherAlert['severity'],
        urgency: p.urgency as WeatherAlert['urgency'],
        certainty: p.certainty,
        headline: p.headline,
        description: p.description,
        instruction: p.instruction,
        onset: p.onset,
        expires: p.expires,
        senderName: p.senderName,
        areaDesc: p.areaDesc,
      };
    }
  );
}
