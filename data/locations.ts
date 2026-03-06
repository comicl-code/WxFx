import type { WeatherLocation } from '@/types/weather';

export const WEATHER_LOCATIONS: WeatherLocation[] = [
  // Southern Plains
  {
    id: 'okc',
    name: 'Oklahoma City, OK',
    shortName: 'OKC',
    lat: 35.4676,
    lon: -97.5164,
    region: 'southern-plains',
    state: 'OK',
  },
  {
    id: 'tulsa',
    name: 'Tulsa, OK',
    shortName: 'Tulsa',
    lat: 36.154,
    lon: -95.9928,
    region: 'southern-plains',
    state: 'OK',
  },
  {
    id: 'springfield-mo',
    name: 'Springfield, MO',
    shortName: 'Springfield',
    lat: 37.209,
    lon: -93.2923,
    region: 'southern-plains',
    state: 'MO',
  },
  {
    id: 'dallas',
    name: 'Dallas, TX',
    shortName: 'Dallas',
    lat: 32.7767,
    lon: -96.797,
    region: 'southern-plains',
    state: 'TX',
  },
  // Disney World
  {
    id: 'wdw-mk',
    name: 'Magic Kingdom',
    shortName: 'MK',
    lat: 28.3772,
    lon: -81.5707,
    region: 'wdw',
    state: 'FL',
  },
  {
    id: 'wdw-ep',
    name: 'EPCOT',
    shortName: 'EPCOT',
    lat: 28.3747,
    lon: -81.5494,
    region: 'wdw',
    state: 'FL',
  },
  {
    id: 'wdw-hs',
    name: 'Hollywood Studios',
    shortName: 'HS',
    lat: 28.3575,
    lon: -81.5583,
    region: 'wdw',
    state: 'FL',
  },
  {
    id: 'wdw-ak',
    name: 'Animal Kingdom',
    shortName: 'AK',
    lat: 28.3553,
    lon: -81.5901,
    region: 'wdw',
    state: 'FL',
  },
];

export function getLocation(id: string): WeatherLocation | undefined {
  return WEATHER_LOCATIONS.find((loc) => loc.id === id);
}

export function getLocationsByRegion(region: string): WeatherLocation[] {
  return WEATHER_LOCATIONS.filter((loc) => loc.region === region);
}
