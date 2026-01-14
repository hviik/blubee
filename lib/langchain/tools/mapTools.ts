import { tool } from "@langchain/core/tools";
import { z } from "zod";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const placeTypeMapping: Record<string, string> = {
  stays: 'lodging',
  restaurants: 'restaurant',
  attraction: 'tourist_attraction',
  activities: 'park',
};

interface GeocodedPlace {
  name: string;
  type: string;
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
}

/**
 * Geocode a specific place using Google Places Text Search
 */
async function geocodePlaceByName(
  placeName: string, 
  countryHint?: string,
  placeType?: string
): Promise<GeocodedPlace | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;

  try {
    const searchQuery = countryHint ? `${placeName}, ${countryHint}` : placeName;
    const googleType = placeType ? placeTypeMapping[placeType] : undefined;
    
    // Use Text Search API for more accurate place finding
    const params = new URLSearchParams({
      query: searchQuery,
      key: GOOGLE_MAPS_API_KEY,
    });
    
    if (googleType) {
      params.set('type', googleType);
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`
    );

    if (!response.ok) {
      console.error('[MapTools] Place search failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results?.length > 0) {
      const result = data.results[0];
      return {
        name: placeName,
        type: placeType || 'attraction',
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        address: result.formatted_address,
        placeId: result.place_id,
      };
    }

    // Fallback to geocoding API if place search doesn't work
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (geocodeResponse.ok) {
      const geocodeData = await geocodeResponse.json();
      if (geocodeData.status === 'OK' && geocodeData.results?.length > 0) {
        const result = geocodeData.results[0];
        return {
          name: placeName,
          type: placeType || 'attraction',
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          address: result.formatted_address,
          placeId: result.place_id,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[MapTools] Place geocoding error:', error);
    return null;
  }
}

function inferPlaceType(types: string[]): string {
  if (types.includes('lodging') || types.includes('hotel')) return 'stays';
  if (types.includes('restaurant') || types.includes('cafe') || types.includes('food') || types.includes('meal_takeaway')) return 'restaurants';
  if (types.includes('tourist_attraction') || types.includes('museum') || types.includes('art_gallery') || types.includes('church') || types.includes('temple') || types.includes('landmark')) return 'attraction';
  if (types.includes('park') || types.includes('amusement_park') || types.includes('zoo') || types.includes('aquarium') || types.includes('stadium') || types.includes('spa')) return 'activities';
  return 'attraction';
}

export const geocodeLocationsTool = tool(
  async ({ locations, countryHint }) => {
    if (!GOOGLE_MAPS_API_KEY) {
      return JSON.stringify({
        success: false,
        error: "Geocoding service not configured"
      });
    }

    try {
      const results: Array<{
        name: string;
        lat: number;
        lng: number;
        address?: string;
        placeId?: string;
      }> = [];

      for (const location of locations) {
        const searchQuery = countryHint ? `${location}, ${countryHint}` : location;

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`
          );

          if (!response.ok) {
            results.push({ name: location, lat: 0, lng: 0 });
            continue;
          }

          const data = await response.json();

          if (data.status === 'OK' && data.results?.length > 0) {
            const result = data.results[0];
            results.push({
              name: location,
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng,
              address: result.formatted_address,
              placeId: result.place_id,
            });
          } else {
            results.push({ name: location, lat: 0, lng: 0 });
          }

          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          results.push({ name: location, lat: 0, lng: 0 });
        }
      }

      return JSON.stringify({
        success: true,
        locations: results
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        error: error?.message || 'Geocoding failed'
      });
    }
  },
  {
    name: "geocode_locations",
    description: "Get coordinates (latitude/longitude) for places in an itinerary. Use this when creating itineraries to get map coordinates for each location. Call this with all the main locations/cities in the trip.",
    schema: z.object({
      locations: z.array(z.string()).describe("Array of location names to geocode, e.g. ['Seminyak', 'Ubud', 'Kuta']"),
      countryHint: z.string().optional().describe("Country name to improve accuracy, e.g. 'Indonesia' or 'Thailand'")
    })
  }
);

