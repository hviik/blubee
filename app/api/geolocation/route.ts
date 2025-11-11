import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 10;

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  EU: 'EUR',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  GR: 'EUR',
  FI: 'EUR',
  JP: 'JPY',
  CN: 'CNY',
  IN: 'INR',
  KR: 'KRW',
  SG: 'SGD',
  MY: 'MYR',
  TH: 'THB',
  ID: 'IDR',
  PH: 'PHP',
  VN: 'VND',
  BR: 'BRL',
  MX: 'MXN',
  AR: 'ARS',
  CL: 'CLP',
  ZA: 'ZAR',
  AE: 'AED',
  SA: 'SAR',
  TR: 'TRY',
  RU: 'RUB',
};

export async function GET(req: NextRequest) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || '';

    let country = 'US';
    let currency = 'USD';

    if (ip) {
      try {
        const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        });

        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          country = geoData.country_code || 'US';
          currency = COUNTRY_TO_CURRENCY[country] || geoData.currency || 'USD';
        }
      } catch (error) {
        console.error('IP geolocation error:', error);
      }
    }

    const countryHeader = req.headers.get('x-vercel-ip-country');
    if (countryHeader) {
      country = countryHeader;
      currency = COUNTRY_TO_CURRENCY[country] || 'USD';
    }

    return NextResponse.json({
      country,
      currency,
      ip: ip || 'unknown',
    });
  } catch (error: any) {
    console.error('Geolocation API error:', error);
    return NextResponse.json(
      {
        country: 'US',
        currency: 'USD',
        ip: 'unknown',
      },
      { status: 200 } // Return default values instead of error
    );
  }
}

