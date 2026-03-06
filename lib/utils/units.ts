/** Convert Celsius to Fahrenheit */
export function cToF(c: number): number {
  return Math.round(c * 1.8 + 32);
}

/** Convert km/h to mph */
export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

/** Convert mm to inches */
export function mmToIn(mm: number): number {
  return Math.round(mm * 0.0393701 * 100) / 100;
}

/** Parse NWS unit+value string like "wmoUnit:degC" */
export function parseNWSUnit(uom: string): string {
  return uom.replace('wmoUnit:', '');
}

/**
 * Parse ISO 8601 duration (e.g. "PT1H", "PT3H") to hours.
 * NWS uses these for time series intervals.
 */
export function isoDurationToHours(duration: string): number {
  const match = duration.match(/PT(\d+)H/);
  return match ? parseInt(match[1], 10) : 1;
}
