import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface TravelListing {
  id: string;
  destination: string;
  country: string;
  imageUrl?: string;
  price: number;
  currency: string;
  description: string;
  duration: string;
  rating?: number;
}

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

async function searchAmadeus(query: string, currency: string) {
  const amadeusClientId = process.env.AMADEUS_CLIENT_ID;
  const amadeusClientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!amadeusClientId || !amadeusClientSecret) {
    console.warn('Amadeus credentials not configured');
    return [];
  }

  try {
    const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: amadeusClientId,
        client_secret: amadeusClientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get Amadeus token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const searchResponse = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations?keyword=${encodeURIComponent(query)}&subType=CITY,AIRPORT`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error('Amadeus search failed');
    }

    const searchData = await searchResponse.json();
    
    const listings: TravelListing[] = (searchData.data || []).slice(0, 20).map((item: any, index: number) => ({
      id: `amadeus_${item.iataCode || index}`,
      destination: item.name || query,
      country: item.address?.countryCode || 'Unknown',
      description: `Explore ${item.name || query} - a beautiful destination waiting for you.`,
      duration: '7 days',
      price: Math.floor(convertCurrency(500 + Math.random() * 1000, 'USD', currency)),
      currency,
      rating: 4.0 + Math.random() * 1.0,
    }));

    return listings;
  } catch (error) {
    console.error('Amadeus API error:', error);
    return [];
  }
}

async function getListingsFromSupabase(query: string, currency: string) {
  try {
    const { supabaseAdmin } = await import('@/lib/supabaseServer');
    
    let queryBuilder = supabaseAdmin
      .from('travel_listings')
      .select('*')
      .limit(50);

    if (query) {
      queryBuilder = queryBuilder.or(`destination.ilike.%${query}%,country.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Supabase error:', error);
      return [];
    }

    const listings: TravelListing[] = (data || []).map((item: any) => ({
      id: item.id,
      destination: item.destination,
      country: item.country,
      imageUrl: item.image_url,
      description: item.description,
      duration: item.duration || '7 days',
      price: Math.floor(convertCurrency(item.price_usd || 500, 'USD', currency)),
      currency,
      rating: item.rating,
    }));

    return listings;
  } catch (error) {
    console.error('Supabase query error:', error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const currency = searchParams.get('currency') || 'USD';

    let listings: TravelListing[] = [];

    listings = await getListingsFromSupabase(query, currency);

    if (listings.length === 0 && query) {
      listings = await searchAmadeus(query, currency);
    }

    if (listings.length === 0) {
      const defaultDestinations = [
        { name: 'Bali', country: 'Indonesia', price: 800 },
        { name: 'Paris', country: 'France', price: 1200 },
        { name: 'Tokyo', country: 'Japan', price: 1500 },
        { name: 'New York', country: 'United States', price: 1000 },
        { name: 'Dubai', country: 'United Arab Emirates', price: 1100 },
        { name: 'Bangkok', country: 'Thailand', price: 600 },
        { name: 'London', country: 'United Kingdom', price: 1300 },
        { name: 'Sydney', country: 'Australia', price: 1400 },
      ];

      listings = defaultDestinations.map((dest, index) => ({
        id: `default_${index}`,
        destination: dest.name,
        country: dest.country,
        description: `Discover the beauty of ${dest.name}, ${dest.country}. Experience amazing culture, food, and adventures.`,
        duration: '7 days',
        price: Math.floor(convertCurrency(dest.price, 'USD', currency)),
        currency,
        rating: 4.2 + Math.random() * 0.6,
      }));
    }

    return NextResponse.json({
      listings,
      currency,
      query,
    });
  } catch (error: any) {
    console.error('Explore API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error', listings: [] },
      { status: 500 }
    );
  }
}

