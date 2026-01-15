/**
 * @deprecated This module is deprecated. Use lib/currency instead.
 * 
 * This file is kept for backward compatibility during migration.
 * All new code should use:
 * - import { useCurrencyContext } from '@/app/hooks/useCurrencyContext' for React components
 * - import { resolveCurrencyContext } from '@/lib/currency' for server-side resolution
 * 
 * Migration path:
 * 1. Replace detectUserCurrency() with useCurrencyContext() hook
 * 2. Replace CurrencyInfo with CurrencyContext from lib/currency
 * 3. Remove this import after migration is complete
 */

import {
  CurrencyContext,
  getCurrencyMetadata,
  DEFAULT_CURRENCY,
} from '@/lib/currency';

/**
 * @deprecated Use CurrencyContext from lib/currency instead
 */
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

/**
 * @deprecated Use useCurrencyContext() hook or resolveCurrencyContext() instead.
 * This function now fetches from the server API instead of using client-side detection.
 */
export async function detectUserCurrency(): Promise<CurrencyInfo> {
  console.warn(
    '[DEPRECATED] detectUserCurrency() is deprecated. ' +
    'Use useCurrencyContext() hook for React components or ' +
    'resolveCurrencyContext() for server-side resolution.'
  );

  // Check sessionStorage cache first (for backward compatibility)
  const cached = sessionStorage.getItem('userCurrency');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Invalid cache
    }
  }

  // Fall back to server API
  try {
    const response = await fetch('/api/currency', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const context: CurrencyContext = await response.json();
      const currencyInfo: CurrencyInfo = {
        code: context.currency,
        symbol: context.symbol,
        name: context.name,
      };
      
      // Cache for backward compatibility
      sessionStorage.setItem('userCurrency', JSON.stringify(currencyInfo));
      return currencyInfo;
    }
  } catch (error) {
    console.error('[DEPRECATED] Failed to fetch currency from API:', error);
  }

  // Fallback to USD
  const defaultMeta = getCurrencyMetadata(DEFAULT_CURRENCY);
  return {
    code: DEFAULT_CURRENCY,
    symbol: defaultMeta.symbol,
    name: defaultMeta.name,
  };
}

/**
 * @deprecated Exchange rates should be handled server-side.
 * This function is kept for backward compatibility but may be removed.
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  console.warn(
    '[DEPRECATED] getExchangeRate() is deprecated. ' +
    'Use single-currency pricing instead of client-side conversion.'
  );

  if (fromCurrency === toCurrency) return 1;

  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
      {
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      console.warn('Exchange rate fetch failed');
      return 1;
    }

    const data = await response.json();
    return data.rates[toCurrency] || 1;
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    return 1;
  }
}

/**
 * @deprecated Use formatPrice from lib/currency/format instead
 */
export function formatPrice(
  amount: number,
  currencyInfo: CurrencyInfo
): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currencyInfo.symbol} ${Math.round(amount).toLocaleString()}`;
  }
}

/**
 * @deprecated Use formatPrice from lib/currency/format with single currency
 */
export function convertAndFormat(
  amountINR: number,
  targetCurrency: CurrencyInfo,
  exchangeRate: number
): string {
  console.warn(
    '[DEPRECATED] convertAndFormat() is deprecated. ' +
    'Use single-currency pricing instead of client-side conversion.'
  );

  if (targetCurrency.code === 'INR') {
    return formatPrice(amountINR, targetCurrency);
  }
  
  const convertedAmount = Math.round(amountINR * exchangeRate);
  
  return formatPrice(convertedAmount, targetCurrency);
}
