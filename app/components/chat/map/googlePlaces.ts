/**
 * Utility functions for Google Places API integration
 */

import { Place, PlaceType, PlacesSearchRequest, PlacesSearchResponse } from '@/app/types/itinerary';

/**
 * Maps our PlaceType to Google Places API types
 */
const placeTypeMapping: Record<PlaceType, string[]> = {
  stays: ['lodging', 'hotel'],
  restaurants: ['restaurant', 'cafe', 'food'],
  attraction: ['tourist_attraction', 'museum', 'art_gallery', 'landmark'],
  activities: ['amusement_park', 'aquarium', 'zoo', 'park', 'stadium'],
  locations: ['point_of_interest'],
};

/**
 * Search for places using Google Places API (client-side)
 * Note: This uses the Places Library from Google Maps JavaScript API
 */
export async function searchPlaces(
  map: google.maps.Map,
  request: PlacesSearchRequest
): Promise<Place[]> {
  return new Promise((resolve, reject) => {
    const service = new google.maps.places.PlacesService(map);
    
    const types = request.type ? placeTypeMapping[request.type] : undefined;
    
    const searchRequest: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(request.location.lat, request.location.lng),
      radius: request.radius,
      type: types?.[0],
      keyword: request.keyword,
    };

    service.nearbySearch(searchRequest, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const places: Place[] = results.map((result) => convertToPlace(result, request.type));
        resolve(places);
      } else {
        reject(new Error(`Places search failed: ${status}`));
      }
    });
  });
}

/**
 * Get place details using Google Places API
 */
export async function getPlaceDetails(
  map: google.maps.Map,
  placeId: string
): Promise<google.maps.places.PlaceResult | null> {
  return new Promise((resolve, reject) => {
    const service = new google.maps.places.PlacesService(map);
    
    service.getDetails(
      {
        placeId,
        fields: ['name', 'rating', 'formatted_address', 'geometry', 'photos', 'price_level', 'types'],
      },
      (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Place details fetch failed: ${status}`));
        }
      }
    );
  });
}

/**
 * Convert Google Places result to our Place interface
 */
function convertToPlace(
  result: google.maps.places.PlaceResult,
  type?: PlaceType
): Place {
  const location = result.geometry?.location;
  
  return {
    id: result.place_id || generateId(),
    name: result.name || 'Unknown',
    type: type || inferPlaceType(result.types || []),
    location: {
      lat: location?.lat() || 0,
      lng: location?.lng() || 0,
    },
    address: result.vicinity,
    rating: result.rating,
    priceLevel: result.price_level,
    photoUrl: result.photos?.[0]?.getUrl({ maxWidth: 400 }),
    placeId: result.place_id,
  };
}

/**
 * Infer our PlaceType from Google Places types array
 */
function inferPlaceType(types: string[]): PlaceType {
  for (const [placeType, googleTypes] of Object.entries(placeTypeMapping)) {
    if (types.some((type) => googleTypes.includes(type))) {
      return placeType as PlaceType;
    }
  }
  return 'locations'; // default
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `place_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Geocode an address to coordinates using Google Geocoding API
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        console.error('Geocoding failed:', status);
        resolve(null);
      }
    });
  });
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        resolve(results[0].formatted_address);
      } else {
        console.error('Reverse geocoding failed:', status);
        resolve(null);
      }
    });
  });
}

/**
 * Calculate distance between two points using Google Maps Geometry Library
 */
export function calculateDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const fromLatLng = new google.maps.LatLng(from.lat, from.lng);
  const toLatLng = new google.maps.LatLng(to.lat, to.lng);
  
  return google.maps.geometry.spherical.computeDistanceBetween(fromLatLng, toLatLng);
}

/**
 * Search places near multiple locations (for entire trip)
 */
export async function searchPlacesForTrip(
  map: google.maps.Map,
  locations: Array<{ lat: number; lng: number; name: string }>,
  placeType: PlaceType,
  radius: number = 5000 // 5km default
): Promise<Map<string, Place[]>> {
  const placesByLocation = new Map<string, Place[]>();
  
  for (const location of locations) {
    try {
      const places = await searchPlaces(map, {
        location: { lat: location.lat, lng: location.lng },
        radius,
        type: placeType,
      });
      placesByLocation.set(location.name, places);
    } catch (error) {
      console.error(`Failed to fetch places for ${location.name}:`, error);
      placesByLocation.set(location.name, []);
    }
  }
  
  return placesByLocation;
}

