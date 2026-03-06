/** Format ISO timestamp to readable time (e.g. "3:00 PM") */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago', // default; components can override
  });
}

/** Format ISO timestamp to short date (e.g. "Mar 15") */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Chicago',
  });
}

/** Format ISO timestamp to day name (e.g. "Saturday") */
export function formatDayName(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'America/Chicago',
  });
}

/** Get hour (0-23) from ISO timestamp */
export function getHour(iso: string): number {
  return new Date(iso).getHours();
}

/** Check if an ISO timestamp is daytime (6 AM - 8 PM) */
export function isDaytime(iso: string): boolean {
  const hour = getHour(iso);
  return hour >= 6 && hour < 20;
}

/** Get relative time string (e.g. "5 min ago") */
export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
