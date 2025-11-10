/**
 * Geocoding utilities for location processing
 * Uses client-side Google Maps Geocoder API
 */

export interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

/**
 * Geocode a location name to coordinates using Google Maps JavaScript API
 */
export async function geocodeLocation(locationName: string): Promise<GeocodeResult | null> {
  try {
    // Check if Google Maps is loaded
    if (typeof google === 'undefined' || !google.maps) {
      console.error('Google Maps not loaded');
      return null;
    }

    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address: locationName }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            name: locationName,
            lat: location.lat(),
            lng: location.lng(),
            address: results[0].formatted_address,
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

