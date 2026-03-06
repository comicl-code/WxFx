'use client';

import Link from 'next/link';
import type { WeatherLocation, HourlyCondition, WeatherAlert } from '@/types/weather';

function getCurrentCondition(hourly: HourlyCondition[]): HourlyCondition | null {
  const now = new Date().toISOString();
  // Find the nearest hour
  const future = hourly.filter((h) => h.time >= now);
  return future[0] || hourly[hourly.length - 1] || null;
}

interface Props {
  location: WeatherLocation;
  hourly: HourlyCondition[];
  alerts: WeatherAlert[];
  isLoading: boolean;
}

export default function LocationWeatherCard({
  location,
  hourly,
  alerts,
  isLoading,
}: Props) {
  const current = getCurrentCondition(hourly);
  const severeAlerts = alerts.filter(
    (a) => a.severity === 'Extreme' || a.severity === 'Severe'
  );

  return (
    <Link
      href={`/weather/${location.id}`}
      className={`block rounded-lg border p-4 transition-shadow hover:shadow-md ${
        severeAlerts.length > 0
          ? 'border-red-500 bg-red-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{location.name}</h3>
          <p className="text-xs text-gray-500">{location.state}</p>
        </div>
        {alerts.length > 0 && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              severeAlerts.length > 0
                ? 'bg-red-600 text-white'
                : 'bg-yellow-400 text-gray-900'
            }`}
          >
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="mt-3 animate-pulse">
          <div className="h-8 w-16 rounded bg-gray-200" />
          <div className="mt-1 h-4 w-24 rounded bg-gray-200" />
        </div>
      ) : current ? (
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {current.tempF}°
            </span>
            {current.feelsLikeF !== current.tempF && (
              <span className="text-sm text-gray-500">
                feels {current.feelsLikeF}°
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-gray-600">{current.conditions}</p>
          <div className="mt-1 flex gap-3 text-xs text-gray-500">
            {current.precipProbability > 0 && (
              <span>Rain: {current.precipProbability}%</span>
            )}
            <span>Wind: {current.windSpeedMph} mph</span>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-400">No data available</p>
      )}

      {severeAlerts.length > 0 && (
        <div className="mt-2 rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
          {severeAlerts[0].event}
        </div>
      )}
    </Link>
  );
}
