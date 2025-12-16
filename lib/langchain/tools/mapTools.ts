import { tool } from "@langchain/core/tools";
import { z } from "zod";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Tool to geocode locations and get their coordinates
 */
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

          // Rate limiting
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

/**
 * Tool to search for nearby places (attractions, restaurants, hotels)
 */
export const searchNearbyPlacesTool = tool(
  async ({ lat, lng, type, locationName, radius = 5000 }) => {
    if (!GOOGLE_MAPS_API_KEY) {
      return JSON.stringify({
        success: false,
        error: "Places service not configured"
      });
    }

    try {
      const placeTypeMapping: Record<string, string> = {
        stays: 'lodging',
        restaurants: 'restaurant',
        attraction: 'tourist_attraction',
        activities: 'park',
      };

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
        name: result.name,
        type: type || inferPlaceType(result.types || []),
        lat: result.geometry?.location?.lat || 0,
        lng: result.geometry?.location?.lng || 0,
        address: result.vicinity,
        rating: result.rating,
        priceLevel: result.price_level,
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

/**
 * Tool to create a structured itinerary with geocoded locations
 */
export const createItineraryWithMapTool = tool(
  async ({ title, country, days, travelers, tripType }) => {
    if (!GOOGLE_MAPS_API_KEY) {
      return JSON.stringify({
        success: false,
        error: "Map service not configured - itinerary created without coordinates"
      });
    }

    try {
      // Extract unique locations from days
      const allLocations = days.map(d => d.location);
      const uniqueLocations = [...new Set(allLocations)];

      // Geocode all locations
      const geocodedLocations: Array<{
        name: string;
        lat: number;
        lng: number;
        address?: string;
      }> = [];

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
              geocodedLocations.push({
                name: location,
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                address: result.formatted_address,
              });
            } else {
              geocodedLocations.push({ name: location, lat: 0, lng: 0 });
            }
          }

          await new Promise(resolve => setTimeout(resolve, 100));
        } catch {
          geocodedLocations.push({ name: location, lat: 0, lng: 0 });
        }
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
        days: days.map((day, idx) => {
          const locationData = geocodedLocations.find(l => l.name === day.location);
          return {
            dayNumber: idx + 1,
            date: new Date(Date.now() + idx * 86400000).toISOString().split('T')[0],
            location: day.location,
            title: `Day ${idx + 1}: ${day.location}`,
            description: day.activities.join('\n'),
            coordinates: locationData ? { lat: locationData.lat, lng: locationData.lng } : { lat: 0, lng: 0 },
            activities: {
              morning: day.morning || '',
              afternoon: day.afternoon || '',
              evening: day.evening || ''
            },
            places: day.places || []
          };
        })
      };

      return JSON.stringify({
        success: true,
        message: `Created ${days.length}-day itinerary for ${title} with map coordinates`,
        itinerary
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        error: error?.message || 'Failed to create itinerary'
      });
    }
  },
  {
    name: "create_itinerary_with_map",
    description: "Create a structured day-by-day itinerary with geocoded locations for map display. Use this INSTEAD of writing itinerary text when the user wants a complete trip plan. This will automatically geocode all locations and return structured data for the map.",
    schema: z.object({
      title: z.string().describe("Title of the trip, e.g. '7-Day Bali Adventure'"),
      country: z.string().describe("Country name for geocoding accuracy"),
      days: z.array(z.object({
        location: z.string().describe("Main city/area for this day"),
        activities: z.array(z.string()).describe("List of activities for the day"),
        morning: z.string().optional().describe("Morning activity description"),
        afternoon: z.string().optional().describe("Afternoon activity description"),
        evening: z.string().optional().describe("Evening activity description"),
        places: z.array(z.object({
          name: z.string(),
          type: z.enum(['stays', 'restaurants', 'attraction', 'activities'])
        })).optional().describe("Specific places mentioned")
      })).describe("Array of day plans"),
      travelers: z.number().optional().describe("Number of travelers"),
      tripType: z.string().optional().describe("Type of trip: adventure, relaxation, cultural, etc.")
    })
  }
);

function inferPlaceType(types: string[]): string {
  if (types.includes('lodging') || types.includes('hotel')) return 'stays';
  if (types.includes('restaurant') || types.includes('cafe') || types.includes('food')) return 'restaurants';
  if (types.includes('tourist_attraction') || types.includes('museum') || types.includes('art_gallery')) return 'attraction';
  if (types.includes('park') || types.includes('amusement_park') || types.includes('zoo')) return 'activities';
  return 'attraction';
}

export const mapTools = [geocodeLocationsTool, searchNearbyPlacesTool, createItineraryWithMapTool];

