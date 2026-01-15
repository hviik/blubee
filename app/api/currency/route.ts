import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import {
  CurrencyContext,
  resolveCurrencyContext,
  validateCurrencyInRequest,
  toISO4217,
  toISO3166,
  getCurrencyMetadata,
  DEFAULT_CURRENCY,
  DEFAULT_COUNTRY,
} from '@/lib/currency';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/currency
 * 
 * Returns the resolved currency context for the current request.
 * Uses geo-detection from Vercel headers, with user override if stored.
 * 
 * Response:
 * {
 *   currency: "USD",      // ISO-4217
 *   country: "US",        // ISO-3166-1 alpha-2
 *   source: "geo",        // user_override | geo | default
 *   symbol: "$",
 *   name: "US Dollar",
 *   resolvedAt: "2026-01-15T..."
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Check for authenticated user to get stored preference
    const { userId } = await auth();
    let userOverride: { currency?: string; country?: string } | null = null;

    if (userId) {
      // Fetch user's stored currency preference
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('preferred_currency, preferred_country, currency_source')
        .eq('id', userId)
        .single();

      if (profile?.preferred_currency && profile.currency_source === 'user_override') {
        userOverride = {
          currency: profile.preferred_currency,
          country: profile.preferred_country || undefined,
        };
      }
    }

    // Resolve currency context (handles geo-detection and overrides)
    const context = await resolveCurrencyContext(userOverride);

    return NextResponse.json(context, {
      headers: {
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
        'X-Currency-Code': context.currency,
        'X-Currency-Country': context.country,
      },
    });
  } catch (error) {
    console.error('[Currency API] Error resolving currency:', error);
    
    // Return default context on error
    const defaultContext: CurrencyContext = {
      currency: DEFAULT_CURRENCY,
      country: DEFAULT_COUNTRY,
      source: 'default',
      symbol: '$',
      name: 'US Dollar',
      resolvedAt: new Date().toISOString(),
    };

    return NextResponse.json(defaultContext, {
      status: 200, // Still return 200 with default
      headers: {
        'X-Currency-Fallback': 'true',
      },
    });
  }
}

/**
 * POST /api/currency
 * 
 * Updates the user's currency preference.
 * Requires authentication.
 * 
 * Request body:
 * {
 *   currency: "EUR",      // ISO-4217 - REQUIRED
 *   country?: "DE"        // ISO-3166-1 alpha-2 - optional
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   context: { ... }      // Updated currency context
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required to update currency preference' 
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate currency code
    if (!body.currency || typeof body.currency !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: currency (ISO-4217 code)' 
        },
        { status: 400 }
      );
    }

    const currency = toISO4217(body.currency);
    if (!currency) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid currency code: ${body.currency}. Must be 3-letter ISO-4217 code (e.g., USD, EUR, INR)` 
        },
        { status: 400 }
      );
    }

    // Validate country code if provided
    const country = body.country ? toISO3166(body.country) : null;

    // Get currency metadata
    const metadata = getCurrencyMetadata(currency);

    // Update user profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        preferred_currency: currency,
        preferred_country: country,
        currency_source: 'user_override',
        currency_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[Currency API] Error updating profile:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update currency preference' 
        },
        { status: 500 }
      );
    }

    // Build response context
    const context: CurrencyContext = {
      currency,
      country: country || DEFAULT_COUNTRY,
      source: 'user_override',
      symbol: metadata.symbol,
      name: metadata.name,
      resolvedAt: new Date().toISOString(),
    };

    console.log('[Currency API] Currency preference updated:', {
      userId,
      currency: context.currency,
      country: context.country,
    });

    return NextResponse.json({
      success: true,
      context,
      message: `Currency preference updated to ${metadata.name} (${currency})`,
    });
  } catch (error) {
    console.error('[Currency API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
        },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/currency
 * 
 * Resets user's currency preference to geo-detection.
 * Requires authentication.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    // Clear user preference
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        preferred_currency: null,
        preferred_country: null,
        currency_source: 'geo',
        currency_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[Currency API] Error resetting preference:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to reset currency preference' 
        },
        { status: 500 }
      );
    }

    // Resolve new context based on geo
    const context = await resolveCurrencyContext(null);

    return NextResponse.json({
      success: true,
      context,
      message: 'Currency preference reset to geo-detection',
    });
  } catch (error) {
    console.error('[Currency API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
