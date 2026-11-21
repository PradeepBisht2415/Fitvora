'use server';

import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { cancelRazorpaySubscription } from '@/lib/integrations/razorpay';
import { revalidatePath } from 'next/cache';

export async function cancelSubscriptionAction(subscriptionId: string): Promise<{
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

    // Verify subscription ownership
    const { data: sub, error: subErr } = await adminSupabase
      .from('subscriptions')
      .select('id, user_id, provider_subscription_id, current_period_end')
      .eq('id', subscriptionId)
      .single();

    if (subErr || !sub) {
      return { success: false, error: 'Subscription not found.' };
    }

    if (sub.user_id !== user.id) {
      // Check if actor is admin
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        return { success: false, error: 'You do not have permission to cancel this subscription.' };
      }
    }

    // Call Razorpay to schedule cancellation at period end
    if (sub.provider_subscription_id && !sub.provider_subscription_id.startsWith('sub_sandbox_')) {
      try {
        await cancelRazorpaySubscription(sub.provider_subscription_id, true);
      } catch (gatewayErr) {
        console.warn('Razorpay API cancel call note:', gatewayErr);
      }
    }

    // Update database record
    await adminSupabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);

    // Audit log
    await adminSupabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'subscription_cancelled',
      entity_type: 'subscription',
      entity_id: subscriptionId,
      metadata: {
        reason: 'User self-service cancellation',
        cancelled_at: new Date().toISOString(),
        retains_access_until: sub.current_period_end,
      },
    });

    revalidatePath('/dashboard/subscription');
    return { success: true };
  } catch (err) {
    console.error('Error cancelling subscription:', err);
    return { success: false, error: 'Failed to cancel subscription. Please contact support.' };
  }
}
