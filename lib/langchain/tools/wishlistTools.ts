import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseServer";

/**
 * Tool to add a destination to user's wishlist
 */
export const addToWishlistTool = tool(
  async ({ destinationName, destinationId, country, description, estimatedBudget }, { configurable }) => {
    const userId = configurable?.userId;
    
    if (!userId) {
      return JSON.stringify({ success: false, error: "User not authenticated" });
    }

    try {
      // Check if already in wishlist
      const { data: existingItems } = await supabaseAdmin
        .from('trips')
        .select('id, preferences')
        .eq('user_id', userId)
        .eq('status', 'wishlist');

      const existing = existingItems?.find(trip => {
        const prefs = trip.preferences as { destination_id?: string; iso2?: string } | null;
        return prefs?.destination_id?.toLowerCase() === destinationId.toLowerCase() ||
               prefs?.iso2?.toLowerCase() === destinationId.toLowerCase();
      });

      if (existing) {
        return JSON.stringify({ 
          success: true, 
          message: `${destinationName} is already in your wishlist!`,
          action: 'exists'
        });
      }

      // Add to wishlist
      const { data, error } = await supabaseAdmin
        .from('trips')
        .insert({
          user_id: userId,
          title: `${destinationName} (${destinationId.toUpperCase()})`,
          status: 'wishlist',
          trip_type: 'explore',
          preferences: {
            destination_id: destinationId,
            destinationId: destinationId,
            destinationName: destinationName,
            country: country,
            description: description,
            estimated_budget: estimatedBudget,
            iso2: destinationId
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Add to wishlist error:', error);
        return JSON.stringify({ success: false, error: error.message });
      }

      return JSON.stringify({ 
        success: true, 
        message: `${destinationName} has been added to your wishlist! You can view it in your saved destinations.`,
        action: 'added',
        wishlistId: data.id
      });
    } catch (error: any) {
      console.error('Add to wishlist tool error:', error);
      return JSON.stringify({ success: false, error: error?.message || 'Failed to add to wishlist' });
    }
  },
  {
    name: "add_to_wishlist",
    description: "Add a destination to the user's travel wishlist. Use when user says they want to save a destination for later, add to favorites, or 'I'd love to visit there someday'.",
    schema: z.object({
      destinationName: z.string().describe("Name of the destination, e.g. 'Bali'"),
      destinationId: z.string().describe("ISO country code or unique identifier, e.g. 'ID' for Indonesia"),
      country: z.string().optional().describe("Country name"),
      description: z.string().optional().describe("Brief description of why this destination is appealing"),
      estimatedBudget: z.number().optional().describe("Estimated budget in user's currency")
    })
  }
);

/**
 * Tool to get user's wishlist
 */
export const getWishlistTool = tool(
  async (_, { configurable }) => {
    const userId = configurable?.userId;
    
    if (!userId) {
      return JSON.stringify({ success: false, error: "User not authenticated" });
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('trips')
        .select('id, title, preferences, created_at')
        .eq('user_id', userId)
        .eq('status', 'wishlist')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get wishlist error:', error);
        return JSON.stringify({ success: false, error: error.message });
      }

      if (!data || data.length === 0) {
        return JSON.stringify({ 
          success: true, 
          message: "Your wishlist is empty. Would you like me to suggest some amazing destinations to add?",
          wishlist: []
        });
      }

      const wishlistItems = data.map(item => {
        const prefs = item.preferences as Record<string, any> | null;
        return {
          id: item.id,
          destinationName: prefs?.destinationName || item.title,
          country: prefs?.country,
          addedAt: item.created_at
        };
      });

      return JSON.stringify({ 
        success: true, 
        message: `You have ${data.length} destination(s) in your wishlist`,
        wishlist: wishlistItems
      });
    } catch (error: any) {
      console.error('Get wishlist tool error:', error);
      return JSON.stringify({ success: false, error: error?.message || 'Failed to get wishlist' });
    }
  },
  {
    name: "get_wishlist",
    description: "Get the user's travel wishlist. Use when user asks about their saved destinations, favorite places to visit, or wishlist.",
    schema: z.object({})
  }
);

/**
 * Tool to remove from wishlist
 */
export const removeFromWishlistTool = tool(
  async ({ destinationId, destinationName }, { configurable }) => {
    const userId = configurable?.userId;
    
    if (!userId) {
      return JSON.stringify({ success: false, error: "User not authenticated" });
    }

    try {
      // Find the wishlist item
      const { data: allWishlistItems, error: findError } = await supabaseAdmin
        .from('trips')
        .select('id, title, preferences')
        .eq('user_id', userId)
        .eq('status', 'wishlist');

      if (findError) {
        console.error('Find wishlist error:', findError);
        return JSON.stringify({ success: false, error: findError.message });
      }

      // Find by destination ID or name
      const existing = allWishlistItems?.find(trip => {
        const prefs = trip.preferences as { destination_id?: string; iso2?: string; destinationName?: string } | null;
        const idMatch = destinationId && (
          prefs?.destination_id?.toLowerCase() === destinationId.toLowerCase() ||
          prefs?.iso2?.toLowerCase() === destinationId.toLowerCase()
        );
        const nameMatch = destinationName && 
          prefs?.destinationName?.toLowerCase().includes(destinationName.toLowerCase());
        return idMatch || nameMatch;
      });

      if (!existing) {
        return JSON.stringify({ 
          success: false, 
          message: "Couldn't find that destination in your wishlist."
        });
      }

      // Delete it
      const { error: deleteError } = await supabaseAdmin
        .from('trips')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('Delete wishlist error:', deleteError);
        return JSON.stringify({ success: false, error: deleteError.message });
      }

      return JSON.stringify({ 
        success: true, 
        message: `Removed from your wishlist.`,
        action: 'removed'
      });
    } catch (error: any) {
      console.error('Remove from wishlist tool error:', error);
      return JSON.stringify({ success: false, error: error?.message || 'Failed to remove from wishlist' });
    }
  },
  {
    name: "remove_from_wishlist",
    description: "Remove a destination from the user's wishlist. Use when user asks to remove, delete from wishlist, or says they're no longer interested.",
    schema: z.object({
      destinationId: z.string().optional().describe("ISO country code or unique identifier of the destination"),
      destinationName: z.string().optional().describe("Name of the destination to remove")
    })
  }
);

export const wishlistTools = [addToWishlistTool, getWishlistTool, removeFromWishlistTool];

