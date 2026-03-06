'use client';

import type { WeatherAlert } from '@/types/weather';

const SEVERITY_STYLES: Record<string, string> = {
  Extreme: 'bg-purple-700 text-white border-purple-900',
  Severe: 'bg-red-600 text-white border-red-800',
  Moderate: 'bg-orange-500 text-white border-orange-700',
  Minor: 'bg-yellow-400 text-gray-900 border-yellow-600',
  Unknown: 'bg-gray-500 text-white border-gray-700',
};

const SEVERITY_ICONS: Record<string, string> = {
  Extreme: '!!',
  Severe: '!',
  Moderate: '*',
  Minor: '-',
  Unknown: '?',
};

function AlertItem({ alert }: { alert: WeatherAlert }) {
  const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.Unknown;
  const icon = SEVERITY_ICONS[alert.severity] || '?';

  return (
    <div className={`rounded-md border-2 p-3 ${style}`}>
      <div className="flex items-start gap-2">
        <span className="shrink-0 rounded bg-black/20 px-1.5 py-0.5 text-xs font-bold">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold">{alert.event}</h3>
          {alert.headline && (
            <p className="mt-0.5 text-sm opacity-90">{alert.headline}</p>
          )}
          {alert.instruction && (
            <p className="mt-1 text-xs opacity-80">{alert.instruction}</p>
          )}
          <p className="mt-1 text-xs opacity-70">
            Expires:{' '}
            {new Date(alert.expires).toLocaleString('en-US', {
              weekday: 'short',
              hour: 'numeric',
              minute: '2-digit',
            })}
            {' | '}
            {alert.senderName}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AlertBanner({ alerts }: { alerts: WeatherAlert[] }) {
  if (alerts.length === 0) return null;

  // Sort: Extreme first, then Severe, etc.
  const severityOrder = ['Extreme', 'Severe', 'Moderate', 'Minor', 'Unknown'];
  const sorted = [...alerts].sort(
    (a, b) =>
      severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  return (
    <div className="space-y-2">
      {sorted.map((alert) => (
        <AlertItem key={alert.id} alert={alert} />
      ))}
    </div>
  );
}
