import { NextRequest, NextResponse } from 'next/server';
import { getLocation } from '@/data/locations';
import { fetchGridpointData } from '@/lib/api/nwsWeather';

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
    const { hourly, updateTime } = await fetchGridpointData(location);
    return NextResponse.json({
      locationId,
      hourly,
      nwsUpdateTime: updateTime,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`Gridpoint fetch error for ${locationId}:`, err);
    return NextResponse.json(
      { error: 'Failed to fetch gridpoint data', hourly: [] },
      { status: 502 }
    );
  }
}
