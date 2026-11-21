import 'server-only';
import { createAdminClient } from '@/lib/db/supabase-admin';
import type { RazorpayWebhookPayload } from '@/types/billing.types';

/**
 * Processes verified Razorpay webhook events idempotently.
 */
export async function processWebhookEvent(payload: RazorpayWebhookPayload): Promise<{
  handled: boolean;
  message: string;
}> {
  const event = payload.event;
  const supabase = createAdminClient();

  const subEntity = payload.payload?.subscription?.entity;
  const paymentEntity = payload.payload?.payment?.entity;

  switch (event) {
    case 'subscription.authenticated':
    case 'subscription.activated': {
      if (!subEntity?.id) {
        return { handled: false, message: 'Missing subscription entity in webhook' };
      }

      const periodStart = subEntity.current_start
        ? new Date(subEntity.current_start * 1000).toISOString()
        : new Date().toISOString();
      const periodEnd = subEntity.current_end
        ? new Date(subEntity.current_end * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      // Find local subscription record
      const { data: subRecord, error: subFetchErr } = await supabase
        .from('subscriptions')
        .select('id, user_id, plan_id')
        .eq('provider_subscription_id', subEntity.id)
        .single();

      if (subFetchErr || !subRecord) {
        console.warn(`Subscription record not found for provider ID ${subEntity.id}`);
        return { handled: false, message: 'Subscription record not found locally' };
      }

      // Update subscription to active
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: periodStart,
          current_period_end: periodEnd,
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subRecord.id);

      // Activate member lifecycle
      await supabase
        .from('memberships')
        .update({
          lifecycle_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', subRecord.user_id);

      // Log to audit trail
      await supabase.from('audit_logs').insert({
        actor_id: subRecord.user_id,
        action: 'subscription_activated',
        entity_type: 'subscription',
        entity_id: subRecord.id,
        metadata: {
          provider_subscription_id: subEntity.id,
          event,
          period_start: periodStart,
          period_end: periodEnd,
        },
      });

      return { handled: true, message: `Subscription ${subRecord.id} activated successfully` };
    }

    case 'subscription.charged': {
      if (!subEntity?.id) {
        return { handled: false, message: 'Missing subscription entity' };
      }

      const periodStart = subEntity.current_start
        ? new Date(subEntity.current_start * 1000).toISOString()
        : new Date().toISOString();
      const periodEnd = subEntity.current_end
        ? new Date(subEntity.current_end * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: subRecord } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('provider_subscription_id', subEntity.id)
        .single();

      if (subRecord) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_start: periodStart,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subRecord.id);

        await supabase
          .from('memberships')
          .update({
            lifecycle_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', subRecord.user_id);
      }

      return { handled: true, message: 'Subscription charge processed' };
    }

    case 'subscription.halted': {
      if (!subEntity?.id) {
        return { handled: false, message: 'Missing subscription entity' };
      }

      const { data: subRecord } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('provider_subscription_id', subEntity.id)
        .single();

      if (subRecord) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'halted',
            updated_at: new Date().toISOString(),
          })
          .eq('id', subRecord.id);

        await supabase
          .from('memberships')
          .update({
            lifecycle_status: 'paused',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', subRecord.user_id);

        await supabase.from('audit_logs').insert({
          actor_id: subRecord.user_id,
          action: 'subscription_halted',
          entity_type: 'subscription',
          entity_id: subRecord.id,
          metadata: {
            provider_subscription_id: subEntity.id,
          },
        });
      }

      return { handled: true, message: 'Subscription halted due to payment failure' };
    }

    case 'subscription.cancelled': {
      if (!subEntity?.id) {
        return { handled: false, message: 'Missing subscription entity' };
      }

      const { data: subRecord } = await supabase
        .from('subscriptions')
        .select('id, user_id, current_period_end')
        .eq('provider_subscription_id', subEntity.id)
        .single();

      if (subRecord) {
        const isPeriodEnded = subRecord.current_period_end
          ? new Date(subRecord.current_period_end) <= new Date()
          : true;

        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subRecord.id);

        if (isPeriodEnded) {
          await supabase
            .from('memberships')
            .update({
              lifecycle_status: 'inactive',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', subRecord.user_id);
        }

        await supabase.from('audit_logs').insert({
          actor_id: subRecord.user_id,
          action: 'subscription_cancelled',
          entity_type: 'subscription',
          entity_id: subRecord.id,
          metadata: {
            provider_subscription_id: subEntity.id,
            is_period_ended: isPeriodEnded,
          },
        });
      }

      return { handled: true, message: 'Subscription cancelled' };
    }

    case 'payment.failed': {
      console.warn('Payment failed event received:', paymentEntity?.id, paymentEntity?.error_description);
      return { handled: true, message: 'Payment failed logged' };
    }

    default:
      return { handled: true, message: `Event ${event} acknowledged without state changes` };
  }
}
