import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Currency conversion rates (base: USD)
const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150,
  CAD: 1.35,
  AUD: 1.52,
  INR: 83,
  SGD: 1.34,
  THB: 35,
  MYR: 4.7,
  IDR: 15700,
  PHP: 56,
  VND: 24500,
  KRW: 1330,
  CNY: 7.2,
  NZD: 1.64,
  BRL: 4.95,
  MXN: 17,
  ARS: 850,
  CLP: 950,
  ZAR: 19,
  AED: 3.67,
  SAR: 3.75,
  TRY: 32,
  RUB: 92,
};

function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = CURRENCY_RATES[fromCurrency] || 1;
  const toRate = CURRENCY_RATES[toCurrency] || 1;
  return (amount / fromRate) * toRate;
}

// Popular destinations data with rich information
const DESTINATIONS_DATA = [
  {
    id: 'ID',
    name: 'Bali',
    country: 'Indonesia',
    description: 'Tropical paradise with stunning temples, rice terraces, beaches, and vibrant nightlife. Perfect for honeymoons, adventure, and cultural exploration.',
    highlights: ['Ubud Rice Terraces', 'Tanah Lot Temple', 'Seminyak Beach', 'Uluwatu'],
    bestTime: 'April to October (dry season)',
    avgDailyBudgetUSD: 50,
    tripTypes: ['romantic', 'adventure', 'cultural', 'relaxation'],
  },
  {
    id: 'TH',
    name: 'Thailand',
    country: 'Thailand',
    description: 'Land of smiles with incredible street food, ancient temples, tropical islands, and bustling cities. Great for all budgets.',
    highlights: ['Bangkok Grand Palace', 'Phi Phi Islands', 'Chiang Mai Temples', 'Phuket Beaches'],
    bestTime: 'November to February (cool season)',
    avgDailyBudgetUSD: 40,
    tripTypes: ['adventure', 'cultural', 'family', 'budget'],
  },
  {
    id: 'JP',
    name: 'Japan',
    country: 'Japan',
    description: 'Unique blend of ancient traditions and cutting-edge technology. Famous for cherry blossoms, cuisine, and incredible hospitality.',
    highlights: ['Tokyo', 'Kyoto Temples', 'Mount Fuji', 'Osaka Food Scene'],
    bestTime: 'March-May (cherry blossoms) or October-November (autumn colors)',
    avgDailyBudgetUSD: 100,
    tripTypes: ['cultural', 'food', 'adventure', 'family'],
  },
  {
    id: 'FR',
    name: 'Paris',
    country: 'France',
    description: 'The city of love with world-class art, fashion, cuisine, and iconic landmarks. Perfect for romantic getaways.',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Champs-Élysées'],
    bestTime: 'April to June or September to November',
    avgDailyBudgetUSD: 150,
    tripTypes: ['romantic', 'cultural', 'food', 'luxury'],
  },
  {
    id: 'IT',
    name: 'Italy',
    country: 'Italy',
    description: 'Rich history, art, architecture, and arguably the best food in the world. From Rome to Venice to the Amalfi Coast.',
    highlights: ['Colosseum', 'Venice Canals', 'Tuscany', 'Amalfi Coast'],
    bestTime: 'April to June or September to October',
    avgDailyBudgetUSD: 120,
    tripTypes: ['romantic', 'cultural', 'food', 'history'],
  },
  {
    id: 'MV',
    name: 'Maldives',
    country: 'Maldives',
    description: 'Ultimate luxury beach destination with crystal clear waters, overwater villas, and world-class diving.',
    highlights: ['Overwater Bungalows', 'Snorkeling', 'Sunset Cruises', 'Spa Retreats'],
    bestTime: 'November to April (dry season)',
    avgDailyBudgetUSD: 300,
    tripTypes: ['romantic', 'luxury', 'relaxation', 'honeymoon'],
  },
  {
    id: 'GR',
    name: 'Greece',
    country: 'Greece',
    description: 'Ancient ruins, stunning islands, delicious Mediterranean cuisine, and legendary hospitality.',
    highlights: ['Santorini', 'Athens Acropolis', 'Mykonos', 'Crete'],
    bestTime: 'May to October',
    avgDailyBudgetUSD: 100,
    tripTypes: ['romantic', 'cultural', 'beach', 'history'],
  },
  {
    id: 'AE',
    name: 'Dubai',
    country: 'United Arab Emirates',
    description: 'Futuristic city with luxury shopping, ultramodern architecture, and world-class entertainment.',
    highlights: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Desert Safari'],
    bestTime: 'November to March (cooler weather)',
    avgDailyBudgetUSD: 200,
    tripTypes: ['luxury', 'shopping', 'family', 'adventure'],
  },
  {
    id: 'ES',
    name: 'Spain',
    country: 'Spain',
    description: 'Vibrant culture, incredible architecture, beautiful beaches, and legendary nightlife. From Barcelona to Madrid to the Costa del Sol.',
    highlights: ['Sagrada Familia', 'Alhambra', 'Madrid Museums', 'Ibiza'],
    bestTime: 'April to June or September to November',
    avgDailyBudgetUSD: 100,
    tripTypes: ['cultural', 'beach', 'nightlife', 'food'],
  },
  {
    id: 'VN',
    name: 'Vietnam',
    country: 'Vietnam',
    description: 'Stunning landscapes, rich history, incredible street food, and warm hospitality at budget-friendly prices.',
    highlights: ['Ha Long Bay', 'Ho Chi Minh City', 'Hoi An', 'Sapa Rice Terraces'],
    bestTime: 'February to April or August to October',
    avgDailyBudgetUSD: 30,
    tripTypes: ['adventure', 'cultural', 'budget', 'food'],
  },
  {
    id: 'AU',
    name: 'Australia',
    country: 'Australia',
    description: 'Diverse landscapes from the Outback to the Great Barrier Reef, unique wildlife, and vibrant cities.',
    highlights: ['Sydney Opera House', 'Great Barrier Reef', 'Uluru', 'Melbourne'],
    bestTime: 'September to November or March to May',
    avgDailyBudgetUSD: 150,
    tripTypes: ['adventure', 'nature', 'family', 'wildlife'],
  },
  {
    id: 'NZ',
    name: 'New Zealand',
    country: 'New Zealand',
    description: 'Adventure capital of the world with breathtaking landscapes, from fjords to mountains to beaches.',
    highlights: ['Queenstown', 'Milford Sound', 'Hobbiton', 'Rotorua'],
    bestTime: 'December to February (summer)',
    avgDailyBudgetUSD: 130,
    tripTypes: ['adventure', 'nature', 'film locations', 'outdoor'],
  },
];

