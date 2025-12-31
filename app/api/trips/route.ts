import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { supabaseAdmin } = await import('@/lib/supabaseServer');
    const { ensureUserProfile } = await import('@/lib/ensureUserProfile');
    
    const user = await currentUser();
    await ensureUserProfile(
      userId, 
      user?.emailAddresses?.[0]?.emailAddress,
      user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || undefined
    );

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

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
      return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
    }

    return NextResponse.json({ trips: data || []       });
    } catch (error: any) {
      return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

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
    const { ensureUserProfile } = await import('@/lib/ensureUserProfile');
    
    const user = await currentUser();
    const profileCreated = await ensureUserProfile(
      userId, 
      user?.emailAddresses?.[0]?.emailAddress,
      user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || undefined
    );
    
    if (!profileCreated) {
      return NextResponse.json({ 
        error: 'Failed to initialize user profile. Please try again.'
      }, { status: 500 });
    }

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
      if (error.code === '23503') {
        return NextResponse.json({ 
          error: 'User profile not found. Please try signing out and back in.',
          details: error.message
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to create trip',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Trip created',
      trip: data 
      });
    } catch (error: any) {
      return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

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

    const { data: existing } = await supabaseAdmin
      .from('trips')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

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
      return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Trip updated',
      trip: data 
      });
    } catch (error: any) {
      return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

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

    const { error } = await supabaseAdmin
      .from('trips')
      .delete()
      .eq('id', tripId)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Trip deleted'       });
    } catch (error: any) {
      return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

