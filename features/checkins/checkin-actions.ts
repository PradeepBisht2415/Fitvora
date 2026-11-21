'use server';

import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import type { CheckIn } from '@/types/database.types';
import { revalidatePath } from 'next/cache';

export interface SubmitCheckInInput {
  adherence_rating: number;
  energy_level: number;
  appetite_notes?: string;
  challenges_text?: string;
  current_weight_kg?: number;
}

export async function submitCheckIn(input: SubmitCheckInInput): Promise<{
  success: boolean;
  data?: CheckIn;
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

    // Verify user is on premium tier
    const { data: sub } = await adminSupabase
      .from('subscriptions')
      .select('plan_id, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (sub?.plan_id !== 'premium') {
      return {
        success: false,
        error: 'Weekly check-ins are exclusively available for Premium members.',
      };
    }

    // Determine current week start date (most recent Monday)
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    const weekStartDate = monday.toISOString().split('T')[0] ?? '';

    // Upsert check-in for this week
    const { data, error } = await adminSupabase
      .from('check_ins')
      .upsert(
        {
          user_id: user.id,
          week_start_date: weekStartDate,
          adherence_rating: Math.min(5, Math.max(1, input.adherence_rating)),
          energy_level: Math.min(5, Math.max(1, input.energy_level)),
          appetite_notes: input.appetite_notes?.trim() || null,
          challenges_text: input.challenges_text?.trim() || null,
          current_weight_kg: input.current_weight_kg || null,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, week_start_date' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error submitting check-in:', error);
      return { success: false, error: 'Failed to submit check-in.' };
    }

    // If current weight was provided, log it into weight_entries too!
    if (input.current_weight_kg) {
      await adminSupabase.from('weight_entries').upsert(
        {
          user_id: user.id,
          weight_kg: input.current_weight_kg,
          recorded_at: new Date().toISOString().split('T')[0] ?? '',
          notes: 'Logged via Weekly Check-in',
        },
        { onConflict: 'user_id, recorded_at' }
      );
    }

    revalidatePath('/dashboard/check-in');
    revalidatePath('/dashboard/check-ins');
    revalidatePath('/admin/check-ins');

    return { success: true, data: data as CheckIn };
  } catch (err) {
    console.error('Unexpected check-in error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function submitCoachFeedback(
  checkInId: string,
  feedback: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!feedback?.trim()) {
      return { success: false, error: 'Feedback cannot be empty.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized.' };
    }

    const adminSupabase = createAdminClient();

    // Verify admin
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Forbidden. Admin role required.' };
    }

    const { error } = await adminSupabase
      .from('check_ins')
      .update({
        admin_feedback: feedback.trim(),
        status: 'reviewed',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', checkInId);

    if (error) {
      return { success: false, error: 'Failed to save feedback.' };
    }

    revalidatePath('/admin/check-ins');
    revalidatePath(`/admin/check-ins/${checkInId}`);
    revalidatePath('/dashboard/check-in');
    revalidatePath('/dashboard/check-ins');

    return { success: true };
  } catch (err) {
    console.error('Error submitting feedback:', err);
    return { success: false, error: 'Unexpected error.' };
  }
}
