/**
 * Currency Context Resolver
 * 
 * This module provides server-side currency resolution based on:
 * 1. User override (highest priority)
 * 2. Geo-detection from Vercel headers
 * 3. Default fallback (USD/US)
 * 
 * All resolution happens on the server - never trust client-side locale.
 * 
 * NOTE: This module does NOT import next/headers. Instead, headers must be
 * passed as parameters from the calling code (API routes, middleware, etc.)
 */

import {
  CurrencyContext,
  CurrencySource,
  CurrencyValidationResult,
  ISO4217CurrencyCode,
  ISO3166CountryCode,
  DEFAULT_CURRENCY,
  DEFAULT_COUNTRY,
  DEFAULT_SYMBOL,
  DEFAULT_NAME,
  createDefaultCurrencyContext,
  toISO4217,
  toISO3166,
  isISO4217,
  isISO3166,
} from './types';
import { 
  getCurrencyForCountry, 
  getCurrencyMetadata,
  isSupportedCurrency 
} from './countryToCurrency';

/**
 * Logger for currency resolution events
 * In production, this should integrate with your logging infrastructure
 */
function logCurrencyEvent(
  event: 'resolution' | 'fallback' | 'override' | 'validation_error' | 'warning',
  details: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    module: 'currency',
    event,
    ...details,
  };
  
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('[Currency]', JSON.stringify(logEntry));
  } else {
    // In production, you might want to send to a logging service
    console.log('[Currency]', JSON.stringify(logEntry));
  }
}

/**
 * Extract country code from Vercel geo headers
 * Primary signal: x-vercel-ip-country
 * Fallback: US
 */
export function extractCountryFromHeaders(headersList: Headers): ISO3166CountryCode {
  const vercelCountry = headersList.get('x-vercel-ip-country');
  
  if (vercelCountry) {
    const country = toISO3166(vercelCountry);
    if (country) {
      return country;
    }
    logCurrencyEvent('warning', {
      message: 'Invalid country code from Vercel header',
      received: vercelCountry,
      fallback: DEFAULT_COUNTRY,
    });
  }
  
  // Fallback to default
  logCurrencyEvent('fallback', {
    reason: 'No valid country in headers',
    fallback: DEFAULT_COUNTRY,
  });
  
  return DEFAULT_COUNTRY;
}

/**
 * Extract user currency override from headers or cookies
 */
export function extractUserOverride(headersList: Headers): ISO4217CurrencyCode | null {
  // Check custom header for user override
  const userCurrency = headersList.get('x-user-currency');
  if (userCurrency) {
    const currency = toISO4217(userCurrency);
    if (currency) {
      logCurrencyEvent('override', {
        source: 'header',
        currency,
      });
      return currency;
    }
  }
  
  // Check for full currency context header (base64 encoded JSON)
  const contextHeader = headersList.get('x-currency-context');
  if (contextHeader) {
    try {
      const decoded = JSON.parse(Buffer.from(contextHeader, 'base64').toString('utf-8'));
      if (decoded.currency && decoded.source === 'user_override') {
        const currency = toISO4217(decoded.currency);
        if (currency) {
          logCurrencyEvent('override', {
            source: 'context_header',
            currency,
          });
          return currency;
        }
      }
    } catch {
      // Ignore invalid context headers
    }
  }
  
  return null;
}

/**
 * Resolve currency from country code
 */
export function resolveCurrencyFromCountry(country: ISO3166CountryCode): ISO4217CurrencyCode {
  const currency = getCurrencyForCountry(country);
  
  if (currency) {
    return currency;
  }
  
  // Fallback for unknown countries
  logCurrencyEvent('fallback', {
    reason: 'Unknown country',
    country,
    fallback: DEFAULT_CURRENCY,
  });
  
  return DEFAULT_CURRENCY;
}

/**
 * Build full currency context from resolved values
 */
export function buildCurrencyContext(
  currency: ISO4217CurrencyCode,
  country: ISO3166CountryCode,
  source: CurrencySource
): CurrencyContext {
  const metadata = getCurrencyMetadata(currency);
  
  return {
    currency,
    country,
    source,
    symbol: metadata.symbol,
    name: metadata.name,
    resolvedAt: new Date().toISOString(),
  };
}

/**
 * Resolve currency context from incoming request headers
 * 
 * Resolution order:
 * 1. User override (from header or stored preference)
 * 2. Geo-detected country → currency mapping
 * 3. Default fallback (USD/US)
 * 
 * @param headersList Request headers (from request.headers or headers())
 * @param userOverride Optional user-stored currency preference
 * @returns Resolved currency context
 */
export function resolveCurrencyContext(
  headersList: Headers,
  userOverride?: { currency?: string; country?: string } | null
): CurrencyContext {
  // 1. Check for user override (highest priority)
  if (userOverride?.currency) {
    const currency = toISO4217(userOverride.currency);
    const country = userOverride.country 
      ? toISO3166(userOverride.country) || DEFAULT_COUNTRY
      : DEFAULT_COUNTRY;
    
    if (currency) {
      logCurrencyEvent('resolution', {
        source: 'user_override',
        currency,
        country,
      });
      return buildCurrencyContext(currency, country, 'user_override');
    }
  }
  
  // Check header-based override
  const headerOverride = extractUserOverride(headersList);
  if (headerOverride) {
    const country = extractCountryFromHeaders(headersList);
    logCurrencyEvent('resolution', {
      source: 'header_override',
      currency: headerOverride,
      country,
    });
    return buildCurrencyContext(headerOverride, country, 'user_override');
  }
  
  // 2. Geo-detection from Vercel headers
  const country = extractCountryFromHeaders(headersList);
  const currency = resolveCurrencyFromCountry(country);
  
  logCurrencyEvent('resolution', {
    source: 'geo',
    currency,
    country,
  });
  
  return buildCurrencyContext(currency, country, 'geo');
}

