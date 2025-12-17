import { tool } from "@langchain/core/tools";
import { z } from "zod";

// API base URL - works for both server and client
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

export interface HotelResult {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  photoUrl: string;
  rating: number;
  reviewScore: number;
  reviewScoreWord: string;
  reviewCount: number;
  price: number;
  currency: string;
  pricePerNight: number;
  bookingUrl: string;
  amenities: string[];
  distanceFromCenter: string;
  lat?: number;
  lng?: number;
}

/**
 * Tool to search for hotels using Booking.com API
 */
export const searchHotelsTool = tool(
  async ({ destination, checkInDate, checkOutDate, adults, rooms, currency, minPrice, maxPrice, sortBy }) => {
    try {
      console.log(`[searchHotelsTool] Searching hotels in ${destination} from ${checkInDate} to ${checkOutDate}`);
      
      // Validate dates
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkIn < today) {
        return JSON.stringify({
          success: false,
          error: 'Check-in date cannot be in the past'
        });
      }
      
      if (checkOut <= checkIn) {
        return JSON.stringify({
          success: false,
          error: 'Check-out date must be after check-in date'
        });
      }

      // Call the booking API
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          checkInDate,
          checkOutDate,
          adults: adults || 2,
          rooms: rooms || 1,
          currency: currency || 'USD',
          minPrice,
          maxPrice,
          sortBy: sortBy || 'popularity',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return JSON.stringify({
          success: false,
          error: error.error || 'Failed to search hotels'
        });
      }

      const data = await response.json();
      
      if (!data.hotels || data.hotels.length === 0) {
        return JSON.stringify({
          success: false,
          error: `No hotels found in ${destination} for the selected dates`,
          hotels: []
        });
      }

      // Return structured data for the frontend to render as cards
      return JSON.stringify({
        success: true,
        destination,
        checkInDate,
        checkOutDate,
        hotelCount: data.hotels.length,
        hotels: data.hotels,
        message: `Found ${data.hotels.length} hotels in ${destination}`,
        displayType: 'hotelCarousel' // Signal to frontend to render as carousel
      });
    } catch (error: any) {
      console.error('[searchHotelsTool] Error:', error);
      return JSON.stringify({
        success: false,
        error: error?.message || 'Failed to search hotels'
      });
    }
  },
  {
    name: "search_hotels",
    description: `Search for hotels at a destination using Booking.com. Use this when the user:
- Asks about places to stay or accommodations
- Wants hotel recommendations for their trip
- Mentions budget constraints for hotels
- Needs to find hotels for specific dates

IMPORTANT: This tool returns hotel data that will be displayed as clickable cards in the chat. After using this tool, present a brief summary and let the user know they can browse the options.

Date format must be YYYY-MM-DD (e.g., 2024-06-15).`,
    schema: z.object({
      destination: z.string().describe("City or destination name, e.g. 'Colombo', 'Sri Lanka', 'Bali'"),
      checkInDate: z.string().describe("Check-in date in YYYY-MM-DD format"),
      checkOutDate: z.string().describe("Check-out date in YYYY-MM-DD format"),
      adults: z.number().optional().describe("Number of adults (default: 2)"),
      rooms: z.number().optional().describe("Number of rooms (default: 1)"),
      currency: z.string().optional().describe("Currency code like USD, EUR, INR (default: USD)"),
      minPrice: z.number().optional().describe("Minimum price per night in the specified currency"),
      maxPrice: z.number().optional().describe("Maximum price per night - use this when user mentions 'budget', 'cheap', 'affordable', 'mid-range', etc."),
      sortBy: z.enum(['popularity', 'price', 'review_score', 'distance']).optional().describe("Sort results by: popularity, price, review_score, or distance")
    })
  }
);

/**
 * Tool to get detailed information about a specific hotel
 */
export const getHotelDetailsTool = tool(
  async ({ hotelId, checkInDate, checkOutDate, currency }) => {
    try {
      console.log(`[getHotelDetailsTool] Getting details for hotel ${hotelId}`);
      
      // For now, return a message that this feature requires the full API
      return JSON.stringify({
        success: true,
        message: `To view full details and book this hotel, please click the booking link on the hotel card.`,
        hotelId,
        note: 'Full hotel details and booking functionality available through Booking.com'
      });
    } catch (error: any) {
      console.error('[getHotelDetailsTool] Error:', error);
      return JSON.stringify({
        success: false,
        error: error?.message || 'Failed to get hotel details'
      });
    }
  },
  {
    name: "get_hotel_details",
    description: "Get detailed information about a specific hotel. Use this when a user wants more information about a particular hotel they've seen.",
    schema: z.object({
      hotelId: z.string().describe("The hotel ID from search results"),
      checkInDate: z.string().optional().describe("Check-in date in YYYY-MM-DD format"),
      checkOutDate: z.string().optional().describe("Check-out date in YYYY-MM-DD format"),
      currency: z.string().optional().describe("Currency code (default: USD)")
    })
  }
);

export const bookingTools = [searchHotelsTool, getHotelDetailsTool];

