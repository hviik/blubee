import { Place, PlaceType, PlacesSearchRequest, PlacesSearchResponse } from '@/app/types/itinerary';

const placeTypeMapping: Record<PlaceType, string[]> = {
  stays: ['lodging', 'hotel'],
  restaurants: ['restaurant', 'cafe', 'food'],
  attraction: ['tourist_attraction', 'museum', 'art_gallery', 'landmark'],
  activities: ['amusement_park', 'aquarium', 'zoo', 'park', 'stadium'],
  locations: ['point_of_interest'],
};

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

function inferPlaceType(types: string[]): PlaceType {
  for (const [placeType, googleTypes] of Object.entries(placeTypeMapping)) {
    if (types.some((type) => googleTypes.includes(type))) {
      return placeType as PlaceType;
    }
  }
  return 'locations';
}

function generateId(): string {
  return `place_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}


