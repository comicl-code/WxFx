'use client';

import useSWR from 'swr';
import type { HourlyCondition, DayForecast } from '@/types/weather';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface GridpointResponse {
  locationId: string;
  hourly: HourlyCondition[];
  nwsUpdateTime: string | null;
  fetchedAt: string;
  error?: string;
}

interface ForecastResponse {
  locationId: string;
  forecast: DayForecast[];
  fetchedAt: string;
  error?: string;
}

/** Fetch hourly gridpoint data for a location. Polls every 15 min. */
export function useGridpointData(locationId: string | null) {
  const { data, error, isLoading } = useSWR<GridpointResponse>(
    locationId ? `/api/weather/${locationId}/gridpoint` : null,
    fetcher,
    { refreshInterval: 900_000 } // 15 min
  );

  return {
    hourly: data?.hourly ?? [],
    nwsUpdateTime: data?.nwsUpdateTime ?? null,
    fetchedAt: data?.fetchedAt ?? null,
    isLoading,
    error: error || (data?.error ? new Error(data.error) : null),
  };
}

/** Fetch 7-day text forecast for a location. Polls every 15 min. */
export function useForecast(locationId: string | null) {
  const { data, error, isLoading } = useSWR<ForecastResponse>(
    locationId ? `/api/weather/${locationId}/forecast` : null,
    fetcher,
    { refreshInterval: 900_000 }
  );

  return {
    forecast: data?.forecast ?? [],
    fetchedAt: data?.fetchedAt ?? null,
    isLoading,
    error: error || (data?.error ? new Error(data.error) : null),
  };
}
