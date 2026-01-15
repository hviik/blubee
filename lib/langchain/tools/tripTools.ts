import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseServer";

// Country name to ISO2 code mapping for common destinations
const COUNTRY_ISO_MAP: Record<string, string> = {
  'vietnam': 'vn', 'thailand': 'th', 'indonesia': 'id', 'bali': 'id', 'japan': 'jp',
  'india': 'in', 'malaysia': 'my', 'singapore': 'sg', 'philippines': 'ph', 'cambodia': 'kh',
  'laos': 'la', 'myanmar': 'mm', 'south korea': 'kr', 'korea': 'kr', 'china': 'cn',
  'australia': 'au', 'new zealand': 'nz', 'france': 'fr', 'italy': 'it', 'spain': 'es',
  'germany': 'de', 'united kingdom': 'gb', 'uk': 'gb', 'england': 'gb', 'usa': 'us',
  'united states': 'us', 'canada': 'ca', 'mexico': 'mx', 'brazil': 'br', 'peru': 'pe',
  'argentina': 'ar', 'chile': 'cl', 'colombia': 'co', 'egypt': 'eg', 'morocco': 'ma',
  'south africa': 'za', 'kenya': 'ke', 'tanzania': 'tz', 'greece': 'gr', 'turkey': 'tr',
  'uae': 'ae', 'dubai': 'ae', 'maldives': 'mv', 'sri lanka': 'lk', 'nepal': 'np',
  'switzerland': 'ch', 'austria': 'at', 'netherlands': 'nl', 'portugal': 'pt',
  'iceland': 'is', 'norway': 'no', 'sweden': 'se', 'finland': 'fi', 'denmark': 'dk',
  'ireland': 'ie', 'scotland': 'gb', 'croatia': 'hr', 'czech republic': 'cz', 'hungary': 'hu',
};

function getISO2FromCountry(country: string): string {
  const lower = country.toLowerCase().trim();
  return COUNTRY_ISO_MAP[lower] || 'xx';
}

/**
 * Tool to save a new trip to the database
 */
