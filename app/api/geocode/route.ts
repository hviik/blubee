import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
  types?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { locations, countryHint } = await req.json();

    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return NextResponse.json({ error: 'Locations array is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY is not set');
      return NextResponse.json({ error: 'Geocoding service not configured' }, { status: 500 });
    }

    const results: GeocodeResult[] = [];

    for (const location of locations) {
      const searchQuery = countryHint ? `${location}, ${countryHint}` : location;
      
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}`
        );

        if (!response.ok) {
          console.error(`Geocoding failed for ${location}:`, response.statusText);
          results.push({ name: location, lat: 0, lng: 0 });
          continue;
        }

        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const result = data.results[0];
          results.push({
            name: location,
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            address: result.formatted_address,
            placeId: result.place_id,
            types: result.types || [],
          });
        } else {
          console.warn(`No results for ${location}:`, data.status);
          results.push({ name: location, lat: 0, lng: 0 });
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error geocoding ${location}:`, error);
        results.push({ name: location, lat: 0, lng: 0 });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Geocode API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

