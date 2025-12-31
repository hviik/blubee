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
    const { data: existingProfile, error: selectError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return true;
    }

    if (selectError?.code === 'PGRST116' || !existingProfile) {
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
        if (insertError.code === '23505') {
          return true;
        }
        return false;
      }

      return true;
    }

    if (selectError) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

