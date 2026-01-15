/**
 * Currency Module - Public API
 * 
 * This module exports all currency-related functionality for the application.
 * Use these exports throughout the codebase for consistent currency handling.
 */

// Types
export type {
  ISO4217CurrencyCode,
  ISO3166CountryCode,
  CurrencySource,
  CurrencyContext,
  CurrencyInfo,
  CurrencyRequestHeaders,
  CurrencyAwareRequest,
  CurrencyValidationResult,
} from './types';

// Type guards and utilities
export {
  DEFAULT_CURRENCY,
  DEFAULT_COUNTRY,
  DEFAULT_SYMBOL,
  DEFAULT_NAME,
  createDefaultCurrencyContext,
  isISO4217,
  isISO3166,
  toISO4217,
  toISO3166,
} from './types';

// Country to Currency mapping
export {
  COUNTRY_TO_CURRENCY,
  CURRENCY_METADATA,
  getCurrencyForCountry,
  getCurrencyMetadata,
  isSupportedCurrency,
  getSupportedCurrencies,
} from './countryToCurrency';
export type { CurrencyMetadata } from './countryToCurrency';

// Resolver
export {
  extractCountryFromHeaders,
  extractUserOverride,
  resolveCurrencyFromCountry,
  buildCurrencyContext,
  resolveCurrencyContext,
  resolveCurrencyContextSync,
  validateCurrencyInRequest,
  autoInjectCurrencyContext,
  encodeCurrencyContext,
  decodeCurrencyContext,
} from './resolver';

// Formatting utilities
export {
  formatPrice,
  formatPriceCompact,
  formatPriceRange,
} from './format';
