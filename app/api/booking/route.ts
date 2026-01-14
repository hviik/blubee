import { NextRequest, NextResponse } from 'next/server';

const RAPIDAPI_KEY = process.env.RAPID_API_KEY;
const RAPIDAPI_HOST = 'booking-com.p.rapidapi.com';

export const dynamic = 'force-dynamic';

export interface HotelSearchParams {
  destination: string;
  checkInDate: string;  
  checkOutDate: string;
  adults?: number;
  rooms?: number;
  currency?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'popularity' | 'price' | 'review_score' | 'distance';
}

export interface HotelResult {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  photoUrl: string;
  rating: number;
  reviewScore: number;
  reviewScoreWord: string;
  reviewCount: number;
  price: number;
  currency: string;
  pricePerNight: number;
  bookingUrl: string;
  amenities: string[];
  distanceFromCenter: string;
  lat?: number;
  lng?: number;
}

async function getDestinationId(destination: string): Promise<string | null> {
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY_HERE') {
    console.warn('[Booking API] No API key configured, using mock data');
    return 'mock_dest_id';
  }

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/v1/hotels/locations?name=${encodeURIComponent(destination)}&locale=en-gb`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      console.error('[Booking API] Location search failed:', response.status);
      return null;
    }

    const data = await response.json();
    
    // Find city or region destination
    const cityDest = data.find((d: any) => d.dest_type === 'city' || d.dest_type === 'region');
    if (cityDest) {
      return cityDest.dest_id;
    }

    if (data.length > 0) {
      return data[0].dest_id;
    }

    return null;
  } catch (error) {
    console.error('[Booking API] Location search error:', error);
    return null;
  }
}

// Search hotels using Booking.com API
async function searchHotels(params: HotelSearchParams & { destId: string }): Promise<HotelResult[]> {
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY_HERE') {
    // Return mock data for development
    return getMockHotels(params);
  }

  try {
    const queryParams = new URLSearchParams({
      dest_id: params.destId,
      dest_type: 'city',
      checkout_date: params.checkOutDate,
      checkin_date: params.checkInDate,
      adults_number: String(params.adults || 2),
      room_number: String(params.rooms || 1),
      units: 'metric',
      locale: 'en-gb',
      currency: params.currency || 'USD',
      order_by: params.sortBy || 'popularity',
      filter_by_currency: params.currency || 'USD',
      page_number: '0',
      include_adjacency: 'true',
    });

    if (params.minPrice) {
      queryParams.set('price_min', String(params.minPrice));
    }
    if (params.maxPrice) {
      queryParams.set('price_max', String(params.maxPrice));
    }

    const response = await fetch(
      `https://${RAPIDAPI_HOST}/v1/hotels/search?${queryParams.toString()}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      console.error('[Booking API] Hotel search failed:', response.status);
      return getMockHotels(params);
    }

    const data = await response.json();
    
    if (!data.result || data.result.length === 0) {
      return getMockHotels(params);
    }

    // Transform results to our format
    return data.result.slice(0, 10).map((hotel: any) => ({
      id: String(hotel.hotel_id),
      name: hotel.hotel_name,
      address: hotel.address || '',
      city: hotel.city || params.destination,
      country: hotel.country_trans || '',
      photoUrl: hotel.main_photo_url?.replace('square60', 'square300') || hotel.max_photo_url || '',
      rating: hotel.class || 0,
      reviewScore: hotel.review_score || 0,
      reviewScoreWord: hotel.review_score_word || getReviewWord(hotel.review_score),
      reviewCount: hotel.review_nr || 0,
      price: hotel.min_total_price || hotel.composite_price_breakdown?.gross_amount?.value || 0,
      currency: hotel.currencycode || params.currency || 'USD',
      pricePerNight: hotel.composite_price_breakdown?.gross_amount_per_night?.value || 
                     (hotel.min_total_price ? Math.round(hotel.min_total_price / getNights(params.checkInDate, params.checkOutDate)) : 0),
      bookingUrl: hotel.url || `https://www.booking.com/hotel/${hotel.hotel_id}.html`,
      amenities: hotel.hotel_facilities?.slice(0, 5) || [],
      distanceFromCenter: hotel.distance_to_cc ? `${hotel.distance_to_cc} km from center` : '',
      lat: hotel.latitude,
      lng: hotel.longitude,
    }));
  } catch (error) {
    console.error('[Booking API] Hotel search error:', error);
    return getMockHotels(params);
  }
}

function getNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getReviewWord(score: number): string {
  if (score >= 9) return 'Exceptional';
  if (score >= 8) return 'Excellent';
  if (score >= 7) return 'Very Good';
  if (score >= 6) return 'Good';
  if (score >= 5) return 'Fair';
  return 'No rating';
}

