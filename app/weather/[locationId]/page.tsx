import { notFound } from 'next/navigation';
import { getLocation, WEATHER_LOCATIONS } from '@/data/locations';
import WeatherDetail from '@/components/weather/WeatherDetail';

export function generateStaticParams() {
  return WEATHER_LOCATIONS.map((loc) => ({ locationId: loc.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  const location = getLocation(locationId);
  if (!location) return { title: 'Not Found' };
  return {
    title: `${location.name} Weather — WxFx`,
    description: `Weather forecast for ${location.name}`,
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  const location = getLocation(locationId);
  if (!location) notFound();

  return (
    <div>
      <div className="mb-6">
        <a
          href="/weather"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Dashboard
        </a>
        <h1 className="mt-2 text-2xl font-bold">{location.name}</h1>
        <p className="text-sm text-gray-500">
          {location.lat.toFixed(4)}°N, {Math.abs(location.lon).toFixed(4)}°W
        </p>
      </div>
      <WeatherDetail location={location} />
    </div>
  );
}
