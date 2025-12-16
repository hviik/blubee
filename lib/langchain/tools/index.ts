export { tripTools, saveTripTool, getUserTripsTool, updateTripTool, deleteTripTool } from './tripTools';
export { wishlistTools, addToWishlistTool, getWishlistTool, removeFromWishlistTool } from './wishlistTools';
export { searchTools, searchDestinationsTool, getDestinationInfoTool, convertCurrencyTool } from './searchTools';

import { tripTools } from './tripTools';
import { wishlistTools } from './wishlistTools';
import { searchTools } from './searchTools';

// All tools combined
export const allTools = [...tripTools, ...wishlistTools, ...searchTools];

