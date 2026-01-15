/**
 * Currency Context Hook
 * 
 * This hook provides the canonical currency context for the application.
 * It fetches the currency from the server (geo-detection + user override)
 * and provides it to components that need to display prices.
 * 
 * SERVER-FIRST: Currency is resolved on the server, not client-side.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Currency context from server
 */
export interface CurrencyContext {
  currency: string;
  country: string;
  source: 'user_override' | 'geo' | 'default';
  symbol: string;
  name: string;
  resolvedAt: string;
}

interface UseCurrencyContextReturn {
  /** Resolved currency context */
  currencyContext: CurrencyContext | null;
  /** Loading state */
  isLoading: boolean;
  /** Error if any */
  error: string | null;
  /** Refresh the currency context from server */
  refresh: () => Promise<void>;
  /** Update user's currency preference */
  updateCurrency: (currency: string, country?: string) => Promise<boolean>;
  /** Reset to geo-detection */
  resetCurrency: () => Promise<boolean>;
}

// Default context while loading
const DEFAULT_CONTEXT: CurrencyContext = {
  currency: 'USD',
  country: 'US',
  source: 'default',
  symbol: '$',
  name: 'US Dollar',
  resolvedAt: new Date().toISOString(),
};

/**
 * Hook to get and manage currency context
 * 
 * Usage:
 * ```tsx
 * const { currencyContext, isLoading, updateCurrency } = useCurrencyContext();
 * ```
 */
export function useCurrencyContext(): UseCurrencyContextReturn {
  const [currencyContext, setCurrencyContext] = useState<CurrencyContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch currency context from server
  const fetchCurrency = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/currency', {
        method: 'GET',
        credentials: 'include', // Include cookies for auth
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch currency: ${response.status}`);
      }

      const context: CurrencyContext = await response.json();
      setCurrencyContext(context);

      // Cache in sessionStorage for quick subsequent loads
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('currencyContext', JSON.stringify(context));
      }
    } catch (err) {
      console.error('[useCurrencyContext] Error fetching currency:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch currency');
      
      // Use cached value if available
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem('currencyContext');
        if (cached) {
          try {
            setCurrencyContext(JSON.parse(cached));
            return;
          } catch {
            // Invalid cache
          }
        }
      }
      
      // Fall back to default
      setCurrencyContext(DEFAULT_CONTEXT);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user's currency preference
  const updateCurrency = useCallback(async (currency: string, country?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currency, country }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update currency');
      }

      const data = await response.json();
      if (data.context) {
        setCurrencyContext(data.context);
        // Update cache
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('currencyContext', JSON.stringify(data.context));
        }
      }

      return true;
    } catch (err) {
      console.error('[useCurrencyContext] Error updating currency:', err);
      setError(err instanceof Error ? err.message : 'Failed to update currency');
      return false;
    }
  }, []);

  // Reset to geo-detection
  const resetCurrency = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/currency', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to reset currency');
      }

      const data = await response.json();
      if (data.context) {
        setCurrencyContext(data.context);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('currencyContext', JSON.stringify(data.context));
        }
      }

      return true;
    } catch (err) {
      console.error('[useCurrencyContext] Error resetting currency:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset currency');
      return false;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    // Try to use cached value first for instant display
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('currencyContext');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setCurrencyContext(parsed);
          setIsLoading(false);
          // Still refresh in background to ensure fresh data
          fetchCurrency();
          return;
        } catch {
          // Invalid cache, proceed with fetch
        }
      }
    }
    
    fetchCurrency();
  }, [fetchCurrency]);

  return {
    currencyContext,
    isLoading,
    error,
    refresh: fetchCurrency,
    updateCurrency,
    resetCurrency,
  };
}

/**
 * Format a price using the currency context
 */
export function formatPriceWithContext(
  amount: number,
  context: CurrencyContext | null
): string {
  const currency = context?.currency || 'USD';
  const symbol = context?.symbol || '$';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
}