// Mock data for development without API key
function getMockHotels(params: HotelSearchParams & { destId?: string }): HotelResult[] {
  const destination = params.destination || 'Unknown';
  const basePrice = params.maxPrice ? Math.min(params.maxPrice * 0.6, 150) : 150;
  
  const mockHotels: HotelResult[] = [
    {
      id: 'mock_1',
      name: 'Grand Plaza Hotel',
      address: `123 Main Street, ${destination}`,
      city: destination,
      country: '',
      photoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      rating: 4,
      reviewScore: 8.6,
      reviewScoreWord: 'Excellent',
      reviewCount: 2847,
      price: Math.round(basePrice * 1.2),
      currency: params.currency || 'USD',
      pricePerNight: Math.round(basePrice * 1.2),
      bookingUrl: 'https://www.booking.com',
      amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant'],
      distanceFromCenter: '0.5 km from center',
    },
    {
      id: 'mock_2',
      name: 'Seaside Resort & Spa',
      address: `45 Beach Road, ${destination}`,
      city: destination,
      country: '',
      photoUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop',
      rating: 5,
      reviewScore: 9.2,
      reviewScoreWord: 'Exceptional',
      reviewCount: 1523,
      price: Math.round(basePrice * 2),
      currency: params.currency || 'USD',
      pricePerNight: Math.round(basePrice * 2),
      bookingUrl: 'https://www.booking.com',
      amenities: ['Beachfront', 'Pool', 'Spa', 'Fine Dining'],
      distanceFromCenter: '2 km from center',
    },
    {
      id: 'mock_3',
      name: 'City Center Inn',
      address: `78 Central Ave, ${destination}`,
      city: destination,
      country: '',
      photoUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
      rating: 3,
      reviewScore: 7.8,
      reviewScoreWord: 'Very Good',
      reviewCount: 956,
      price: Math.round(basePrice * 0.7),
      currency: params.currency || 'USD',
      pricePerNight: Math.round(basePrice * 0.7),
      bookingUrl: 'https://www.booking.com',
      amenities: ['Free WiFi', 'Breakfast', 'Parking'],
      distanceFromCenter: '0.1 km from center',
    },
    {
      id: 'mock_4',
      name: 'Boutique Heritage Hotel',
      address: `12 Heritage Lane, ${destination}`,
      city: destination,
      country: '',
      photoUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
      rating: 4,
      reviewScore: 8.9,
      reviewScoreWord: 'Excellent',
      reviewCount: 1204,
      price: Math.round(basePrice * 1.5),
      currency: params.currency || 'USD',
      pricePerNight: Math.round(basePrice * 1.5),
      bookingUrl: 'https://www.booking.com',
      amenities: ['Historic Building', 'Restaurant', 'Bar', 'Garden'],
      distanceFromCenter: '0.8 km from center',
    },
    {
      id: 'mock_5',
      name: 'Budget Comfort Lodge',
      address: `99 Traveler Street, ${destination}`,
      city: destination,
      country: '',
      photoUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=300&fit=crop',
      rating: 3,
      reviewScore: 7.2,
      reviewScoreWord: 'Good',
      reviewCount: 678,
      price: Math.round(basePrice * 0.5),
      currency: params.currency || 'USD',
      pricePerNight: Math.round(basePrice * 0.5),
      bookingUrl: 'https://www.booking.com',
      amenities: ['Free WiFi', 'Breakfast Included', '24h Reception'],
      distanceFromCenter: '1.5 km from center',
    },
  ];

  // Filter by price if specified
  let filtered = mockHotels;
  if (params.minPrice) {
    filtered = filtered.filter(h => h.pricePerNight >= params.minPrice!);
  }
  if (params.maxPrice) {
    filtered = filtered.filter(h => h.pricePerNight <= params.maxPrice!);
  }

  return filtered;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const destination = searchParams.get('destination');
    const checkInDate = searchParams.get('checkInDate');
    const checkOutDate = searchParams.get('checkOutDate');
    
    if (!destination || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: destination, checkInDate, checkOutDate' },
        { status: 400 }
      );
    }

    const params: HotelSearchParams = {
      destination,
      checkInDate,
      checkOutDate,
      adults: parseInt(searchParams.get('adults') || '2'),
      rooms: parseInt(searchParams.get('rooms') || '1'),
      currency: searchParams.get('currency') || 'USD',
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      sortBy: (searchParams.get('sortBy') as HotelSearchParams['sortBy']) || 'popularity',
    };

    // Get destination ID
    const destId = await getDestinationId(destination);
    if (!destId) {
      return NextResponse.json(
        { error: `Could not find destination: ${destination}` },
        { status: 404 }
      );
    }

    // Search hotels
    const hotels = await searchHotels({ ...params, destId });

    return NextResponse.json({
      success: true,
      destination,
      checkInDate,
      checkOutDate,
      hotels,
    });
  } catch (error) {
    console.error('[Booking API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to search hotels' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { destination, checkInDate, checkOutDate, adults, rooms, currency, minPrice, maxPrice, sortBy } = body;
    
    if (!destination || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: destination, checkInDate, checkOutDate' },
        { status: 400 }
      );
    }

    const params: HotelSearchParams = {
      destination,
      checkInDate,
      checkOutDate,
      adults: adults || 2,
      rooms: rooms || 1,
      currency: currency || 'USD',
      minPrice,
      maxPrice,
      sortBy: sortBy || 'popularity',
    };

    // Get destination ID
    const destId = await getDestinationId(destination);
    if (!destId) {
      return NextResponse.json(
        { error: `Could not find destination: ${destination}` },
        { status: 404 }
      );
    }

    // Search hotels
    const hotels = await searchHotels({ ...params, destId });

    return NextResponse.json({
      success: true,
      destination,
      checkInDate,
      checkOutDate,
      hotels,
    });
  } catch (error) {
    console.error('[Booking API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to search hotels' },
      { status: 500 }
    );
  }
}

