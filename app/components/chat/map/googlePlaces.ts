import { Place, PlaceType, PlacesSearchRequest } from '@/app/types/itinerary';

const placeTypeMapping: Record<PlaceType, string[]> = {
  stays: ['lodging', 'hotel'],
  restaurants: ['restaurant', 'cafe', 'food'],
  attraction: ['tourist_attraction', 'museum', 'art_gallery', 'point_of_interest'],
  activities: ['amusement_park', 'aquarium', 'zoo', 'park', 'stadium'],
  locations: ['point_of_interest'],
};

function clampRadius(radius?: number) {
  if (!radius) return 2000;
  if (radius < 100) return 100;
  if (radius > 4000) return 4000;
  return radius;
}

function runNearbySearch(service: google.maps.places.PlacesService, req: google.maps.places.PlaceSearchRequest) {
  return new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
    service.nearbySearch(req, (results, status, pagination) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results);
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([]);
      } else {
        reject(new Error(`Places search failed: ${status}`));
      }
    });
  });
}

export async function searchPlaces(
  map: google.maps.Map,
  request: PlacesSearchRequest
): Promise<Place[]> {
  const service = new google.maps.places.PlacesService(map);
  const types = request.type ? placeTypeMapping[request.type] : undefined;
  const radius = clampRadius(request.radius);
  const location = new google.maps.LatLng(request.location.lat, request.location.lng);
  const allResultsMap = new Map<string, google.maps.places.PlaceResult>();
  const keywords = request.keyword ? [request.keyword] : [undefined];

  const typeList = types && types.length > 0 ? types : [undefined];

  for (const type of typeList) {
    for (const kw of keywords) {
      const searchRequest: google.maps.places.PlaceSearchRequest = {
        location,
        radius,
        type: type as any,
        keyword: kw,
      };
      try {
        const results = await runNearbySearch(service, searchRequest);
        for (const r of results) {
          if (r.place_id) allResultsMap.set(r.place_id, r);
        }
      } catch (e) {
        continue;
      }
    }
  }

  const places: Place[] = Array.from(allResultsMap.values()).map((result) =>
    convertToPlace(result, request.type)
  );

  return places;
}

export async function getPlaceDetails(
  map: google.maps.Map,
  placeId: string
): Promise<google.maps.places.PlaceResult | null> {
  const service = new google.maps.places.PlacesService(map);
  return new Promise((resolve, reject) => {
    service.getDetails(
      {
        placeId,
        fields: ['name', 'rating', 'formatted_address', 'geometry', 'photos', 'price_level', 'types', 'place_id', 'url', 'vicinity'],
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
) {
  const location = result.geometry?.location;
  return {
    id: result.place_id || generateId(),
    name: result.name || 'Unknown',
    type: type || inferPlaceType(result.types || []),
    location: {
      lat: location?.lat() || 0,
      lng: location?.lng() || 0,
    },
    address: result.vicinity || result.formatted_address,
    rating: result.rating,
    priceLevel: result.price_level,
    photoUrl: result.photos?.[0]?.getUrl({ maxWidth: 400 }),
    placeId: result.place_id,
  } as Place;
}

function inferPlaceType(types: string[]) {
  for (const [placeType, googleTypes] of Object.entries(placeTypeMapping)) {
    if (types.some((t) => googleTypes.includes(t))) return placeType as PlaceType;
  }
  return 'locations' as PlaceType;
}

function generateId(): string {
  return `place_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
