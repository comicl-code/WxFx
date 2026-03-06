'use client';

import { WEATHER_LOCATIONS, getLocationsByRegion } from '@/data/locations';
import { useGridpointData } from '@/hooks/useWeather';
import { useWeatherAlerts } from '@/hooks/useWeatherAlerts';
import LocationWeatherCard from './LocationWeatherCard';
import type { WeatherLocation } from '@/types/weather';

function LocationCard({ location }: { location: WeatherLocation }) {
  const { hourly, isLoading } = useGridpointData(location.id);
  const { alerts } = useWeatherAlerts(location.id);

  return (
    <LocationWeatherCard
      location={location}
      hourly={hourly}
      alerts={alerts}
      isLoading={isLoading}
    />
  );
}

export default function WeatherDashboard() {
  const plains = getLocationsByRegion('southern-plains');
  const wdw = getLocationsByRegion('wdw');

  return (
    <div className="space-y-8">
      {/* Southern Plains */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Southern Plains
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plains.map((loc) => (
            <LocationCard key={loc.id} location={loc} />
          ))}
        </div>
      </section>

      {/* Disney World */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Walt Disney World
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {wdw.map((loc) => (
            <LocationCard key={loc.id} location={loc} />
          ))}
        </div>
      </section>

      {/* Attribution */}
      <p className="text-center text-xs text-gray-400">
        Weather data provided by the National Weather Service (weather.gov)
      </p>
    </div>
  );
}
