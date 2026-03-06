'use client';

import type { HourlyCondition } from '@/types/weather';

function precipColor(prob: number): string {
  if (prob >= 70) return 'bg-blue-600';
  if (prob >= 40) return 'bg-blue-400';
  if (prob >= 20) return 'bg-blue-200';
  return 'bg-gray-100';
}

function tempColor(tempF: number): string {
  if (tempF >= 100) return 'text-red-700';
  if (tempF >= 90) return 'text-red-500';
  if (tempF >= 80) return 'text-orange-500';
  if (tempF >= 70) return 'text-yellow-600';
  if (tempF >= 60) return 'text-green-600';
  if (tempF >= 50) return 'text-cyan-600';
  if (tempF >= 40) return 'text-blue-500';
  return 'text-blue-700';
}

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
  });
}

interface Props {
  hourly: HourlyCondition[];
  maxHours?: number;
}

export default function HourlyTimeline({ hourly, maxHours = 48 }: Props) {
  // Filter to only future hours, limit count
  const now = new Date().toISOString();
  const future = hourly
    .filter((h) => h.time >= now)
    .slice(0, maxHours);

  if (future.length === 0) {
    return (
      <p className="text-sm text-gray-500">No hourly data available</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-0.5" style={{ minWidth: 'max-content' }}>
        {future.map((h) => {
          const barHeight = Math.max(4, (h.precipProbability / 100) * 60);
          return (
            <div
              key={h.time}
              className="flex w-14 flex-col items-center gap-0.5 text-center"
            >
              {/* Time */}
              <span className="text-[10px] text-gray-500">
                {formatHour(h.time)}
              </span>
              {/* Temp */}
              <span className={`text-sm font-semibold ${tempColor(h.tempF)}`}>
                {h.tempF}°
              </span>
              {/* Precip bar */}
              <div className="flex h-16 w-6 flex-col justify-end rounded-sm bg-gray-50">
                <div
                  className={`w-full rounded-sm ${precipColor(h.precipProbability)}`}
                  style={{ height: `${barHeight}px` }}
                />
              </div>
              {/* Precip % */}
              <span className="text-[10px] text-gray-400">
                {h.precipProbability > 0 ? `${h.precipProbability}%` : ''}
              </span>
              {/* Wind */}
              <span className="text-[10px] text-gray-400">
                {h.windSpeedMph > 0 ? `${h.windSpeedMph}` : ''}
              </span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="mt-2 flex gap-4 text-[10px] text-gray-400">
        <span>Temp (°F)</span>
        <span>Precip %</span>
        <span>Wind (mph)</span>
      </div>
    </div>
  );
}