/**
 * Resolve currency context synchronously from provided headers
 * Use this when you already have access to headers (e.g., in middleware)
 */
export function resolveCurrencyContextSync(
  headersList: Headers,
  userOverride?: { currency?: string; country?: string } | null
): CurrencyContext {
  // 1. Check for user override (highest priority)
  if (userOverride?.currency) {
    const currency = toISO4217(userOverride.currency);
    const country = userOverride.country 
      ? toISO3166(userOverride.country) || DEFAULT_COUNTRY
      : DEFAULT_COUNTRY;
    
    if (currency) {
      return buildCurrencyContext(currency, country, 'user_override');
    }
  }
  
  // Check header-based override
  const headerOverride = extractUserOverride(headersList);
  if (headerOverride) {
    const country = extractCountryFromHeaders(headersList);
    return buildCurrencyContext(headerOverride, country, 'user_override');
  }
  
  // 2. Geo-detection from headers
  const country = extractCountryFromHeaders(headersList);
  const currency = resolveCurrencyFromCountry(country);
  
  return buildCurrencyContext(currency, country, 'geo');
}

/**
 * Validate that a request contains required currency context
 * 
 * @param requestBody The request body to validate
 * @returns Validation result with context or error
 */
export function validateCurrencyInRequest(
  requestBody: Record<string, unknown>
): CurrencyValidationResult {
  const warnings: string[] = [];
  
  // Check for currency field
  const currencyValue = requestBody.currency;
  if (!currencyValue) {
    return {
      isValid: false,
      error: 'Missing required field: currency (ISO-4217 code)',
    };
  }
  
  if (typeof currencyValue !== 'string') {
    return {
      isValid: false,
      error: `Invalid currency type: expected string, got ${typeof currencyValue}`,
    };
  }
  
  if (!isISO4217(currencyValue.toUpperCase())) {
    return {
      isValid: false,
      error: `Invalid currency format: ${currencyValue}. Must be 3-letter ISO-4217 code`,
    };
  }
  
  const currency = currencyValue.toUpperCase() as ISO4217CurrencyCode;
  
  // Check for country field
  const countryValue = requestBody.country;
  let country: ISO3166CountryCode = DEFAULT_COUNTRY;
  
  if (!countryValue) {
    warnings.push('Missing country field, using default: US');
    logCurrencyEvent('warning', {
      message: 'Request missing country field',
      currency,
      defaultCountry: DEFAULT_COUNTRY,
    });
  } else if (typeof countryValue !== 'string') {
    warnings.push(`Invalid country type: expected string, got ${typeof countryValue}. Using default: US`);
  } else if (!isISO3166(countryValue.toUpperCase())) {
    warnings.push(`Invalid country format: ${countryValue}. Using default: US`);
  } else {
    country = countryValue.toUpperCase() as ISO3166CountryCode;
  }
  
  // Determine source
  let source: CurrencySource = 'default';
  if (requestBody.currencyContext && typeof requestBody.currencyContext === 'object') {
    const ctx = requestBody.currencyContext as Record<string, unknown>;
    if (ctx.source === 'user_override' || ctx.source === 'geo' || ctx.source === 'default') {
      source = ctx.source;
    }
  }
  
  const context = buildCurrencyContext(currency, country, source);
  
  return {
    isValid: true,
    context,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Auto-inject currency context into request body if missing
 * Used for backward compatibility during migration
 * 
 * @param requestBody The request body to augment
 * @param headersList Request headers for geo-detection
 * @returns Augmented request body with currency context
 */
export function autoInjectCurrencyContext(
  requestBody: Record<string, unknown>,
  headersList: Headers
): { body: Record<string, unknown>; injected: boolean; warnings: string[] } {
  const warnings: string[] = [];
  let injected = false;
  
  // If currency is already present and valid, don't inject
  if (requestBody.currency && typeof requestBody.currency === 'string' && isISO4217(requestBody.currency.toUpperCase())) {
    // Just normalize to uppercase
    requestBody.currency = (requestBody.currency as string).toUpperCase();
    
    // Inject country if missing
    if (!requestBody.country) {
      const country = extractCountryFromHeaders(headersList);
      requestBody.country = country;
      warnings.push(`Auto-injected country: ${country}`);
      injected = true;
    }
    
    return { body: requestBody, injected, warnings };
  }
  
  // Auto-inject from geo-detection
  const context = resolveCurrencyContextSync(headersList);
  
  requestBody.currency = context.currency;
  requestBody.country = context.country;
  requestBody.currencyContext = context;
  
  warnings.push(`Auto-injected currency context: ${context.currency}/${context.country} (source: ${context.source})`);
  logCurrencyEvent('warning', {
    message: 'Request missing currency - auto-injected',
    injectedContext: context,
  });
  
  return { body: requestBody, injected: true, warnings };
}

/**
 * Encode currency context for transmission in headers
 */
export function encodeCurrencyContext(context: CurrencyContext): string {
  return Buffer.from(JSON.stringify(context)).toString('base64');
}

/**
 * Decode currency context from header value
 */
export function decodeCurrencyContext(encoded: string): CurrencyContext | null {
  try {
    const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
    if (decoded.currency && decoded.country && decoded.source) {
      return decoded as CurrencyContext;
    }
  } catch {
    // Invalid encoding
  }
  return null;
}