/**
 * Tool to search for travel destinations
 */
export const searchDestinationsTool = tool(
  async ({ query, tripType, budget, currency }) => {
    try {
      const targetCurrency = currency || 'USD';
      let results = [...DESTINATIONS_DATA];

      // Filter by query (name, country, or keywords in description)
      if (query) {
        const lowerQuery = query.toLowerCase();
        results = results.filter(dest => 
          dest.name.toLowerCase().includes(lowerQuery) ||
          dest.country.toLowerCase().includes(lowerQuery) ||
          dest.description.toLowerCase().includes(lowerQuery) ||
          dest.highlights.some(h => h.toLowerCase().includes(lowerQuery))
        );
      }

      // Filter by trip type
      if (tripType) {
        const lowerType = tripType.toLowerCase();
        results = results.filter(dest => 
          dest.tripTypes.some(t => t.toLowerCase().includes(lowerType))
        );
      }

      // Filter by budget (daily budget converted to target currency)
      if (budget) {
        const budgetInUSD = convertCurrency(budget, targetCurrency, 'USD');
        results = results.filter(dest => dest.avgDailyBudgetUSD <= budgetInUSD);
      }

      // Convert prices to target currency
      const formattedResults = results.map(dest => ({
        id: dest.id,
        name: dest.name,
        country: dest.country,
        description: dest.description,
        highlights: dest.highlights,
        bestTime: dest.bestTime,
        avgDailyBudget: Math.round(convertCurrency(dest.avgDailyBudgetUSD, 'USD', targetCurrency)),
        currency: targetCurrency,
        tripTypes: dest.tripTypes
      }));

      if (formattedResults.length === 0) {
        return JSON.stringify({
          success: true,
          message: "No destinations found matching your criteria. Try broadening your search or let me suggest some alternatives!",
          destinations: []
        });
      }

      return JSON.stringify({
        success: true,
        message: `Found ${formattedResults.length} destination(s) matching your criteria`,
        destinations: formattedResults
      });
    } catch (error: any) {
      console.error('Search destinations error:', error);
      return JSON.stringify({ success: false, error: error?.message || 'Search failed' });
    }
  },
  {
    name: "search_destinations",
    description: "Search for travel destinations based on criteria like location, trip type, or budget. Use this when the user is exploring options or asks for destination recommendations.",
    schema: z.object({
      query: z.string().optional().describe("Search query - destination name, country, or keywords like 'beach', 'temples', 'food'"),
      tripType: z.string().optional().describe("Type of trip: 'romantic', 'adventure', 'cultural', 'family', 'luxury', 'budget', 'relaxation'"),
      budget: z.number().optional().describe("Maximum daily budget per person in user's currency"),
      currency: z.string().optional().describe("Currency code for budget (e.g., 'USD', 'INR', 'EUR')")
    })
  }
);

