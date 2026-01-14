export { tripTools, saveTripTool, getUserTripsTool, updateTripTool, deleteTripTool } from './tripTools';
export { wishlistTools, addToWishlistTool, getWishlistTool, removeFromWishlistTool } from './wishlistTools';
export { searchTools, searchDestinationsTool, getDestinationInfoTool, convertCurrencyTool } from './searchTools';
export { mapTools, geocodeLocationsTool, searchNearbyPlacesTool, createItineraryWithMapTool } from './mapTools';
export { bookingTools, searchHotelsTool, getHotelDetailsTool, saveHotelBookingTool, getUserBookingsTool } from './bookingTools';

import { tripTools } from './tripTools';
import { wishlistTools } from './wishlistTools';
import { searchTools } from './searchTools';
import { mapTools } from './mapTools';
import { bookingTools } from './bookingTools';

// All tools combined
export const allTools = [...tripTools, ...wishlistTools, ...searchTools, ...mapTools, ...bookingTools];
