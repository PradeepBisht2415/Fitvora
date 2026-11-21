import { createAdminClient } from '@/lib/db/supabase-admin';
import type { PlanTier } from '@/types/billing.types';
import { sendPlanPublishedEmail, sendPaymentReceiptEmail } from '@/lib/email/transactional-service';

export interface InstantActivationResult {
  success: boolean;
  planId: PlanTier;
  dietPlanId?: string;
  isSubscribed: boolean;
  redirectUrl: string;
}

/**
 * Instantly activates a member subscription and provisions their 7-day personalized
 * Indian home-food diet plan with portion sizes and meal alternatives.
 */
export async function activateSubscriptionAndProvisionDietPlan(params: {
  userId: string;
  planId: PlanTier;
  providerSubscriptionId?: string;
  providerCustomerId?: string;
}): Promise<InstantActivationResult> {
  const { userId, planId, providerSubscriptionId, providerCustomerId } = params;
  const adminSupabase = createAdminClient();

  // 1. Fetch user profile & linked assessment
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: assessment } = await adminSupabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const subId = providerSubscriptionId || `sub_fitvora_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // 2. Activate or upsert subscription record
  const { data: existingSub } = await adminSupabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingSub) {
    await adminSupabase
      .from('subscriptions')
      .update({
        plan_id: planId,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        provider_subscription_id: subId,
        provider_customer_id: providerCustomerId || null,
        updated_at: now.toISOString(),
      })
      .eq('id', existingSub.id);
  } else {
    await adminSupabase.from('subscriptions').insert({
      user_id: userId,
      plan_id: planId,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      provider_subscription_id: subId,
      provider_customer_id: providerCustomerId || null,
    });
  }

  // 3. Update membership status to active
  await adminSupabase
    .from('memberships')
    .upsert(
      {
        user_id: userId,
        lifecycle_status: 'active',
        joined_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
      { onConflict: 'user_id' }
    );

  // 4. Check if member already has an active published diet plan
  const { data: existingPlan } = await adminSupabase
    .from('diet_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'published')
    .limit(1)
    .maybeSingle();

  let dietPlanId = existingPlan?.id;

  // 5. If no published plan exists, generate and publish a personalized 7-day plan
  if (!dietPlanId) {
    const foodPrefs = (assessment?.food_preferences || {}) as {
      diet_category?: string;
      allergies?: string[];
    };
    const targetDirection = assessment?.target_direction || 'maintain_health';
    const isWeightGain = targetDirection === 'gain_weight';
    const dietCategory = foodPrefs.diet_category || 'vegetarian';

    // Fetch active meal templates from Supabase
    const { data: templates } = await adminSupabase
      .from('meal_templates')
      .select('*')
      .eq('is_active', true);

    const allTemplates = templates || [];

    // Filter templates by dietary category preference
    const filterByCategory = (list: typeof allTemplates) => {
      if (dietCategory === 'vegetarian') {
        return list.filter((t) => t.diet_category === 'vegetarian');
      }
      if (dietCategory === 'eggetarian') {
        return list.filter((t) => t.diet_category === 'vegetarian' || t.diet_category === 'eggetarian');
      }
      return list;
    };

    const breakfasts = filterByCategory(allTemplates.filter((t) => t.meal_type === 'breakfast'));
    const lunches = filterByCategory(allTemplates.filter((t) => t.meal_type === 'lunch'));
    const snacks = allTemplates.filter((t) => t.meal_type === 'evening_snack');
    const dinners = allTemplates.filter((t) => t.meal_type === 'dinner');

    // Create published plan header
    const { data: newPlan, error: planErr } = await adminSupabase
      .from('diet_plans')
      .insert({
        user_id: userId,
        version: 1,
        status: 'published',
        effective_start_date: now.toISOString().split('T')[0] ?? '',
        guidance_notes: `Welcome to Fitvora! Your customized 7-day Indian home food plan is now active. Focus on mindful eating, chew thoroughly, maintain a 2.5–3L daily hydration target, and enjoy wholesome regional home-cooked meals.`,
        created_by: userId,
        published_at: now.toISOString(),
      })
      .select('id')
      .single();

    if (newPlan && !planErr) {
      dietPlanId = newPlan.id;

      // Construct meals across 7 days (0=Sunday through 6=Saturday)
      const scheduledMeals = [];

      for (let day = 0; day <= 6; day++) {
        const bTemplate = breakfasts[day % breakfasts.length] || breakfasts[0];
        const lTemplate = lunches[day % lunches.length] || lunches[0];
        const sTemplate = snacks[day % snacks.length] || snacks[0];
        const dTemplate = dinners[day % dinners.length] || dinners[0];

        // 1. Breakfast (08:30)
        if (bTemplate) {
          scheduledMeals.push({
            diet_plan_id: dietPlanId,
            day_of_week: day,
            meal_type: 'breakfast',
            scheduled_time: '08:30',
            meal_template_id: bTemplate.id,
            custom_title: bTemplate.title,
            custom_portion: isWeightGain
              ? `${bTemplate.default_portion} (add +25% portion)`
              : bTemplate.default_portion,
            custom_notes: bTemplate.preparation_notes || 'Enjoy freshly prepared with minimal oil.',
            custom_alternatives: bTemplate.alternatives || [],
            order_index: 1,
          });
        }

        // 2. Lunch (13:00)
        if (lTemplate) {
          scheduledMeals.push({
            diet_plan_id: dietPlanId,
            day_of_week: day,
            meal_type: 'lunch',
            scheduled_time: '13:00',
            meal_template_id: lTemplate.id,
            custom_title: lTemplate.title,
            custom_portion: isWeightGain
              ? `${lTemplate.default_portion} (+1 extra phulka or rice)`
              : lTemplate.default_portion,
            custom_notes: lTemplate.preparation_notes || 'Include a fresh side of kachumber or salad.',
            custom_alternatives: lTemplate.alternatives || [],
            order_index: 2,
          });
        }

        // 3. Evening Snack (17:30)
        if (sTemplate) {
          scheduledMeals.push({
            diet_plan_id: dietPlanId,
            day_of_week: day,
            meal_type: 'evening_snack',
            scheduled_time: '17:30',
            meal_template_id: sTemplate.id,
            custom_title: sTemplate.title,
            custom_portion: sTemplate.default_portion,
            custom_notes: sTemplate.preparation_notes || 'Hydrating and energy-sustaining bridge snack.',
            custom_alternatives: sTemplate.alternatives || [],
            order_index: 3,
          });
        }

        // 4. Dinner (20:30)
        if (dTemplate) {
          scheduledMeals.push({
            diet_plan_id: dietPlanId,
            day_of_week: day,
            meal_type: 'dinner',
            scheduled_time: '20:30',
            meal_template_id: dTemplate.id,
            custom_title: dTemplate.title,
            custom_portion: dTemplate.default_portion,
            custom_notes: dTemplate.preparation_notes || 'Light and restorative for healthy digestion and sleep.',
            custom_alternatives: dTemplate.alternatives || [],
            order_index: 4,
          });
        }
      }

      if (scheduledMeals.length > 0) {
        await adminSupabase.from('diet_plan_meals').insert(scheduledMeals);
      }
    }
  }

  // 6. Record audit log
  await adminSupabase.from('audit_logs').insert({
    actor_id: userId,
    action: 'subscription_and_diet_activated',
    entity_type: 'subscription',
    entity_id: dietPlanId || userId,
    metadata: {
      plan_id: planId,
      instant_activation: true,
      diet_plan_id: dietPlanId,
    },
  });

  // 7. Dispatch transactional notifications
  if (profile?.email) {
    const memberName = profile.first_name || 'Member';
    const planName = planId === 'premium' ? 'Premium Wellness Plan' : 'Normal Wellness Plan';
    const amountPaise = planId === 'premium' ? 99900 : 49900;

    await sendPaymentReceiptEmail(
      profile.email,
      memberName,
      planName,
      amountPaise,
      periodEnd.toISOString()
    ).catch((err) => console.warn('Payment receipt email notification note:', err));

    await sendPlanPublishedEmail(
      profile.email,
      memberName,
      1
    ).catch((err) => console.warn('Plan published email notification note:', err));
  }

  return {
    success: true,
    planId,
    dietPlanId,
    isSubscribed: true,
    redirectUrl: '/dashboard',
  };
}