export const saveTripTool = tool(
  async ({ title, startDate, endDate, tripType, numberOfPeople, destinations, itinerary, budget, country, iso2, preferences }, { configurable }) => {
    const userId = configurable?.userId;
    
    if (!userId) {
      return JSON.stringify({ success: false, error: "User not authenticated" });
    }

    try {
      // Derive ISO2 code if not provided
      let resolvedISO2 = iso2;
      if (!resolvedISO2 && country) {
        resolvedISO2 = getISO2FromCountry(country);
      }
      if (!resolvedISO2 && destinations && destinations.length > 0) {
        resolvedISO2 = getISO2FromCountry(destinations[0]);
      }

      // Calculate days and nights
      let days = 0;
      let nights = 0;
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        nights = days - 1;
      } else if (itinerary && itinerary.length > 0) {
        days = itinerary.length;
        nights = days - 1;
      }

      // Transform itinerary to match the expected format for display
      const formattedItinerary = itinerary?.map((day, idx) => ({
        dayNumber: day.day || idx + 1,
        date: day.date,
        location: day.location,
        title: day.title || `Day ${day.day || idx + 1}: ${day.location}`,
        description: day.description || day.notes,
        activities: day.activities ? {
          morning: day.morning,
          afternoon: day.afternoon,
          evening: day.evening
        } : undefined,
        places: day.places || []
      }));

      const { data, error } = await supabaseAdmin
        .from('trips')
        .insert({
          user_id: userId,
          title,
          start_date: startDate || null,
          end_date: endDate || null,
          trip_type: tripType || 'custom',
          number_of_people: numberOfPeople || 1,
          status: 'planned',
          total_budget: budget || null,
          preferences: {
            country: country || (destinations?.[0]),
            iso2: resolvedISO2,
            route: destinations || [],
            itinerary: formattedItinerary || [],
            days,
            nights,
            travelers: numberOfPeople || 1,
            duration: days > 0 ? `${days} Days, ${nights} Nights` : undefined,
            ...preferences
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Save trip error:', error);
        return JSON.stringify({ success: false, error: error.message });
      }

      return JSON.stringify({ 
        success: true, 
        message: `Trip "${title}" has been saved successfully!`,
        tripId: data.id,
        trip: data
      });
    } catch (error: any) {
      console.error('Save trip tool error:', error);
      return JSON.stringify({ success: false, error: error?.message || 'Failed to save trip' });
    }
  },
  {
    name: "save_trip",
    description: "Save a trip plan to the user's account. Use this when the user confirms they want to save their trip, or asks to save/book the itinerary. Include all the itinerary details, destinations, country name with ISO2 code, and dates. ALWAYS include the country name and try to include the ISO2 code.",
    schema: z.object({
      title: z.string().describe("A descriptive title for the trip, e.g. 'Summer Girls Trip' or 'Family Adventure'"),
      startDate: z.string().optional().describe("Trip start date in YYYY-MM-DD format"),
      endDate: z.string().optional().describe("Trip end date in YYYY-MM-DD format"),
      tripType: z.string().optional().describe("Type of trip: 'adventure', 'relaxation', 'cultural', 'family', 'romantic', 'business', 'custom'"),
      numberOfPeople: z.number().optional().describe("Number of travelers"),
      country: z.string().optional().describe("The main country for the trip (e.g., 'Vietnam', 'Thailand', 'Japan')"),
      iso2: z.string().optional().describe("ISO 3166-1 alpha-2 country code (e.g., 'vn', 'th', 'jp')"),
      destinations: z.array(z.string()).optional().describe("List of cities/destinations in the trip route order"),
      itinerary: z.array(z.object({
        day: z.number().describe("Day number"),
        date: z.string().optional().describe("Date for this day in YYYY-MM-DD format"),
        location: z.string().describe("Main city/location for this day"),
        title: z.string().optional().describe("Title for this day, e.g., 'Exploring Hanoi'"),
        description: z.string().optional().describe("Brief description of the day"),
        activities: z.array(z.string()).optional().describe("List of activities/places to visit"),
        morning: z.string().optional().describe("Morning activity description"),
        afternoon: z.string().optional().describe("Afternoon activity description"),
        evening: z.string().optional().describe("Evening activity description"),
        places: z.array(z.object({
          name: z.string().describe("Place name"),
          type: z.enum(['stays', 'restaurants', 'attraction', 'activities']).describe("Type of place"),
          address: z.string().optional().describe("Address of the place")
        })).optional().describe("Specific places for this day"),
        accommodation: z.string().optional().describe("Where to stay this night"),
        notes: z.string().optional().describe("Additional notes for the day")
      })).optional().describe("Detailed day-by-day itinerary with activities"),
      budget: z.number().optional().describe("Total estimated budget"),
      preferences: z.record(z.string(), z.any()).optional().describe("Additional preferences and details")
    })
  }
);

/**
 * Tool to get user's saved trips
 */
export const getUserTripsTool = tool(
  async ({ status }, { configurable }) => {
    const userId = configurable?.userId;
    
    if (!userId) {
      return JSON.stringify({ success: false, error: "User not authenticated" });
    }

    try {
      let query = supabaseAdmin
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .neq('status', 'wishlist')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Get trips error:', error);
        return JSON.stringify({ success: false, error: error.message });
      }

      if (!data || data.length === 0) {
        return JSON.stringify({ 
          success: true, 
          message: "You don't have any saved trips yet. Would you like me to help you plan one?",
          trips: []
        });
      }

      const tripsSummary = data.map(trip => ({
        id: trip.id,
        title: trip.title,
        startDate: trip.start_date,
        endDate: trip.end_date,
        status: trip.status,
        tripType: trip.trip_type,
        numberOfPeople: trip.number_of_people
      }));

      return JSON.stringify({ 
        success: true, 
        message: `Found ${data.length} trip(s)`,
        trips: tripsSummary
      });
    } catch (error: any) {
      console.error('Get trips tool error:', error);
      return JSON.stringify({ success: false, error: error?.message || 'Failed to get trips' });
    }
  },
  {
    name: "get_user_trips",
    description: "Get the user's saved trips. Use this when the user asks about their trips, past trips, or saved itineraries.",
    schema: z.object({
      status: z.enum(['planned', 'completed']).optional().describe("Filter by trip status")
    })
  }
);

