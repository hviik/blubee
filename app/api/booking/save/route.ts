import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export interface SaveBookingParams {
  hotelId: string;
  hotelName: string;
  hotelAddress?: string;
  city?: string;
  country?: string;
  photoUrl?: string;
  rating?: number;
  reviewScore?: number;
  pricePerNight?: number;
  totalPrice?: number;
  currency?: string;
  checkInDate?: string;
  checkOutDate?: string;
  bookingUrl?: string;
  destination?: string;
  tripId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: SaveBookingParams = await request.json();

    if (!body.hotelId || !body.hotelName) {
      return NextResponse.json(
        { error: 'Hotel ID and name are required' },
        { status: 400 }
      );
    }

    // Insert booking record
    const { data, error } = await supabaseAdmin
      .from('hotel_bookings')
      .insert({
        user_id: userId,
        hotel_id: body.hotelId,
        hotel_name: body.hotelName,
        hotel_address: body.hotelAddress || null,
        city: body.city || null,
        country: body.country || null,
        photo_url: body.photoUrl || null,
        rating: body.rating || null,
        review_score: body.reviewScore || null,
        price_per_night: body.pricePerNight || null,
        total_price: body.totalPrice || null,
        currency: body.currency || 'USD',
        check_in_date: body.checkInDate || null,
        check_out_date: body.checkOutDate || null,
        booking_url: body.bookingUrl || null,
        destination: body.destination || null,
        trip_id: body.tripId || null,
        status: 'clicked',
      })
      .select()
      .single();

    if (error) {
      console.error('[Booking Save] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: data,
      message: 'Booking reference saved successfully',
    });
  } catch (error) {
    console.error('[Booking Save] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save booking' },
      { status: 500 }
    );
  }
}

// Get user's booking history
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get bookings for the user
    const { data, error, count } = await supabaseAdmin
      .from('hotel_bookings')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[Booking Get] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookings: data,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[Booking Get] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// Update booking status (e.g., when user confirms they booked)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, status, tripId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
    }
    if (tripId !== undefined) {
      updateData.trip_id = tripId;
    }

    const { data, error } = await supabaseAdmin
      .from('hotel_bookings')
      .update(updateData)
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Booking Update] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: data,
    });
  } catch (error) {
    console.error('[Booking Update] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
