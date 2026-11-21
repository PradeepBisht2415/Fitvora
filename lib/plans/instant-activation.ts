import { createAdminClient } from '@/lib/db/supabase-admin';
import type { PlanTier } from '@/types/billing.types';
import { sendPaymentReceiptEmail } from '@/lib/email/transactional-service';

export interface InstantActivationResult {
  success: boolean;
  planId: PlanTier;
  dietPlanId?: string;
  isSubscribed: boolean;
  redirectUrl: string;
}

/**
 * Activates a member's subscription upon payment.
 * Diet plans are intentionally NOT auto-generated here — they are reviewed, customized,
 * and published by the founder/admin via the Admin Plan Builder.
 */
export async function activateSubscriptionAndProvisionDietPlan(params: {
  userId: string;
  planId: PlanTier;
  providerSubscriptionId?: string;
  providerCustomerId?: string;
}): Promise<InstantActivationResult> {
  const { userId, planId, providerSubscriptionId, providerCustomerId } = params;
  const adminSupabase = createAdminClient();

  // 1. Fetch user profile
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

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

  // 4. Check if member already has a published diet plan from admin
  const { data: existingPlan } = await adminSupabase
    .from('diet_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'published')
    .limit(1)
    .maybeSingle();

  // 5. Record audit log
  await adminSupabase.from('audit_logs').insert({
    actor_id: userId,
    action: 'subscription_activated',
    entity_type: 'subscription',
    entity_id: existingPlan?.id || userId,
    metadata: {
      plan_id: planId,
      instant_activation: true,
      has_published_plan: !!existingPlan,
    },
  });

  // 6. Dispatch payment receipt notification
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
  }

  return {
    success: true,
    planId,
    dietPlanId: existingPlan?.id,
    isSubscribed: true,
    redirectUrl: '/dashboard',
  };
}