/**
 * Tool to update an existing trip
 */
export const updateTripTool = tool(
  async ({ tripId, title, startDate, endDate, tripType, numberOfPeople, status, preferences }, { configurable }) => {
    const userId = configurable?.userId;
    
    if (!userId) {
      return JSON.stringify({ success: false, error: "User not authenticated" });
    }

    try {
      // Verify trip belongs to user
      const { data: existing } = await supabaseAdmin
        .from('trips')
        .select('id')
        .eq('id', tripId)
        .eq('user_id', userId)
        .single();

      if (!existing) {
        return JSON.stringify({ success: false, error: "Trip not found or you don't have access to it" });
      }

      const updateData: Record<string, any> = {};
      if (title !== undefined) updateData.title = title;
      if (startDate !== undefined) updateData.start_date = startDate;
      if (endDate !== undefined) updateData.end_date = endDate;
      if (tripType !== undefined) updateData.trip_type = tripType;
      if (numberOfPeople !== undefined) updateData.number_of_people = numberOfPeople;
      if (status !== undefined) updateData.status = status;
      if (preferences !== undefined) updateData.preferences = preferences;

      const { data, error } = await supabaseAdmin
        .from('trips')
        .update(updateData)
        .eq('id', tripId)
        .select()
        .single();

      if (error) {
        console.error('Update trip error:', error);
        return JSON.stringify({ success: false, error: error.message });
      }

      return JSON.stringify({ 
        success: true, 
        message: "Trip updated successfully!",
        trip: data
      });
    } catch (error: any) {
      console.error('Update trip tool error:', error);
      return JSON.stringify({ success: false, error: error?.message || 'Failed to update trip' });
    }
  },
  {
    name: "update_trip",
    description: "Update an existing trip's details. Use when the user wants to modify dates, add people, or change trip details.",
    schema: z.object({
      tripId: z.string().describe("The ID of the trip to update"),
      title: z.string().optional().describe("New title for the trip"),
      startDate: z.string().optional().describe("New start date in YYYY-MM-DD format"),
      endDate: z.string().optional().describe("New end date in YYYY-MM-DD format"),
      tripType: z.string().optional().describe("New trip type"),
      numberOfPeople: z.number().optional().describe("Updated number of travelers"),
      status: z.enum(['planned', 'completed']).optional().describe("Update trip status"),
      preferences: z.record(z.string(), z.any()).optional().describe("Updated preferences")
    })
  }
);

/**
 * Tool to delete a trip
 */
export const deleteTripTool = tool(
  async ({ tripId }, { configurable }) => {
    const userId = configurable?.userId;
    
    if (!userId) {
      return JSON.stringify({ success: false, error: "User not authenticated" });
    }

    try {
      const { error } = await supabaseAdmin
        .from('trips')
        .delete()
        .eq('id', tripId)
        .eq('user_id', userId);

      if (error) {
        console.error('Delete trip error:', error);
        return JSON.stringify({ success: false, error: error.message });
      }

      return JSON.stringify({ 
        success: true, 
        message: "Trip has been deleted successfully."
      });
    } catch (error: any) {
      console.error('Delete trip tool error:', error);
      return JSON.stringify({ success: false, error: error?.message || 'Failed to delete trip' });
    }
  },
  {
    name: "delete_trip",
    description: "Delete a saved trip. Use when the user explicitly asks to delete or remove a trip.",
    schema: z.object({
      tripId: z.string().describe("The ID of the trip to delete")
    })
  }
);

export const tripTools = [saveTripTool, getUserTripsTool, updateTripTool, deleteTripTool];

