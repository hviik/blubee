import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Currency Context Middleware
 * 
 * This middleware:
 * 1. Extracts geo-location from Vercel headers (x-vercel-ip-country)
 * 2. Resolves currency from country using static mapping
 * 3. Passes currency context to downstream handlers via headers
 * 
 * Server-first enforcement: Never rely on browser locale.
 */

// Static country to currency mapping (subset for middleware - full map in lib/currency)
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  'US': 'USD', 'GB': 'GBP', 'EU': 'EUR', 'JP': 'JPY', 'AU': 'AUD',
  'CA': 'CAD', 'CH': 'CHF', 'CN': 'CNY', 'IN': 'INR', 'AE': 'AED',
  'SG': 'SGD', 'HK': 'HKD', 'NZ': 'NZD', 'KR': 'KRW', 'MX': 'MXN',
  'BR': 'BRL', 'ZA': 'ZAR', 'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK',
  'PL': 'PLN', 'TH': 'THB', 'ID': 'IDR', 'MY': 'MYR', 'PH': 'PHP',
  'VN': 'VND', 'RU': 'RUB', 'TR': 'TRY', 'SA': 'SAR', 'QA': 'QAR',
  // Eurozone
  'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
  'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR', 'IE': 'EUR', 'FI': 'EUR',
  'GR': 'EUR', 'LU': 'EUR', 'SK': 'EUR', 'SI': 'EUR', 'EE': 'EUR',
  'LV': 'EUR', 'LT': 'EUR', 'MT': 'EUR', 'CY': 'EUR', 'HR': 'EUR',
  // Additional common destinations
  'LK': 'LKR', 'PK': 'PKR', 'BD': 'BDT', 'NP': 'NPR', 'EG': 'EGP',
  'NG': 'NGN', 'KE': 'KES', 'CO': 'COP', 'AR': 'ARS', 'CL': 'CLP',
  'PE': 'PEN', 'MV': 'MVR', 'MM': 'MMK', 'KH': 'KHR', 'LA': 'LAK',
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'AUD': 'A$',
  'CAD': 'C$', 'CHF': 'Fr', 'CNY': '¥', 'INR': '₹', 'AED': 'د.إ',
  'SGD': 'S$', 'HKD': 'HK$', 'NZD': 'NZ$', 'KRW': '₩', 'MXN': '$',
  'BRL': 'R$', 'ZAR': 'R', 'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr',
  'PLN': 'zł', 'THB': '฿', 'IDR': 'Rp', 'MYR': 'RM', 'PHP': '₱',
  'VND': '₫', 'RUB': '₽', 'TRY': '₺', 'SAR': '﷼', 'QAR': '﷼',
  'LKR': '₨', 'PKR': '₨', 'BDT': '৳', 'NPR': '₨', 'MVR': 'Rf',
};

const CURRENCY_NAMES: Record<string, string> = {
  'USD': 'US Dollar', 'EUR': 'Euro', 'GBP': 'British Pound',
  'JPY': 'Japanese Yen', 'AUD': 'Australian Dollar', 'CAD': 'Canadian Dollar',
  'CHF': 'Swiss Franc', 'CNY': 'Chinese Yuan', 'INR': 'Indian Rupee',
  'AED': 'UAE Dirham', 'SGD': 'Singapore Dollar', 'HKD': 'Hong Kong Dollar',
  'NZD': 'New Zealand Dollar', 'KRW': 'South Korean Won', 'MXN': 'Mexican Peso',
  'BRL': 'Brazilian Real', 'ZAR': 'South African Rand', 'SEK': 'Swedish Krona',
  'NOK': 'Norwegian Krone', 'DKK': 'Danish Krone', 'PLN': 'Polish Zloty',
  'THB': 'Thai Baht', 'IDR': 'Indonesian Rupiah', 'MYR': 'Malaysian Ringgit',
  'PHP': 'Philippine Peso', 'VND': 'Vietnamese Dong', 'RUB': 'Russian Ruble',
  'TRY': 'Turkish Lira', 'SAR': 'Saudi Riyal', 'QAR': 'Qatari Riyal',
  'LKR': 'Sri Lankan Rupee', 'PKR': 'Pakistani Rupee', 'BDT': 'Bangladeshi Taka',
  'NPR': 'Nepalese Rupee', 'MVR': 'Maldivian Rufiyaa',
};

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/api/booking/save(.*)',
  '/api/trips(.*)',
  '/api/wishlist(.*)',
]);

// Resolve currency from country code
function resolveCurrency(countryCode: string | null): { 
  currency: string; 
  country: string; 
  source: 'geo' | 'default';
  symbol: string;
  name: string;
} {
  const country = countryCode?.toUpperCase() || 'US';
  const currency = COUNTRY_TO_CURRENCY[country] || 'USD';
  const source = countryCode ? 'geo' : 'default';
  
  return {
    currency,
    country: country || 'US',
    source,
    symbol: CURRENCY_SYMBOLS[currency] || '$',
    name: CURRENCY_NAMES[currency] || 'US Dollar',
  };
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Protect routes that require authentication
  if (isProtectedRoute(request)) {
    await auth.protect();
  }

  // Extract geo information from Vercel headers
  const vercelCountry = request.headers.get('x-vercel-ip-country');
  
  // Check for user currency override in header
  const userCurrencyOverride = request.headers.get('x-user-currency');
  
  // Resolve currency context
  let currencyContext;
  
  if (userCurrencyOverride && /^[A-Z]{3}$/.test(userCurrencyOverride.toUpperCase())) {
    // User override takes precedence
    const currency = userCurrencyOverride.toUpperCase();
    currencyContext = {
      currency,
      country: vercelCountry?.toUpperCase() || 'US',
      source: 'user_override' as const,
      symbol: CURRENCY_SYMBOLS[currency] || '$',
      name: CURRENCY_NAMES[currency] || currency,
      resolvedAt: new Date().toISOString(),
    };
  } else {
    // Geo-based resolution
    const resolved = resolveCurrency(vercelCountry);
    currencyContext = {
      ...resolved,
      resolvedAt: new Date().toISOString(),
    };
  }

  // Log fallback usage in production
  if (currencyContext.source === 'default' && process.env.NODE_ENV === 'production') {
    console.log('[Middleware] Currency fallback used:', {
      path: request.nextUrl.pathname,
      vercelCountry,
      fallbackCurrency: currencyContext.currency,
    });
  }

  // Create response with currency context headers
  const response = NextResponse.next();
  
  // Add currency context to response headers for downstream use
  response.headers.set('x-currency-code', currencyContext.currency);
  response.headers.set('x-currency-country', currencyContext.country);
  response.headers.set('x-currency-source', currencyContext.source);
  response.headers.set('x-currency-symbol', currencyContext.symbol);
  response.headers.set('x-currency-name', currencyContext.name);
  
  // Encode full context for complex consumers
  const encodedContext = Buffer.from(JSON.stringify(currencyContext)).toString('base64');
  response.headers.set('x-currency-context', encodedContext);

  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
