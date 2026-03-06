import { NextRequest, NextResponse } from 'next/server';
import { getLocation } from '@/data/locations';
import { fetchAlerts } from '@/lib/api/nwsWeather';

export const revalidate = 300; // 5 minutes — alerts need faster refresh

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
    const alerts = await fetchAlerts(location);
    return NextResponse.json({
      locationId,
      alerts,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`Alerts fetch error for ${locationId}:`, err);
    return NextResponse.json(
      { error: 'Failed to fetch alerts', alerts: [] },
      { status: 502 }
    );
  }
}
