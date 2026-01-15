/**
 * Currency Formatting Utilities
 * 
 * This module provides consistent price formatting across the application.
 * All formatting uses ISO-4217 currency codes and respects currency-specific
 * decimal places and formatting rules.
 */

import { ISO4217CurrencyCode, CurrencyContext, CurrencyInfo } from './types';
import { getCurrencyMetadata } from './countryToCurrency';

/**
 * Format a price with full currency information
 * 
 * @param amount The numeric amount to format
 * @param currencyCode ISO-4217 currency code
 * @param locale Optional locale for number formatting (default: en-US)
 * @returns Formatted price string
 */
export function formatPrice(
  amount: number,
  currencyCode: ISO4217CurrencyCode | string,
  locale: string = 'en-US'
): string {
  const code = currencyCode.toUpperCase();
  const metadata = getCurrencyMetadata(code);
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: metadata.decimalPlaces,
      maximumFractionDigits: metadata.decimalPlaces,
    }).format(amount);
  } catch {
    // Fallback for unsupported currencies
    const rounded = metadata.decimalPlaces === 0 
      ? Math.round(amount) 
      : Number(amount.toFixed(metadata.decimalPlaces));
    return `${metadata.symbol}${rounded.toLocaleString(locale)}`;
  }
}

/**
 * Format a price in compact form (for limited space)
 * Uses K for thousands, M for millions
 * 
 * @param amount The numeric amount to format
 * @param currencyCode ISO-4217 currency code
 * @returns Compact formatted price string
 */
export function formatPriceCompact(
  amount: number,
  currencyCode: ISO4217CurrencyCode | string
): string {
  const code = currencyCode.toUpperCase();
  const metadata = getCurrencyMetadata(code);
  
  let suffix = '';
  let displayAmount = amount;
  
  if (amount >= 1_000_000) {
    displayAmount = amount / 1_000_000;
    suffix = 'M';
  } else if (amount >= 1_000) {
    displayAmount = amount / 1_000;
    suffix = 'K';
  }
  
  // For compact display, limit decimal places
  const decimals = suffix ? 1 : metadata.decimalPlaces;
  const rounded = Number(displayAmount.toFixed(decimals));
  
  // Remove trailing zeros for compact format
  const formatted = suffix 
    ? rounded.toString().replace(/\.0$/, '') 
    : rounded.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: metadata.decimalPlaces,
      });
  
  return `${metadata.symbol}${formatted}${suffix}`;
}

/**
 * Format a price range (e.g., "$100 - $200")
 * 
 * @param minAmount Minimum amount
 * @param maxAmount Maximum amount
 * @param currencyCode ISO-4217 currency code
 * @returns Formatted price range string
 */
export function formatPriceRange(
  minAmount: number,
  maxAmount: number,
  currencyCode: ISO4217CurrencyCode | string
): string {
  const code = currencyCode.toUpperCase();
  const metadata = getCurrencyMetadata(code);
  
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0, // No decimals for ranges
    });
    
    return `${formatter.format(minAmount)} - ${formatter.format(maxAmount)}`;
  } catch {
    const minFormatted = Math.round(minAmount).toLocaleString('en-US');
    const maxFormatted = Math.round(maxAmount).toLocaleString('en-US');
    return `${metadata.symbol}${minFormatted} - ${metadata.symbol}${maxFormatted}`;
  }
}

/**
 * Format price using CurrencyInfo object (legacy compatibility)
 */
export function formatPriceWithInfo(
  amount: number,
  currencyInfo: CurrencyInfo
): string {
  return formatPrice(amount, currencyInfo.code);
}

/**
 * Format price using CurrencyContext (preferred)
 */
export function formatPriceWithContext(
  amount: number,
  context: CurrencyContext
): string {
  return formatPrice(amount, context.currency);
}

/**
 * Get currency display info for UI
 */
export function getCurrencyDisplayInfo(currencyCode: string): {
  code: string;
  symbol: string;
  name: string;
} {
  const metadata = getCurrencyMetadata(currencyCode);
  return {
    code: metadata.code,
    symbol: metadata.symbol,
    name: metadata.name,
  };
}
