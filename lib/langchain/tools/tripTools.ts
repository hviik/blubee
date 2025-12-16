import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseServer";

/**
 * Tool to save a new trip to the database
 */
export const saveTripTool = tool(
  async ({ title, startDate, endDate, tripType, numberOfPeople, destinations, itinerary, budget, preferences }, { configurable }) => {
    const userId = configurable?.userId;
    
    if (!userId) {
      return JSON.stringify({ success: false, error: "User not authenticated" });
    }

    try {
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
            destinations: destinations || [],
            itinerary: itinerary || [],
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
    description: "Save a trip plan to the user's account. Use this when the user confirms they want to save their trip, or asks to save/book the itinerary. Include all the itinerary details, destinations, and dates.",
    schema: z.object({
      title: z.string().describe("A descriptive title for the trip, e.g. '7-Day Bali Adventure'"),
      startDate: z.string().optional().describe("Trip start date in YYYY-MM-DD format"),
      endDate: z.string().optional().describe("Trip end date in YYYY-MM-DD format"),
      tripType: z.string().optional().describe("Type of trip: 'adventure', 'relaxation', 'cultural', 'family', 'romantic', 'business', 'custom'"),
      numberOfPeople: z.number().optional().describe("Number of travelers"),
      destinations: z.array(z.string()).optional().describe("List of destinations in the trip"),
      itinerary: z.array(z.object({
        day: z.number().describe("Day number"),
        location: z.string().describe("Main location for this day"),
        activities: z.array(z.string()).describe("List of activities/places to visit"),
        accommodation: z.string().optional().describe("Where to stay this night"),
        notes: z.string().optional().describe("Additional notes for the day")
      })).optional().describe("Detailed day-by-day itinerary"),
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

