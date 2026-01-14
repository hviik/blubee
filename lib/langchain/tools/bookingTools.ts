import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { 
  validateDateRange, 
  validateDate, 
  getCurrentDateContext,
  formatToISO 
} from "../../utils/dateResolver";

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

export const searchHotelsTool = tool(
  async ({ destination, checkInDate, checkOutDate, adults, children, childrenAges, rooms, currency, minPrice, maxPrice, sortBy }) => {
    try {
      const dateContext = getCurrentDateContext();
      
      // Validate dates using the date resolver
      const dateValidation = validateDateRange(checkInDate, checkOutDate);
      
      if (!dateValidation.isValid) {
        return JSON.stringify({
          success: false,
          error: dateValidation.error,
          currentDate: dateContext.currentDate,
          hint: `Today is ${dateContext.currentDate}. Please provide dates in YYYY-MM-DD format that are today or in the future.`
        });
      }

      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          checkInDate: dateValidation.checkInDate,
          checkOutDate: dateValidation.checkOutDate,
          adults: adults || 2,
          children: children || 0,
          childrenAges: childrenAges || [],
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
          error: error.error || 'Failed to search hotels',
          currentDate: dateContext.currentDate,
        });
      }

      const data = await response.json();
      
      if (!data.hotels || data.hotels.length === 0) {
        return JSON.stringify({
          success: false,
          error: `No hotels found in ${destination} for ${dateValidation.checkInDate} to ${dateValidation.checkOutDate}`,
          hotels: [],
          currentDate: dateContext.currentDate,
        });
      }

      return JSON.stringify({
        success: true,
        destination: data.destination || destination,
        checkInDate: dateValidation.checkInDate,
        checkOutDate: dateValidation.checkOutDate,
        nights: dateValidation.nights,
        hotelCount: data.hotels.length,
        hotels: data.hotels,
        message: `Found ${data.hotels.length} hotels in ${data.destination || destination} for ${dateValidation.nights} night${dateValidation.nights > 1 ? 's' : ''}`,
        displayType: 'hotelCarousel',
        currentDate: dateContext.currentDate,
      });
    } catch (error: any) {
      const dateContext = getCurrentDateContext();
      return JSON.stringify({
        success: false,
        error: error?.message || 'Failed to search hotels',
        currentDate: dateContext.currentDate,
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

CRITICAL DATE REQUIREMENTS:
- Dates MUST be in ISO format: YYYY-MM-DD (e.g., 2026-02-15)
- Check-in date MUST be today or in the future (not in the past)
- Check-out date MUST be after check-in date
- Maximum stay is 30 nights

If the user mentions relative dates like "next week" or "June 15th", calculate the actual YYYY-MM-DD date based on the current date provided in the system context.

The tool will return hotel cards that display automatically in the chat. After getting results, provide a brief summary and let the user know they can browse the options.`,
    schema: z.object({
      destination: z.string().describe("City or destination name, e.g. 'Colombo', 'Sri Lanka', 'Bali', 'Tokyo'"),
      checkInDate: z.string().describe("Check-in date in YYYY-MM-DD format. MUST be today or a future date."),
      checkOutDate: z.string().describe("Check-out date in YYYY-MM-DD format. MUST be after check-in date."),
      adults: z.number().optional().describe("Number of adults (default: 2)"),
      children: z.number().optional().describe("Number of children (default: 0)"),
      childrenAges: z.array(z.number()).optional().describe("Ages of children, e.g. [5, 8]"),
      rooms: z.number().optional().describe("Number of rooms (default: 1)"),
      currency: z.string().optional().describe("Currency code like USD, EUR, INR, AED (default: USD)"),
      minPrice: z.number().optional().describe("Minimum price per night in the specified currency"),
      maxPrice: z.number().optional().describe("Maximum price per night - use this when user mentions 'budget', 'cheap', 'affordable', 'mid-range', etc."),
      sortBy: z.enum(['popularity', 'price', 'review_score', 'distance']).optional().describe("Sort results by: popularity, price, review_score, or distance")
    })
  }
);

export const getHotelDetailsTool = tool(
  async ({ hotelId, checkInDate, checkOutDate, currency }) => {
    try {
      const dateContext = getCurrentDateContext();
      
      // Validate dates if provided
      if (checkInDate && checkOutDate) {
        const dateValidation = validateDateRange(checkInDate, checkOutDate);
        if (!dateValidation.isValid) {
          return JSON.stringify({
            success: false,
            error: dateValidation.error,
            currentDate: dateContext.currentDate,
          });
        }
      }
      
      return JSON.stringify({
        success: true,
        message: `To view full details and book this hotel, please click the booking link on the hotel card.`,
        hotelId,
        note: 'Full hotel details and booking functionality available through Booking.com',
        currentDate: dateContext.currentDate,
      });
    } catch (error: any) {
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

export const saveHotelBookingTool = tool(
  async ({ hotelId, hotelName, destination, checkInDate, checkOutDate, pricePerNight, currency, tripId }) => {
    try {
      const dateContext = getCurrentDateContext();
      
      // Validate dates if provided
      if (checkInDate && checkOutDate) {
        const dateValidation = validateDateRange(checkInDate, checkOutDate);
        if (!dateValidation.isValid) {
          return JSON.stringify({
            success: false,
            error: dateValidation.error,
            currentDate: dateContext.currentDate,
          });
        }
      }
      
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/booking/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId,
          hotelName,
          destination,
          checkInDate,
          checkOutDate,
          pricePerNight,
          currency: currency || 'USD',
          tripId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return JSON.stringify({
          success: false,
          error: error.error || 'Failed to save booking',
          currentDate: dateContext.currentDate,
        });
      }

      const data = await response.json();
      
      return JSON.stringify({
        success: true,
        message: `Hotel booking for ${hotelName} has been saved to your account.`,
        booking: data.booking,
        currentDate: dateContext.currentDate,
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        error: error?.message || 'Failed to save hotel booking'
      });
    }
  },
  {
    name: "save_hotel_booking",
    description: `Save a hotel booking reference to the user's account. Use this when:
- User confirms they want to save a hotel for their trip
- User asks to remember or track a hotel they're interested in
- After user indicates they're booking a specific hotel

This stores the booking reference in the database so users can track their bookings.`,
    schema: z.object({
      hotelId: z.string().describe("The hotel ID"),
      hotelName: z.string().describe("Name of the hotel"),
      destination: z.string().optional().describe("The destination city/area"),
      checkInDate: z.string().optional().describe("Check-in date in YYYY-MM-DD format"),
      checkOutDate: z.string().optional().describe("Check-out date in YYYY-MM-DD format"),
      pricePerNight: z.number().optional().describe("Price per night"),
      currency: z.string().optional().describe("Currency code (default: USD)"),
      tripId: z.string().optional().describe("Optional trip ID to associate the booking with")
    })
  }
);

export const getUserBookingsTool = tool(
  async ({ limit, offset }) => {
    try {
      const dateContext = getCurrentDateContext();
      const baseUrl = getApiBaseUrl();
      const params = new URLSearchParams();
      if (limit) params.set('limit', String(limit));
      if (offset) params.set('offset', String(offset));
      
      const response = await fetch(`${baseUrl}/api/booking/save?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        return JSON.stringify({
          success: false,
          error: error.error || 'Failed to fetch bookings',
          currentDate: dateContext.currentDate,
        });
      }

      const data = await response.json();
      
      if (!data.bookings || data.bookings.length === 0) {
        return JSON.stringify({
          success: true,
          message: "You haven't saved any hotel bookings yet.",
          bookings: [],
          currentDate: dateContext.currentDate,
        });
      }

      return JSON.stringify({
        success: true,
        message: `Found ${data.bookings.length} saved hotel bookings.`,
        bookings: data.bookings,
        total: data.total,
        currentDate: dateContext.currentDate,
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        error: error?.message || 'Failed to fetch hotel bookings'
      });
    }
  },
  {
    name: "get_user_hotel_bookings",
    description: `Get the user's saved hotel booking history. Use this when:
- User asks about their past hotel bookings
- User wants to see hotels they've saved or clicked on
- User asks "what hotels have I looked at" or similar`,
    schema: z.object({
      limit: z.number().optional().describe("Maximum number of bookings to return (default: 20)"),
      offset: z.number().optional().describe("Offset for pagination (default: 0)")
    })
  }
);

export const bookingTools = [
  searchHotelsTool, 
  getHotelDetailsTool, 
  saveHotelBookingTool, 
  getUserBookingsTool
];
