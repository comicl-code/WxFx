'use client';

import type { WeatherLocation, HourlyCondition } from '@/types/weather';
import { useGridpointData, useForecast } from '@/hooks/useWeather';
import { useWeatherAlerts } from '@/hooks/useWeatherAlerts';
import { timeAgo } from '@/lib/utils/time';
import AlertBanner from './AlertBanner';
import HourlyTimeline from './HourlyTimeline';
import ForecastPeriods from './ForecastPeriods';

interface Props {
  location: WeatherLocation;
}

export default function WeatherDetail({ location }: Props) {
  const {
    hourly,
    nwsUpdateTime,
    fetchedAt: gridFetchedAt,
    isLoading: gridLoading,
  } = useGridpointData(location.id);
  const { forecast, isLoading: forecastLoading } = useForecast(location.id);
  const { alerts } = useWeatherAlerts(location.id);

  // Current conditions = nearest future hour
  const now = new Date().toISOString();
  const current = hourly.find((h) => h.time >= now) || hourly[0];

  return (
    <div className="space-y-6">
      {/* Alerts */}
      <AlertBanner alerts={alerts} />

      {/* Current Conditions */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Current Conditions
        </h2>
        {gridLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-12 w-24 rounded bg-gray-200" />
            <div className="h-4 w-48 rounded bg-gray-200" />
          </div>
        ) : current ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">Temperature</p>
              <p className="text-4xl font-bold text-gray-900">
                {current.tempF}°F
              </p>
              {current.feelsLikeF !== current.tempF && (
                <p className="text-sm text-gray-500">
                  Feels like {current.feelsLikeF}°F
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Conditions</p>
              <p className="text-lg font-medium text-gray-900">
                {current.conditions}
              </p>
              <p className="text-sm text-gray-500">
                Sky cover: {current.skyCover}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Precipitation</p>
              <p className="text-lg font-medium text-gray-900">
                {current.precipProbability}% chance
              </p>
              {current.precipAmountIn > 0 && (
                <p className="text-sm text-gray-500">
                  {current.precipAmountIn}&quot; expected
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Wind</p>
              <p className="text-lg font-medium text-gray-900">
                {current.windSpeedMph} mph
              </p>
              {current.windGustMph > current.windSpeedMph && (
                <p className="text-sm text-gray-500">
                  Gusts to {current.windGustMph} mph
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No current data available</p>
        )}
        {gridFetchedAt && (
          <p className="mt-3 text-xs text-gray-400">
            Updated {timeAgo(gridFetchedAt)}
            {nwsUpdateTime && (
              <span> | NWS data from {timeAgo(nwsUpdateTime)}</span>
            )}
          </p>
        )}
      </section>

      {/* Hourly Timeline */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Hourly Forecast
        </h2>
        {gridLoading ? (
          <div className="h-32 animate-pulse rounded bg-gray-200" />
        ) : (
          <HourlyTimeline hourly={hourly} maxHours={48} />
        )}
      </section>

      {/* 7-Day Forecast */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          7-Day Forecast
        </h2>
        {forecastLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded bg-gray-200" />
            ))}
          </div>
        ) : (
          <ForecastPeriods forecast={forecast} />
        )}
      </section>

      {/* Hourly Data Table */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Detailed Hourly Data
        </h2>
        {gridLoading ? (
          <div className="h-48 animate-pulse rounded bg-gray-200" />
        ) : (
          <HourlyTable hourly={hourly} />
        )}
      </section>

      <p className="text-center text-xs text-gray-400">
        Weather data provided by the National Weather Service (weather.gov)
      </p>
    </div>
  );
}

function HourlyTable({ hourly }: { hourly: HourlyCondition[] }) {
  const now = new Date().toISOString();
  const rows = hourly.filter((h) => h.time >= now).slice(0, 72);

  if (rows.length === 0) return <p className="text-sm text-gray-500">No data</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-gray-500">
            <th className="py-2 pr-3">Time</th>
            <th className="py-2 pr-3">Temp</th>
            <th className="py-2 pr-3">Feels</th>
            <th className="py-2 pr-3">Precip</th>
            <th className="py-2 pr-3">Sky</th>
            <th className="py-2 pr-3">Wind</th>
            <th className="py-2 pr-3">Gust</th>
            <th className="py-2">Conditions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => (
            <tr
              key={h.time}
              className={`border-b border-gray-100 ${
                h.precipProbability >= 60 ? 'bg-blue-50' : ''
              }`}
            >
              <td className="py-1.5 pr-3 text-gray-600">
                {new Date(h.time).toLocaleString('en-US', {
                  weekday: 'short',
                  hour: 'numeric',
                })}
              </td>
              <td className="py-1.5 pr-3 font-medium">{h.tempF}°</td>
              <td className="py-1.5 pr-3 text-gray-500">{h.feelsLikeF}°</td>
              <td className="py-1.5 pr-3">
                {h.precipProbability > 0 ? `${h.precipProbability}%` : '-'}
              </td>
              <td className="py-1.5 pr-3 text-gray-500">{h.skyCover}%</td>
              <td className="py-1.5 pr-3">{h.windSpeedMph}</td>
              <td className="py-1.5 pr-3 text-gray-500">
                {h.windGustMph > h.windSpeedMph ? h.windGustMph : '-'}
              </td>
              <td className="py-1.5 text-gray-600">{h.conditions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
