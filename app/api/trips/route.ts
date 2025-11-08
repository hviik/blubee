import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { 
  Trip, 
  CreateTripRequest, 
  validateCreateTripRequest, 
  validateTripDates 
} from '@/app/types/trips';

/**
 * GET /api/trips
 * List all trips for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate with Clerk
    const { userId } = await auth();

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Query trips from Supabase for this user
    const { data: trips, error } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch trips', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId,
      trips: trips || [],
      count: trips?.length || 0,
    });
  } catch (error) {
    console.error('GET /api/trips error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trips
 * Create a new trip for the authenticated user
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate with Clerk
    const { userId } = await auth();

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate request structure
    if (!validateCreateTripRequest(body)) {
      return NextResponse.json(
        { 
          error: 'Missing required fields or invalid data',
          required: ['destination', 'start_date', 'end_date']
        },
        { status: 400 }
      );
    }

    const { destination, start_date, end_date, description } = body as CreateTripRequest;

    // Validate date logic
    const dateError = validateTripDates(start_date, end_date);
    if (dateError) {
      return NextResponse.json(
        { error: dateError },
        { status: 400 }
      );
    }

    // Create trip object
    const tripData: Partial<Trip> = {
      user_id: userId,
      destination: destination.trim(),
      start_date,
      end_date,
      description: description?.trim() || null,
    };

    // Insert into Supabase
    const { data: trip, error } = await supabaseAdmin
      .from('trips')
      .insert([tripData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create trip', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Trip created successfully',
      trip,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/trips error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

