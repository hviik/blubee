import { supabaseAdmin } from './supabaseServer';

/**
 * Ensures a user profile exists in the database before creating trips/wishlist items.
 * This handles the case where the Clerk webhook hasn't fired yet or failed.
 * 
 * The trips table has a foreign key constraint to profiles(id), so we must
 * ensure the profile exists before inserting any trips.
 */
export async function ensureUserProfile(userId: string, email?: string, fullName?: string): Promise<boolean> {
  try {
    // First check if profile exists
    const { data: existingProfile, error: selectError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      // Profile already exists
      return true;
    }

    // If profile doesn't exist (PGRST116 = no rows returned), create it
    if (selectError?.code === 'PGRST116' || !existingProfile) {
      console.log(`Creating profile for user: ${userId}`);
      
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: email || null,
          full_name: fullName || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        // Check if it's a duplicate key error (profile was created by webhook in the meantime)
        if (insertError.code === '23505') {
          console.log('Profile was created by webhook, continuing...');
          return true;
        }
        console.error('Failed to create user profile:', insertError);
        return false;
      }

      console.log(`Profile created successfully for user: ${userId}`);
      return true;
    }

    // Some other error occurred
    if (selectError) {
      console.error('Error checking for existing profile:', selectError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return false;
  }
}

