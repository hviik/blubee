import { NextRequest, NextResponse } from 'next/server';
import { 
  validateDateRange, 
  formatToISO, 
  getCurrentDateContext 
} from '@/lib/utils/dateResolver';

const RAPIDAPI_KEY = process.env.RAPID_API_KEY;
const RAPIDAPI_HOST = 'booking-com.p.rapidapi.com';

export const dynamic = 'force-dynamic';

export interface HotelSearchParams {
  destination: string;
  checkInDate: string;  
  checkOutDate: string;
  adults?: number;
  children?: number;
  childrenAges?: number[];
  rooms?: number;
  currency?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'popularity' | 'price' | 'review_score' | 'distance';
  latitude?: number;
  longitude?: number;
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

interface DestinationInfo {
  destId: string;
  destType: string;
  latitude: number;
  longitude: number;
  name: string;
}

/**
 * Get destination coordinates using the locations API
 */
async function getDestinationInfo(destination: string): Promise<DestinationInfo | null> {
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY_HERE') {
    console.warn('[Booking API] No API key configured, using mock data');
    return null;
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
      console.error('[Booking API] Location search failed:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    console.log('[Booking API] Location search results:', JSON.stringify(data).slice(0, 500));
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[Booking API] No locations found for:', destination);
      return null;
    }

    // Find city or region destination with coordinates
    const cityDest = data.find((d: any) => 
      (d.dest_type === 'city' || d.dest_type === 'region') && 
      d.latitude && d.longitude
    );
    
    if (cityDest) {
      return {
        destId: cityDest.dest_id,
        destType: cityDest.dest_type,
        latitude: parseFloat(cityDest.latitude),
        longitude: parseFloat(cityDest.longitude),
        name: cityDest.city_name || cityDest.name || destination,
      };
    }

    // Fallback to first result with coordinates
    const firstWithCoords = data.find((d: any) => d.latitude && d.longitude);
    if (firstWithCoords) {
      return {
        destId: firstWithCoords.dest_id,
        destType: firstWithCoords.dest_type || 'city',
        latitude: parseFloat(firstWithCoords.latitude),
        longitude: parseFloat(firstWithCoords.longitude),
        name: firstWithCoords.city_name || firstWithCoords.name || destination,
      };
    }

    return null;
  } catch (error) {
    console.error('[Booking API] Location search error:', error);
    return null;
  }
}

/**
 * Search hotels using Booking.com API with coordinates
 */
async function searchHotelsByCoordinates(params: HotelSearchParams & { 
  latitude: number; 
  longitude: number 
}): Promise<HotelResult[]> {
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY_HERE') {
    return getMockHotels(params);
  }

  try {
    // Build query parameters for search-by-coordinates endpoint
    const queryParams = new URLSearchParams({
      latitude: String(params.latitude),
      longitude: String(params.longitude),
      checkin_date: params.checkInDate,
      checkout_date: params.checkOutDate,
      adults_number: String(params.adults || 2),
      room_number: String(params.rooms || 1),
      units: 'metric',
      locale: 'en-gb',
      order_by: params.sortBy || 'popularity',
      include_adjacency: 'true',
      page_number: '0',
    });

    // Add currency filter
    if (params.currency) {
      queryParams.set('filter_by_currency', params.currency);
    }

    // Add children if specified
    if (params.children && params.children > 0) {
      queryParams.set('children_number', String(params.children));
      if (params.childrenAges && params.childrenAges.length > 0) {
        queryParams.set('children_ages', params.childrenAges.join(','));
      }
    }

    // Add price filters
    if (params.minPrice) {
      queryParams.set('price_min', String(params.minPrice));
    }
    if (params.maxPrice) {
      queryParams.set('price_max', String(params.maxPrice));
    }

    const url = `https://${RAPIDAPI_HOST}/v1/hotels/search-by-coordinates?${queryParams.toString()}`;
    console.log('[Booking API] Searching hotels at:', url.replace(RAPIDAPI_KEY, '***'));

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Booking API] Hotel search failed:', response.status, errorText);
      return getMockHotels(params);
    }

    const data = await response.json();
    console.log('[Booking API] Search response keys:', Object.keys(data));
    
    // Check for results in different response formats
    const results = data.result || data.results || data.hotels || [];
    
    if (!results || results.length === 0) {
      console.warn('[Booking API] No hotels found for coordinates:', params.latitude, params.longitude);
      return getMockHotels(params);
    }

    console.log('[Booking API] Found', results.length, 'hotels');

    // Transform results to our format
    return results.slice(0, 15).map((hotel: any) => {
      const nights = getNights(params.checkInDate, params.checkOutDate);
      const totalPrice = hotel.min_total_price || 
                         hotel.composite_price_breakdown?.gross_amount?.value || 
                         hotel.price_breakdown?.gross_price?.value ||
                         0;
      const pricePerNight = totalPrice > 0 ? Math.round(totalPrice / nights) : 0;

      return {
        id: String(hotel.hotel_id || hotel.id),
        name: hotel.hotel_name || hotel.name || 'Unknown Hotel',
        address: hotel.address || hotel.address_trans || '',
        city: hotel.city || hotel.city_trans || hotel.city_name_en || params.destination,
        country: hotel.country_trans || hotel.country || '',
        photoUrl: (hotel.main_photo_url || hotel.max_photo_url || hotel.photo_url || '')
          .replace('square60', 'square300')
          .replace('max300', 'max500'),
        rating: hotel.class || hotel.stars || 0,
        reviewScore: hotel.review_score || 0,
        reviewScoreWord: hotel.review_score_word || getReviewWord(hotel.review_score),
        reviewCount: hotel.review_nr || hotel.review_count || 0,
        price: totalPrice,
        currency: hotel.currencycode || hotel.currency_code || params.currency || 'USD',
        pricePerNight,
        bookingUrl: hotel.url || `https://www.booking.com/hotel/${hotel.hotel_id || hotel.id}.html`,
        amenities: (hotel.hotel_facilities || hotel.facilities || []).slice(0, 5),
        distanceFromCenter: hotel.distance_to_cc 
          ? `${hotel.distance_to_cc} km from center` 
          : hotel.distance 
            ? `${hotel.distance} km away`
            : '',
        lat: hotel.latitude,
        lng: hotel.longitude,
      };
    });
  } catch (error) {
    console.error('[Booking API] Hotel search error:', error);
    return getMockHotels(params);
  }
}

function getNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn + 'T00:00:00');
  const end = new Date(checkOut + 'T00:00:00');
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getReviewWord(score: number): string {
  if (!score || score === 0) return 'No rating';
  if (score >= 9) return 'Exceptional';
  if (score >= 8) return 'Excellent';
  if (score >= 7) return 'Very Good';
  if (score >= 6) return 'Good';
  if (score >= 5) return 'Fair';
  return 'No rating';
}

// Mock data for development without API key
function getMockHotels(params: HotelSearchParams): HotelResult[] {
  const destination = params.destination || 'Unknown';
  const nights = getNights(params.checkInDate, params.checkOutDate);
  const basePrice = params.maxPrice ? Math.min(params.maxPrice * 0.6, 150) : 150;
  
  const mockHotels: HotelResult[] = [
    {
      id: 'mock_1',
      name: `Grand Plaza Hotel ${destination}`,
      address: `123 Main Street, ${destination}`,
      city: destination,
      country: '',
      photoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      rating: 4,
      reviewScore: 8.6,
      reviewScoreWord: 'Excellent',
      reviewCount: 2847,
      price: Math.round(basePrice * 1.2 * nights),
      currency: params.currency || 'USD',
      pricePerNight: Math.round(basePrice * 1.2),
      bookingUrl: 'https://www.booking.com',
      amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant'],
      distanceFromCenter: '0.5 km from center',
      lat: params.latitude,
      lng: params.longitude,
    },
    {
      id: 'mock_2',
      name: `${destination} Seaside Resort & Spa`,
      address: `45 Beach Road, ${destination}`,
      city: destination,
      country: '',
      photoUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop',
      rating: 5,
      reviewScore: 9.2,
      reviewScoreWord: 'Exceptional',
      reviewCount: 1523,
      price: Math.round(basePrice * 2 * nights),
      currency: params.currency || 'USD',
      pricePerNight: Math.round(basePrice * 2),
      bookingUrl: 'https://www.booking.com',
      amenities: ['Beachfront', 'Pool', 'Spa', 'Fine Dining'],
      distanceFromCenter: '2 km from center',
    },
    {
      id: 'mock_3',
      name: `City Center Inn ${destination}`,
      address: `78 Central Ave, ${destination}`,
      city: destination,
      country: '',
      photoUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
      rating: 3,
      reviewScore: 7.8,
      reviewScoreWord: 'Very Good',
      reviewCount: 956,
      price: Math.round(basePrice * 0.7 * nights),
      currency: params.currency || 'USD',
      pricePerNight: Math.round(basePrice * 0.7),
      bookingUrl: 'https://www.booking.com',
      amenities: ['Free WiFi', 'Breakfast', 'Parking'],
      distanceFromCenter: '0.1 km from center',
    },
    {
      id: 'mock_4',
      name: `Boutique Heritage Hotel ${destination}`,
      address: `12 Heritage Lane, ${destination}`,
      city: destination,
      country: '',
      photoUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
      rating: 4,
      reviewScore: 8.9,
      reviewScoreWord: 'Excellent',
      reviewCount: 1204,
      price: Math.round(basePrice * 1.5 * nights),
      currency: params.currency || 'USD',
      pricePerNight: Math.round(basePrice * 1.5),
      bookingUrl: 'https://www.booking.com',
      amenities: ['Historic Building', 'Restaurant', 'Bar', 'Garden'],
      distanceFromCenter: '0.8 km from center',
    },
    {
      id: 'mock_5',
      name: `Budget Comfort Lodge ${destination}`,
      address: `99 Traveler Street, ${destination}`,
      city: destination,
      country: '',
      photoUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=300&fit=crop',
      rating: 3,
      reviewScore: 7.2,
      reviewScoreWord: 'Good',
      reviewCount: 678,
      price: Math.round(basePrice * 0.5 * nights),
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
    const dateContext = getCurrentDateContext();
    
    const destination = searchParams.get('destination');
    const checkInDate = searchParams.get('checkInDate');
    const checkOutDate = searchParams.get('checkOutDate');
    
    if (!destination || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters: destination, checkInDate, checkOutDate',
          currentDate: dateContext.currentDate,
        },
        { status: 400 }
      );
    }

    // Validate dates
    const dateValidation = validateDateRange(checkInDate, checkOutDate);
    if (!dateValidation.isValid) {
      return NextResponse.json(
        { 
          error: dateValidation.error,
          currentDate: dateContext.currentDate,
        },
        { status: 400 }
      );
    }

    const params: HotelSearchParams = {
      destination,
      checkInDate: dateValidation.checkInDate!,
      checkOutDate: dateValidation.checkOutDate!,
      adults: parseInt(searchParams.get('adults') || '2'),
      rooms: parseInt(searchParams.get('rooms') || '1'),
      currency: searchParams.get('currency') || 'USD',
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      sortBy: (searchParams.get('sortBy') as HotelSearchParams['sortBy']) || 'popularity',
    };

    // Get destination coordinates
    const destInfo = await getDestinationInfo(destination);
    
    if (!destInfo) {
      // Fall back to mock data if we can't get coordinates
      const hotels = getMockHotels(params);
      return NextResponse.json({
        success: true,
        destination,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        nights: dateValidation.nights,
        currentDate: dateContext.currentDate,
        hotels,
        note: 'Using sample data - could not locate destination',
      });
    }

    // Search hotels by coordinates
    const hotels = await searchHotelsByCoordinates({ 
      ...params, 
      latitude: destInfo.latitude,
      longitude: destInfo.longitude,
    });

    return NextResponse.json({
      success: true,
      destination: destInfo.name,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      nights: dateValidation.nights,
      currentDate: dateContext.currentDate,
      coordinates: {
        latitude: destInfo.latitude,
        longitude: destInfo.longitude,
      },
      hotels,
    });
  } catch (error) {
    console.error('[Booking API] Error:', error);
    const dateContext = getCurrentDateContext();
    return NextResponse.json(
      { 
        error: 'Failed to search hotels',
        currentDate: dateContext.currentDate,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dateContext = getCurrentDateContext();
    
    const { 
      destination, 
      checkInDate, 
      checkOutDate, 
      adults, 
      children,
      childrenAges,
      rooms, 
      currency, 
      minPrice, 
      maxPrice, 
      sortBy,
      latitude,
      longitude,
    } = body;
    
    if (!destination || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters: destination, checkInDate, checkOutDate',
          currentDate: dateContext.currentDate,
        },
        { status: 400 }
      );
    }

    // Validate dates
    const dateValidation = validateDateRange(checkInDate, checkOutDate);
    if (!dateValidation.isValid) {
      return NextResponse.json(
        { 
          error: dateValidation.error,
          currentDate: dateContext.currentDate,
        },
        { status: 400 }
      );
    }

    const params: HotelSearchParams = {
      destination,
      checkInDate: dateValidation.checkInDate!,
      checkOutDate: dateValidation.checkOutDate!,
      adults: adults || 2,
      children: children || 0,
      childrenAges: childrenAges || [],
      rooms: rooms || 1,
      currency: currency || 'USD',
      minPrice,
      maxPrice,
      sortBy: sortBy || 'popularity',
      latitude,
      longitude,
    };

    // Use provided coordinates or get them from destination
    let searchLat = latitude;
    let searchLng = longitude;
    let resolvedDestination = destination;

    if (!searchLat || !searchLng) {
      const destInfo = await getDestinationInfo(destination);
      
      if (!destInfo) {
        // Fall back to mock data
        const hotels = getMockHotels(params);
        return NextResponse.json({
          success: true,
          destination,
          checkInDate: params.checkInDate,
          checkOutDate: params.checkOutDate,
          nights: dateValidation.nights,
          currentDate: dateContext.currentDate,
          hotels,
          note: 'Using sample data - could not locate destination',
        });
      }
      
      searchLat = destInfo.latitude;
      searchLng = destInfo.longitude;
      resolvedDestination = destInfo.name;
    }

    // Search hotels by coordinates
    const hotels = await searchHotelsByCoordinates({ 
      ...params, 
      latitude: searchLat,
      longitude: searchLng,
    });

    return NextResponse.json({
      success: true,
      destination: resolvedDestination,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      nights: dateValidation.nights,
      currentDate: dateContext.currentDate,
      coordinates: {
        latitude: searchLat,
        longitude: searchLng,
      },
      hotels,
    });
  } catch (error) {
    console.error('[Booking API] Error:', error);
    const dateContext = getCurrentDateContext();
    return NextResponse.json(
      { 
        error: 'Failed to search hotels',
        currentDate: dateContext.currentDate,
      },
      { status: 500 }
    );
  }
}
