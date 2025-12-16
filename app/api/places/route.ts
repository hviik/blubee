import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface PlaceResult {
  id: string;
  name: string;
  type: 'stays' | 'restaurants' | 'attraction' | 'activities' | 'locations';
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  priceLevel?: number;
  placeId?: string;
}

const placeTypeMapping: Record<string, string> = {
  stays: 'lodging',
  restaurants: 'restaurant',
  attraction: 'tourist_attraction',
  activities: 'park',
};

export async function POST(req: NextRequest) {
  try {
    const { lat, lng, type, radius = 5000 } = await req.json();

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY is not set');
      return NextResponse.json({ error: 'Places service not configured' }, { status: 500 });
    }

    const placeType = type ? placeTypeMapping[type] || type : 'tourist_attraction';
    const clampedRadius = Math.min(Math.max(radius, 100), 50000);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${clampedRadius}&type=${placeType}&key=${apiKey}`
    );

    if (!response.ok) {
      console.error('Places API error:', response.statusText);
      return NextResponse.json({ error: 'Places search failed' }, { status: 500 });
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API status:', data.status, data.error_message);
      return NextResponse.json({ error: data.error_message || 'Places search failed' }, { status: 500 });
    }

    const places: PlaceResult[] = (data.results || []).map((result: any) => ({
      id: result.place_id || `place_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: result.name,
      type: type || inferPlaceType(result.types || []),
      lat: result.geometry?.location?.lat || 0,
      lng: result.geometry?.location?.lng || 0,
      address: result.vicinity || result.formatted_address,
      rating: result.rating,
      priceLevel: result.price_level,
      placeId: result.place_id,
    }));

    return NextResponse.json({ places });
  } catch (error: any) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

function inferPlaceType(types: string[]): PlaceResult['type'] {
  if (types.includes('lodging') || types.includes('hotel')) return 'stays';
  if (types.includes('restaurant') || types.includes('cafe') || types.includes('food')) return 'restaurants';
  if (types.includes('tourist_attraction') || types.includes('museum') || types.includes('art_gallery')) return 'attraction';
  if (types.includes('park') || types.includes('amusement_park') || types.includes('zoo')) return 'activities';
  return 'locations';
}

