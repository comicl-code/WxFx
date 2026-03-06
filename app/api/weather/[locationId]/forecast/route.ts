import { NextRequest, NextResponse } from 'next/server';
import { getLocation } from '@/data/locations';
import { fetchForecast } from '@/lib/api/nwsWeather';

export const revalidate = 900; // 15 minutes

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params;
  const location = getLocation(locationId);

  if (!location) {
    return NextResponse.json({ error: 'Unknown location' }, { status: 404 });
  }

  try {
    const forecast = await fetchForecast(location);
    return NextResponse.json({
      locationId,
      forecast,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`Forecast fetch error for ${locationId}:`, err);
    return NextResponse.json(
      { error: 'Failed to fetch forecast', forecast: [] },
      { status: 502 }
    );
  }
}