export const searchNearbyPlacesTool = tool(
  async ({ lat, lng, type, locationName, radius = 5000 }) => {
    if (!GOOGLE_MAPS_API_KEY) {
      return JSON.stringify({
        success: false,
        error: "Places service not configured"
      });
    }

    try {
      const googleType = type ? placeTypeMapping[type] || type : 'tourist_attraction';
      const clampedRadius = Math.min(Math.max(radius, 100), 50000);

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${clampedRadius}&type=${googleType}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (!response.ok) {
        return JSON.stringify({
          success: false,
          error: 'Places search failed'
        });
      }

      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        return JSON.stringify({
          success: false,
          error: data.error_message || 'Places search failed'
        });
      }

      const places = (data.results || []).slice(0, 10).map((result: any) => ({
        id: result.place_id || `place_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name: result.name,
        type: type || inferPlaceType(result.types || []),
        location: {
          lat: result.geometry?.location?.lat || 0,
          lng: result.geometry?.location?.lng || 0,
        },
        address: result.vicinity,
        rating: result.rating,
        priceLevel: result.price_level,
        placeId: result.place_id,
      }));

      return JSON.stringify({
        success: true,
        locationName,
        places
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        error: error?.message || 'Places search failed'
      });
    }
  },
  {
    name: "search_nearby_places",
    description: "Search for nearby places like restaurants, hotels, or attractions around a specific location. Use this to find specific recommendations for each day of an itinerary.",
    schema: z.object({
      lat: z.number().describe("Latitude of the center location"),
      lng: z.number().describe("Longitude of the center location"),
      locationName: z.string().describe("Name of the location being searched around"),
      type: z.enum(['stays', 'restaurants', 'attraction', 'activities']).optional().describe("Type of places to search for"),
      radius: z.number().optional().describe("Search radius in meters (default 5000, max 50000)")
    })
  }
);

export const createItineraryWithMapTool = tool(
  async ({ title, country, days, travelers, tripType }) => {
    if (!GOOGLE_MAPS_API_KEY) {
      return JSON.stringify({
        success: false,
        error: "Map service not configured - itinerary created without coordinates"
      });
    }

    try {
      const allLocations = days.map(d => d.location);
      const uniqueLocations = [...new Set(allLocations)];

      console.log('[MapTools] Geocoding locations:', uniqueLocations);

      const geocodedLocations: Array<{
        name: string;
        lat: number;
        lng: number;
        address?: string;
      }> = [];

      // Geocode main locations (cities/areas)
      for (const location of uniqueLocations) {
        const searchQuery = country ? `${location}, ${country}` : location;

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'OK' && data.results?.length > 0) {
              const result = data.results[0];
              console.log(`[MapTools] Geocoded ${location}:`, result.geometry.location);
              geocodedLocations.push({
                name: location,
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                address: result.formatted_address,
              });
            } else {
              console.warn(`[MapTools] Failed to geocode location: ${location}`);
              geocodedLocations.push({ name: location, lat: 0, lng: 0 });
            }
          } else {
            geocodedLocations.push({ name: location, lat: 0, lng: 0 });
          }

          await new Promise(resolve => setTimeout(resolve, 100));
        } catch {
          geocodedLocations.push({ name: location, lat: 0, lng: 0 });
        }
      }

      // Process and geocode places for each day
      const processPlaces = async (dayPlaces: any[], dayLocation: string): Promise<any[]> => {
        if (!dayPlaces || !Array.isArray(dayPlaces)) return [];
        
        const processedPlaces: any[] = [];
        
        for (let idx = 0; idx < dayPlaces.length; idx++) {
          const place = dayPlaces[idx];
          const placeId = `place_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 9)}`;
          
          // Try to geocode the place
          const geocoded = await geocodePlaceByName(
            place.name, 
            country || dayLocation, 
            place.type
          );
          
          if (geocoded && geocoded.lat !== 0 && geocoded.lng !== 0) {
            console.log(`[MapTools] Geocoded place ${place.name}:`, { lat: geocoded.lat, lng: geocoded.lng });
            processedPlaces.push({
              id: placeId,
              name: place.name,
              type: place.type || 'attraction',
              location: { lat: geocoded.lat, lng: geocoded.lng },
              address: geocoded.address || place.address,
              rating: place.rating,
              placeId: geocoded.placeId,
            });
          } else {
            // Fallback: use the day's location coordinates as approximate location
            const dayLocationData = geocodedLocations.find(l => l.name === dayLocation);
            console.warn(`[MapTools] Could not geocode place ${place.name}, using day location fallback`);
            processedPlaces.push({
              id: placeId,
              name: place.name,
              type: place.type || 'attraction',
              location: dayLocationData 
                ? { lat: dayLocationData.lat, lng: dayLocationData.lng }
                : { lat: 0, lng: 0 },
              address: place.address,
              rating: place.rating,
              placeId: place.placeId,
            });
          }
          
          // Rate limiting - small delay between place geocodes
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        return processedPlaces;
      };

      // Build days with geocoded places
      const processedDays = [];
      for (let idx = 0; idx < days.length; idx++) {
        const day = days[idx];
        const locationData = geocodedLocations.find(l => l.name === day.location);
        
        const geocodedPlaces = await processPlaces(day.places || [], day.location);
        
        processedDays.push({
          dayNumber: idx + 1,
          date: new Date(Date.now() + idx * 86400000).toISOString().split('T')[0],
          location: day.location,
          title: day.title || `Day ${idx + 1}: ${day.location}`,
          description: day.activities?.join('\n') || '',
          coordinates: locationData ? { lat: locationData.lat, lng: locationData.lng } : { lat: 0, lng: 0 },
          activities: {
            morning: day.morning || '',
            afternoon: day.afternoon || '',
            evening: day.evening || ''
          },
          places: geocodedPlaces,
          expanded: false
        });
      }

      // Build the structured itinerary
      const itinerary = {
        id: `trip_${Date.now()}`,
        title,
        country,
        travelers: travelers || 1,
        tripType: tripType || 'custom',
        totalDays: days.length,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + days.length * 86400000).toISOString().split('T')[0],
        locations: geocodedLocations.map((loc, idx) => ({
          id: `loc_${idx}`,
          name: loc.name,
          coordinates: { lat: loc.lat, lng: loc.lng },
          active: idx === 0
        })),
        days: processedDays
      };

      // Count geocoded places
      const totalPlaces = processedDays.reduce((sum, day) => sum + day.places.length, 0);
      const geocodedPlacesCount = processedDays.reduce((sum, day) => 
        sum + day.places.filter((p: any) => p.location.lat !== 0 && p.location.lng !== 0).length, 0
      );

      console.log(`[MapTools] Created itinerary with ${totalPlaces} places, ${geocodedPlacesCount} geocoded`);

      return JSON.stringify({
        success: true,
        message: `Created ${days.length}-day itinerary for ${title} with map coordinates. Geocoded ${geocodedLocations.filter(l => l.lat !== 0).length}/${uniqueLocations.length} locations and ${geocodedPlacesCount}/${totalPlaces} places.`,
        itinerary
      });
    } catch (error: any) {
      console.error('[MapTools] Error creating itinerary:', error);
      return JSON.stringify({
        success: false,
        error: error?.message || 'Failed to create itinerary'
      });
    }
  },
  {
    name: "create_itinerary_with_map",
    description: `Create a structured day-by-day itinerary with geocoded locations for map display.
    
IMPORTANT: Use this tool when the user wants a complete trip plan. This automatically:
1. Geocodes all locations for the map
2. Creates structured day data with morning/afternoon/evening activities
3. Associates places with their types (stays, restaurants, attraction, activities) for map filtering

The places array for each day should include specific places the traveler will visit, with their type:
- 'stays' for hotels, resorts, accommodations
- 'restaurants' for dining spots, cafes, food places
- 'attraction' for tourist spots, temples, beaches, landmarks
- 'activities' for tours, experiences, outdoor activities`,
    schema: z.object({
      title: z.string().describe("Title of the trip, e.g. '7-Day Bali Adventure'"),
      country: z.string().describe("Country name for geocoding accuracy"),
      days: z.array(z.object({
        location: z.string().describe("Main city/area for this day"),
        title: z.string().optional().describe("Optional day title"),
        activities: z.array(z.string()).optional().describe("List of activities for the day"),
        morning: z.string().optional().describe("Morning activity description"),
        afternoon: z.string().optional().describe("Afternoon activity description"),
        evening: z.string().optional().describe("Evening activity description"),
        places: z.array(z.object({
          name: z.string().describe("Name of the place"),
          type: z.enum(['stays', 'restaurants', 'attraction', 'activities']).describe("Type of place for map filtering"),
          address: z.string().optional().describe("Address if known"),
        })).optional().describe("Specific places to visit this day - include type for map filters")
      })).describe("Array of day plans"),
      travelers: z.number().optional().describe("Number of travelers"),
      tripType: z.string().optional().describe("Type of trip: adventure, relaxation, cultural, etc.")
    })
  }
);

export const mapTools = [geocodeLocationsTool, searchNearbyPlacesTool, createItineraryWithMapTool];
