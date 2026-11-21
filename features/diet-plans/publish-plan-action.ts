'use server';

import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import type { PlanMealSlot } from '@/features/diet-plans/plan-builder-store';
import { revalidatePath } from 'next/cache';

export interface SavePlanParams {
  dietPlanId?: string;
  userId: string;
  guidanceNotes?: string;
  meals: PlanMealSlot[];
  status?: 'draft' | 'published';
}

/**
 * Saves a 7-day personalized diet plan draft or publishes it.
 */
export async function saveDietPlanAction(params: SavePlanParams): Promise<{
  success: boolean;
  dietPlanId?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Forbidden. Admin role required.' };
    }

    const { userId, guidanceNotes, meals, status = 'draft' } = params;

    let targetPlanId = params.dietPlanId;

    if (!targetPlanId) {
      // 1. Create plan header
      const { data: newPlan, error: planErr } = await adminSupabase
        .from('diet_plans')
        .insert({
          user_id: userId,
          version: 1,
          status,
          effective_start_date: new Date().toISOString().split('T')[0]!,
          guidance_notes: guidanceNotes || null,
          created_by: user.id,
          published_at: status === 'published' ? new Date().toISOString() : null,
        })
        .select('id')
        .single();

      if (planErr || !newPlan) {
        console.error('Error creating plan header:', planErr);
        return { success: false, error: 'Failed to create plan record' };
      }
      targetPlanId = newPlan.id;
    } else {
      // Update plan header
      await adminSupabase
        .from('diet_plans')
        .update({
          guidance_notes: guidanceNotes || null,
          status,
          published_at: status === 'published' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetPlanId);

      // Delete existing meals for this plan before re-inserting
      await adminSupabase
        .from('diet_plan_meals')
        .delete()
        .eq('diet_plan_id', targetPlanId);
    }

    // 2. Insert all 7-day scheduled meals
    const mealsToInsert = meals.map((m, idx) => ({
      diet_plan_id: targetPlanId!,
      day_of_week: m.dayOfWeek,
      meal_type: m.mealType,
      scheduled_time: m.scheduledTime,
      meal_template_id: m.mealTemplateId?.startsWith('template_seed_') ? null : m.mealTemplateId || null,
      custom_title: m.customTitle,
      custom_portion: m.customPortion,
      custom_notes: m.customNotes || null,
      custom_alternatives: m.customAlternatives,
      order_index: m.orderIndex ?? idx,
    }));

    if (mealsToInsert.length > 0) {
      const { error: mealsErr } = await adminSupabase
        .from('diet_plan_meals')
        .insert(mealsToInsert);

      if (mealsErr) {
        console.error('Error inserting scheduled meals:', mealsErr);
        return { success: false, error: 'Failed to save scheduled meals' };
      }
    }

    // 3. If publishing: archive previous published plans for this member
    if (status === 'published') {
      await adminSupabase
        .from('diet_plans')
        .update({ status: 'archived' })
        .eq('user_id', userId)
        .neq('id', targetPlanId)
        .eq('status', 'published');

      await adminSupabase.from('audit_logs').insert({
        actor_id: user.id,
        action: 'diet_plan_published',
        entity_type: 'diet_plan',
        entity_id: targetPlanId,
        metadata: {
          target_user_id: userId,
          meals_count: meals.length,
          published_at: new Date().toISOString(),
        },
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/meal-plan');
    return { success: true, dietPlanId: targetPlanId };
  } catch (err) {
    console.error('Error saving diet plan:', err);
    return { success: false, error: 'An unexpected error occurred while saving the plan.' };
  }
}
