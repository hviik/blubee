import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

// GET - Fetch all wishlist items for the current user
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { supabaseAdmin } = await import('@/lib/supabaseServer');

    const { data, error } = await supabaseAdmin
      .from('trips')
      .select('id, title, preferences, created_at')
      .eq('user_id', userId)
      .eq('status', 'wishlist')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }

    // Extract destination IDs from wishlist items
    const wishlistIds = (data || []).map(trip => {
      // The destination_id is stored in preferences
      const prefs = trip.preferences as { destination_id?: string } | null;
      return prefs?.destination_id;
    }).filter(Boolean);

    return NextResponse.json({ 
      wishlist: data || [],
      wishlistIds 
    });
  } catch (error: any) {
    console.error('Wishlist API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST - Add a destination to wishlist
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { destinationId, destinationName, route, priceINR, duration, image, flag } = body;

    if (!destinationId || !destinationName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { supabaseAdmin } = await import('@/lib/supabaseServer');

    // Check if already in wishlist
    const { data: existing } = await supabaseAdmin
      .from('trips')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'wishlist')
      .contains('preferences', { destination_id: destinationId })
      .single();

    if (existing) {
      return NextResponse.json({ 
        message: 'Already in wishlist',
        trip: existing,
        action: 'exists'
      });
    }

    // Create new wishlist item
    const { data, error } = await supabaseAdmin
      .from('trips')
      .insert({
        user_id: userId,
        title: destinationName,
        status: 'wishlist',
        trip_type: 'explore',
        preferences: {
          destination_id: destinationId,
          route: route || [],
          price_inr: priceINR,
          duration: duration,
          image: image,
          flag: flag
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Added to wishlist',
      trip: data,
      action: 'added'
    });
  } catch (error: any) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a destination from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const destinationId = searchParams.get('destinationId');

    if (!destinationId) {
      return NextResponse.json({ error: 'Missing destinationId' }, { status: 400 });
    }

    const { supabaseAdmin } = await import('@/lib/supabaseServer');

    // Find and delete the wishlist item
    const { data: existing, error: findError } = await supabaseAdmin
      .from('trips')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'wishlist')
      .contains('preferences', { destination_id: destinationId })
      .single();

    if (findError || !existing) {
      return NextResponse.json({ 
        message: 'Not found in wishlist',
        action: 'not_found'
      });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('trips')
      .delete()
      .eq('id', existing.id);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Removed from wishlist',
      action: 'removed'
    });
  } catch (error: any) {
    console.error('Wishlist DELETE error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

