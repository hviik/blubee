import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

// GET - Fetch all trips for the current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { supabaseAdmin } = await import('@/lib/supabaseServer');

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'planned', 'completed', 'wishlist', or null for all

    let query = supabaseAdmin
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
    }

    return NextResponse.json({ trips: data || [] });
  } catch (error: any) {
    console.error('Trips API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST - Create a new trip (from chat agent)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      title, 
      startDate, 
      endDate, 
      tripType, 
      numberOfPeople,
      status = 'planned',
      preferences = {}
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { supabaseAdmin } = await import('@/lib/supabaseServer');

    const { data, error } = await supabaseAdmin
      .from('trips')
      .insert({
        user_id: userId,
        title,
        start_date: startDate || null,
        end_date: endDate || null,
        trip_type: tripType || 'custom',
        number_of_people: numberOfPeople || 1,
        status,
        preferences
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Trip created',
      trip: data 
    });
  } catch (error: any) {
    console.error('Trips POST error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT - Update a trip
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }

    const { supabaseAdmin } = await import('@/lib/supabaseServer');

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('trips')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Build update object
    const updateData: Record<string, any> = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
    if (updates.tripType !== undefined) updateData.trip_type = updates.tripType;
    if (updates.numberOfPeople !== undefined) updateData.number_of_people = updates.numberOfPeople;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.preferences !== undefined) updateData.preferences = updates.preferences;

    const { data, error } = await supabaseAdmin
      .from('trips')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Trip updated',
      trip: data 
    });
  } catch (error: any) {
    console.error('Trips PUT error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a trip
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get('id');

    if (!tripId) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }

    const { supabaseAdmin } = await import('@/lib/supabaseServer');

    // Verify ownership and delete
    const { error } = await supabaseAdmin
      .from('trips')
      .delete()
      .eq('id', tripId)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Trip deleted' });
  } catch (error: any) {
    console.error('Trips DELETE error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

