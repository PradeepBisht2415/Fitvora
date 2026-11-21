'use server';

import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { weightEntrySchema, type WeightEntryInput } from '@/lib/validation/weight-schema';
import type { WeightEntry } from '@/types/database.types';
import { revalidatePath } from 'next/cache';

export async function logWeightEntry(input: WeightEntryInput): Promise<{
  success: boolean;
  data?: WeightEntry;
  error?: string;
}> {
  try {
    const parsed = weightEntrySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Invalid weight input',
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    const recordedDate =
      parsed.data.recorded_at || (new Date().toISOString().split('T')[0] ?? '');

    const adminSupabase = createAdminClient();

    // Upsert into weight_entries
    const { data, error } = await adminSupabase
      .from('weight_entries')
      .upsert(
        {
          user_id: user.id,
          weight_kg: parsed.data.weight_kg,
          recorded_at: recordedDate,
          notes: parsed.data.notes || null,
        },
        { onConflict: 'user_id, recorded_at' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error logging weight entry:', error);
      return { success: false, error: 'Failed to record weight entry.' };
    }

    revalidatePath('/dashboard/progress');
    revalidatePath('/dashboard');

    return { success: true, data: data as WeightEntry };
  } catch (err) {
    console.error('Unexpected error in logWeightEntry:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function deleteWeightEntry(entryId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    const adminSupabase = createAdminClient();

    // Verify ownership or admin
    const { data: entry } = await adminSupabase
      .from('weight_entries')
      .select('id, user_id')
      .eq('id', entryId)
      .single();

    if (!entry) {
      return { success: false, error: 'Weight entry not found.' };
    }

    if (entry.user_id !== user.id) {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        return { success: false, error: 'Forbidden. You do not own this entry.' };
      }
    }

    const { error: delErr } = await adminSupabase
      .from('weight_entries')
      .delete()
      .eq('id', entryId);

    if (delErr) {
      return { success: false, error: 'Failed to delete weight entry.' };
    }

    revalidatePath('/dashboard/progress');
    return { success: true };
  } catch (err) {
    console.error('Error in deleteWeightEntry:', err);
    return { success: false, error: 'Failed to delete entry.' };
  }
}

export async function getWeightHistory(
  userId?: string,
  days?: number
): Promise<{
  success: boolean;
  data: WeightEntry[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    let targetUserId = userId;

    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, data: [], error: 'Not authenticated.' };
      }
      targetUserId = user.id;
    }

    const adminSupabase = createAdminClient();
    let query = adminSupabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', targetUserId)
      .order('recorded_at', { ascending: true });

    if (days && days > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffStr = cutoffDate.toISOString().split('T')[0] ?? '';
      query = query.gte('recorded_at', cutoffStr);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error querying weight entries:', error);
      return { success: false, data: [], error: 'Failed to retrieve weight history.' };
    }

    return { success: true, data: (data || []) as WeightEntry[] };
  } catch (err) {
    console.error('Error in getWeightHistory:', err);
    return { success: false, data: [], error: 'Unexpected error.' };
  }
}
