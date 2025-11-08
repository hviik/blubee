/**
 * Geocoding utilities for location processing
 */

export interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

/**
 * Geocode a location name to coordinates
 */
export async function geocodeLocation(locationName: string): Promise<GeocodeResult | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results[0]) {
      const result = data.results[0];
      return {
        name: locationName,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        address: result.formatted_address,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Geocode multiple locations in batch
 */
export async function geocodeMultipleLocations(
  locationNames: string[]
): Promise<Map<string, GeocodeResult>> {
  const results = new Map<string, GeocodeResult>();
  
  for (const name of locationNames) {
    const result = await geocodeLocation(name);
    if (result) {
      results.set(name, result);
    }
    // Rate limit: wait 200ms between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
}

