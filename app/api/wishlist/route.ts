import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Fetch all wishlist items for the current user
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { supabaseAdmin } = await import('@/lib/supabaseServer');
    const { ensureUserProfile } = await import('@/lib/ensureUserProfile');
    
    // Ensure user profile exists (handles FK constraint)
    const user = await currentUser();
    const profileCreated = await ensureUserProfile(
      userId, 
      user?.emailAddresses?.[0]?.emailAddress,
      user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || undefined
    );
    
    if (!profileCreated) {
      console.error('Failed to ensure user profile for wishlist GET');
    }

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
    // Priority: iso2 > destination_id > destinationId (for consistency)
    const wishlistIds = (data || []).map(trip => {
      const prefs = trip.preferences as { 
        destination_id?: string; 
        destinationId?: string;
        iso2?: string;
      } | null;
      // Use iso2 as primary identifier for unique per-country tracking
      return prefs?.iso2 || prefs?.destination_id || prefs?.destinationId || null;
    }).filter((id): id is string => Boolean(id));

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
    const { destinationId, destinationName, route, priceINR, duration, image, flag, iso2 } = body;

    console.log('Wishlist POST - Received payload:', { destinationId, destinationName, iso2, userId });

    if (!destinationId || !destinationName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { supabaseAdmin } = await import('@/lib/supabaseServer');
    const { ensureUserProfile } = await import('@/lib/ensureUserProfile');
    
    // CRITICAL: Ensure user profile exists before inserting trip (FK constraint)
    const user = await currentUser();
    const profileCreated = await ensureUserProfile(
      userId, 
      user?.emailAddresses?.[0]?.emailAddress,
      user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || undefined
    );
    
    if (!profileCreated) {
      console.error('Failed to create user profile for wishlist POST');
      return NextResponse.json({ 
        error: 'Failed to initialize user profile. Please try again.',
        action: 'profile_error'
      }, { status: 500 });
    }

    // Check if already in wishlist - query all wishlist items and filter manually
    // because .contains() doesn't work reliably with nested JSONB fields
    const { data: allWishlistItems, error: checkError } = await supabaseAdmin
      .from('trips')
      .select('id, preferences')
      .eq('user_id', userId)
      .eq('status', 'wishlist');

    if (checkError) {
      console.error('Error checking existing wishlist:', checkError);
    }

    // Find if destination already exists (by iso2 code for unique per country)
    const existing = allWishlistItems?.find(trip => {
      const prefs = trip.preferences as { destination_id?: string; destinationId?: string; iso2?: string } | null;
      // Check by iso2 first (preferred), then by destination_id
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

    // Format title as "Country Name (ISO2)" for consistent display
    const iso2Upper = (iso2 || destinationId).toUpperCase();
    // Capitalize country name properly (e.g., "VIETNAM" -> "Vietnam")
    const formattedName = destinationName.charAt(0).toUpperCase() + destinationName.slice(1).toLowerCase();
    const formattedTitle = `${formattedName} (${iso2Upper})`;

    // Create new wishlist item
    const { data, error } = await supabaseAdmin
      .from('trips')
      .insert({
        user_id: userId,
        title: formattedTitle,
        status: 'wishlist',
        trip_type: 'explore',
        preferences: {
          destination_id: iso2 || destinationId, // Use iso2 as primary ID
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
      console.error('Supabase insert error:', error);
      console.error('Insert error details - code:', error.code, 'message:', error.message, 'details:', error.details);
      
      // Check for specific error types
      if (error.code === '23503') {
        // Foreign key violation - profile doesn't exist
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

    console.log('Wishlist item created successfully:', data?.id);

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

    console.log('Wishlist DELETE - destinationId:', destinationId, 'userId:', userId);

    if (!destinationId) {
      return NextResponse.json({ error: 'Missing destinationId' }, { status: 400 });
    }

    const { supabaseAdmin } = await import('@/lib/supabaseServer');

    // Find and delete the wishlist item - query all and filter manually
    const { data: allWishlistItems, error: findError } = await supabaseAdmin
      .from('trips')
      .select('id, preferences')
      .eq('user_id', userId)
      .eq('status', 'wishlist');

    if (findError) {
      console.error('Error finding wishlist item:', findError);
      return NextResponse.json({ 
        error: 'Failed to find wishlist item',
        action: 'error'
      }, { status: 500 });
    }

    // Find the item to delete - check by iso2, destination_id, or destinationId
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

