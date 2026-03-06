'use client';

import type { DayForecast } from '@/types/weather';

interface Props {
  forecast: DayForecast[];
}

export default function ForecastPeriods({ forecast }: Props) {
  if (forecast.length === 0) {
    return <p className="text-sm text-gray-500">No forecast data available</p>;
  }

  return (
    <div className="space-y-3">
      {forecast.map((period) => (
        <div
          key={period.number}
          className={`rounded-lg border p-3 ${
            period.isDaytime
              ? 'border-gray-200 bg-white'
              : 'border-gray-300 bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{period.name}</h4>
              <p className="text-sm text-gray-600">{period.shortForecast}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">
                {period.tempF}°
              </span>
              <p className="text-xs text-gray-500">
                {period.windSpeed} {period.windDirection}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {period.detailedForecast}
          </p>
        </div>
      ))}
    </div>
  );
}
