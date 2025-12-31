import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    }

    const { data, error } = await supabaseAdmin
      .from('trips')
      .select('id, title, preferences, created_at')
      .eq('user_id', userId)
      .eq('status', 'wishlist')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }

    const wishlistIds = (data || []).map(trip => {
      const prefs = trip.preferences as { 
        destination_id?: string; 
        destinationId?: string;
        iso2?: string;
      } | null;
      return prefs?.iso2 || prefs?.destination_id || prefs?.destinationId || null;
    }).filter((id): id is string => Boolean(id));

    return NextResponse.json({ 
      wishlist: data || [],
      wishlistIds 
      });
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
    const { destinationId, destinationName, route, priceINR, duration, image, flag, iso2 } = body;

    if (!destinationId || !destinationName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
        error: 'Failed to initialize user profile. Please try again.',
        action: 'profile_error'
      }, { status: 500 });
    }

    const { data: allWishlistItems, error: checkError } = await supabaseAdmin
      .from('trips')
      .select('id, preferences')
      .eq('user_id', userId)
      .eq('status', 'wishlist');

    if (checkError) {
    }

    const existing = allWishlistItems?.find(trip => {
      const prefs = trip.preferences as { destination_id?: string; destinationId?: string; iso2?: string } | null;
      if (iso2 && prefs?.iso2) {
        return prefs.iso2.toLowerCase() === iso2.toLowerCase();
      }
      return prefs?.destination_id === destinationId || prefs?.destinationId === destinationId;
    });

    if (existing) {
      return NextResponse.json({ 
        message: 'Already in wishlist',
        trip: existing,
        action: 'exists'
      });
    }

    const iso2Upper = (iso2 || destinationId).toUpperCase();
    const formattedName = destinationName.charAt(0).toUpperCase() + destinationName.slice(1).toLowerCase();
    const formattedTitle = `${formattedName} (${iso2Upper})`;

    const { data, error } = await supabaseAdmin
      .from('trips')
      .insert({
        user_id: userId,
        title: formattedTitle,
        status: 'wishlist',
        trip_type: 'explore',
        preferences: {
          destination_id: iso2 || destinationId,
          destinationId: iso2 || destinationId,
          destinationName: formattedName,
          route: route || [],
          priceINR: priceINR,
          price_inr: priceINR,
          duration: duration,
          image: image || null,
          flag: flag || null,
          iso2: iso2 || destinationId
        }
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23503') {
        return NextResponse.json({ 
          error: 'User profile not found. Please try signing out and back in.',
          action: 'fk_error',
          details: error.message
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to add to wishlist',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Added to wishlist',
      trip: data,
      action: 'added'
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
    const destinationId = searchParams.get('destinationId');

    if (!destinationId) {
      return NextResponse.json({ error: 'Missing destinationId' }, { status: 400 });
    }

    const { supabaseAdmin } = await import('@/lib/supabaseServer');

    const { data: allWishlistItems, error: findError } = await supabaseAdmin
      .from('trips')
      .select('id, preferences')
      .eq('user_id', userId)
      .eq('status', 'wishlist');

    if (findError) {
      return NextResponse.json({ 
        error: 'Failed to find wishlist item',
        action: 'error'
      }, { status: 500 });
    }

    const existing = allWishlistItems?.find(trip => {
      const prefs = trip.preferences as { destination_id?: string; destinationId?: string; iso2?: string } | null;
      const destIdLower = destinationId.toLowerCase();
      return (
        prefs?.iso2?.toLowerCase() === destIdLower ||
        prefs?.destination_id?.toLowerCase() === destIdLower ||
        prefs?.destinationId?.toLowerCase() === destIdLower
      );
    });

    if (!existing) {
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
      return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Removed from wishlist',
      action: 'removed'
      });
    } catch (error: any) {
      return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