/**
 * Tool to get detailed information about a specific destination
 */
export const getDestinationInfoTool = tool(
  async ({ destinationId, destinationName, currency }) => {
    try {
      const targetCurrency = currency || 'USD';
      
      // Find the destination
      let destination = DESTINATIONS_DATA.find(d => 
        d.id.toLowerCase() === destinationId?.toLowerCase() ||
        d.name.toLowerCase() === destinationName?.toLowerCase()
      );

      if (!destination) {
        // Try partial match
        destination = DESTINATIONS_DATA.find(d =>
          d.name.toLowerCase().includes(destinationName?.toLowerCase() || '') ||
          d.country.toLowerCase().includes(destinationName?.toLowerCase() || '')
        );
      }

      if (!destination) {
        return JSON.stringify({
          success: false,
          message: `I don't have detailed information about "${destinationName || destinationId}". Would you like me to help you with another destination?`
        });
      }

      const dailyBudget = Math.round(convertCurrency(destination.avgDailyBudgetUSD, 'USD', targetCurrency));
      const weeklyEstimate = dailyBudget * 7;

      return JSON.stringify({
        success: true,
        destination: {
          id: destination.id,
          name: destination.name,
          country: destination.country,
          description: destination.description,
          highlights: destination.highlights,
          bestTimeToVisit: destination.bestTime,
          estimatedDailyBudget: dailyBudget,
          estimatedWeeklyBudget: weeklyEstimate,
          currency: targetCurrency,
          suitableFor: destination.tripTypes
        }
      });
    } catch (error: any) {
      console.error('Get destination info error:', error);
      return JSON.stringify({ success: false, error: error?.message || 'Failed to get destination info' });
    }
  },
  {
    name: "get_destination_info",
    description: "Get detailed information about a specific travel destination. Use when user asks for specifics about a place - best time to visit, budget estimates, highlights, etc.",
    schema: z.object({
      destinationId: z.string().optional().describe("ISO country code of the destination"),
      destinationName: z.string().optional().describe("Name of the destination"),
      currency: z.string().optional().describe("Currency code for budget estimates")
    })
  }
);

/**
 * Tool to convert currency
 */
export const convertCurrencyTool = tool(
  async ({ amount, fromCurrency, toCurrency }) => {
    try {
      const converted = convertCurrency(amount, fromCurrency, toCurrency);
      
      return JSON.stringify({
        success: true,
        original: { amount, currency: fromCurrency },
        converted: { amount: Math.round(converted * 100) / 100, currency: toCurrency },
        rate: CURRENCY_RATES[toCurrency] / CURRENCY_RATES[fromCurrency]
      });
    } catch (error: any) {
      console.error('Currency conversion error:', error);
      return JSON.stringify({ success: false, error: error?.message || 'Conversion failed' });
    }
  },
  {
    name: "convert_currency",
    description: "Convert an amount between currencies. Use when user asks about prices in different currencies or needs budget conversion.",
    schema: z.object({
      amount: z.number().describe("Amount to convert"),
      fromCurrency: z.string().describe("Source currency code (e.g., 'USD')"),
      toCurrency: z.string().describe("Target currency code (e.g., 'INR')")
    })
  }
);

export const searchTools = [searchDestinationsTool, getDestinationInfoTool, convertCurrencyTool];

