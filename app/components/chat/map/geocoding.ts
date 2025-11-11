export interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
}

export async function geocodeLocation(locationName: string, countryHint?: string): Promise<GeocodeResult | null> {
  try {
    if (typeof google === 'undefined' || !google.maps) {
      console.error('Google Maps not loaded');
      return null;
    }

    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      
      const searchQuery = countryHint ? `${locationName}, ${countryHint}` : locationName;
      
      const request: google.maps.GeocoderRequest = {
        address: searchQuery,
        region: countryHint?.toLowerCase().substring(0, 2),
      };
      
      geocoder.geocode(request, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const bestResult = results[0];
          const location = bestResult.geometry.location;
          
          console.log(`Geocoded "${locationName}" to:`, {
            lat: location.lat(),
            lng: location.lng(),
            address: bestResult.formatted_address
          });
          
          resolve({
            name: locationName,
            lat: location.lat(),
            lng: location.lng(),
            address: bestResult.formatted_address,
            placeId: bestResult.place_id,
          });
        } else {
          console.error('Geocoding failed for', locationName, ':', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function geocodeMultipleLocations(
  locationNames: string[]
): Promise<Map<string, GeocodeResult>> {
  const results = new Map<string, GeocodeResult>();
  
  for (const name of locationNames) {
    const result = await geocodeLocation(name);
    if (result) {
      results.set(name, result);
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
}

