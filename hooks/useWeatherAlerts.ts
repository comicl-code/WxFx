'use client';

import useSWR from 'swr';
import type { WeatherAlert } from '@/types/weather';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface AlertsResponse {
  locationId: string;
  alerts: WeatherAlert[];
  fetchedAt: string;
  error?: string;
}

/** Fetch active alerts for a location. Polls every 5 min. */
export function useWeatherAlerts(locationId: string | null) {
  const { data, error, isLoading } = useSWR<AlertsResponse>(
    locationId ? `/api/weather/${locationId}/alerts` : null,
    fetcher,
    { refreshInterval: 300_000 } // 5 min
  );

  return {
    alerts: data?.alerts ?? [],
    fetchedAt: data?.fetchedAt ?? null,
    isLoading,
    error: error || (data?.error ? new Error(data.error) : null),
  };
}

/** Fetch alerts for multiple locations at once */
export function useMultiLocationAlerts(locationIds: string[]) {
  // SWR doesn't natively support multi-key, so we use individual hooks
  // This hook is a convenience wrapper for dashboard use
  const results = locationIds.map((id) => ({
    locationId: id,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ...useWeatherAlerts(id),
  }));

  return {
    alertsByLocation: results,
    totalAlerts: results.reduce((sum, r) => sum + r.alerts.length, 0),
    hasWarnings: results.some((r) =>
      r.alerts.some(
        (a) => a.severity === 'Extreme' || a.severity === 'Severe'
      )
    ),
  };
}
