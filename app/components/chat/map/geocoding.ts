export interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
  types?: string[];
}

export async function geocodeLocation(locationName: string, countryHint?: string): Promise<GeocodeResult | null> {
  try {
    if (typeof window === 'undefined' || typeof (window as any).google === 'undefined' || !(window as any).google.maps) {
      return null;
    }

    return new Promise((resolve) => {
      const geocoder = new (window as any).google.maps.Geocoder();
      const searchQuery = countryHint ? `${locationName}, ${countryHint}` : locationName;
      const request: google.maps.GeocoderRequest = {
        address: searchQuery,
        region: countryHint ? countryHint.toLowerCase().substring(0, 2) : undefined,
      };

      geocoder.geocode(request, (results: any[], status: any) => {
        if (status === (window as any).google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const bestResult = results[0];
          const location = bestResult.geometry.location;
          resolve({
            name: locationName,
            lat: location.lat(),
            lng: location.lng(),
            address: bestResult.formatted_address,
            placeId: bestResult.place_id,
            types: bestResult.types || [],
          });
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    return null;
  }
}

export async function geocodeMultipleLocations(
  locationNames: string[],
  countryHint?: string
): Promise<Map<string, GeocodeResult>> {
  const results = new Map<string, GeocodeResult>();
  for (const name of locationNames) {
    const result = await geocodeLocation(name, countryHint);
    if (result) results.set(name, result);
    await new Promise((res) => setTimeout(res, 200));
  }
  return results;
}
