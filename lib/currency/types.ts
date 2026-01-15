/**
 * Canonical Currency Context Types
 * 
 * This module defines the canonical types for currency handling across the system.
 * All currency operations must use ISO-4217 currency codes and ISO-3166-1 alpha-2 country codes.
 */

/**
 * ISO-4217 currency code type
 * This is a branded type to ensure only valid ISO currency codes are used
 */
export type ISO4217CurrencyCode = string & { readonly __brand: 'ISO4217' };

/**
 * ISO-3166-1 alpha-2 country code type
 * This is a branded type to ensure only valid ISO country codes are used
 */
export type ISO3166CountryCode = string & { readonly __brand: 'ISO3166' };

/**
 * Source of currency resolution
 * - user_override: User explicitly selected this currency
 * - geo: Derived from geo-location detection
 * - default: System default (fallback)
 */
export type CurrencySource = 'user_override' | 'geo' | 'default';

/**
 * Canonical Currency Context
 * 
 * This is the single source of truth for currency information in a user session.
 * Every internal and external API request must include this context.
 */
export interface CurrencyContext {
  /** ISO-4217 currency code (e.g., USD, EUR, INR) */
  currency: ISO4217CurrencyCode;
  
  /** ISO-3166-1 alpha-2 country code (e.g., US, GB, IN) */
  country: ISO3166CountryCode;
  
  /** Source of the currency resolution */
  source: CurrencySource;
  
  /** Currency symbol for display (e.g., $, €, ₹) */
  symbol: string;
  
  /** Human-readable currency name */
  name: string;
  
  /** Timestamp when this context was resolved (ISO 8601) */
  resolvedAt: string;
}

/**
 * Currency info for display purposes
 */
export interface CurrencyInfo {
  code: ISO4217CurrencyCode;
  symbol: string;
  name: string;
}

/**
 * Request headers for currency context
 */
export interface CurrencyRequestHeaders {
  /** Vercel geo header for country detection */
  'x-vercel-ip-country'?: string;
  /** Custom header for user currency override */
  'x-user-currency'?: string;
  /** Custom header for passing full currency context */
  'x-currency-context'?: string;
}

/**
 * API request body contract - all API requests must include these fields
 */
export interface CurrencyAwareRequest {
  /** ISO-4217 currency code - REQUIRED */
  currency: ISO4217CurrencyCode;
  
  /** ISO-3166-1 alpha-2 country code - REQUIRED */
  country: ISO3166CountryCode;
  
  /** Optional: full currency context for traceability */
  currencyContext?: CurrencyContext;
}

/**
 * Validation result for currency context
 */
export interface CurrencyValidationResult {
  isValid: boolean;
  error?: string;
  context?: CurrencyContext;
  warnings?: string[];
}

/**
 * Default values
 */
export const DEFAULT_CURRENCY: ISO4217CurrencyCode = 'USD' as ISO4217CurrencyCode;
export const DEFAULT_COUNTRY: ISO3166CountryCode = 'US' as ISO3166CountryCode;
export const DEFAULT_SYMBOL = '$';
export const DEFAULT_NAME = 'US Dollar';

/**
 * Creates a default currency context (fallback)
 */
export function createDefaultCurrencyContext(): CurrencyContext {
  return {
    currency: DEFAULT_CURRENCY,
    country: DEFAULT_COUNTRY,
    source: 'default',
    symbol: DEFAULT_SYMBOL,
    name: DEFAULT_NAME,
    resolvedAt: new Date().toISOString(),
  };
}

/**
 * Type guard to check if a string is a valid ISO-4217 currency code
 */
export function isISO4217(code: string): code is ISO4217CurrencyCode {
  return /^[A-Z]{3}$/.test(code);
}

/**
 * Type guard to check if a string is a valid ISO-3166-1 alpha-2 country code
 */
export function isISO3166(code: string): code is ISO3166CountryCode {
  return /^[A-Z]{2}$/.test(code);
}

/**
 * Safely cast a string to ISO4217CurrencyCode after validation
 */
export function toISO4217(code: string): ISO4217CurrencyCode | null {
  const upper = code.toUpperCase();
  return isISO4217(upper) ? upper as ISO4217CurrencyCode : null;
}

/**
 * Safely cast a string to ISO3166CountryCode after validation
 */
export function toISO3166(code: string): ISO3166CountryCode | null {
  const upper = code.toUpperCase();
  return isISO3166(upper) ? upper as ISO3166CountryCode : null;
}
