import { NextResponse, type NextRequest } from 'next/server';
import { createHmac } from 'crypto';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { processWebhookEvent } from '@/features/billing/webhook-processor';
import type { RazorpayWebhookPayload } from '@/types/billing.types';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // 1. Signature Verification
    if (secret && signature) {
      const expectedSignature = createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('Razorpay signature mismatch.');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    } else if (!process.env.SKIP_ENV_VALIDATION && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Missing webhook configuration' }, { status: 400 });
    }

    const payload: RazorpayWebhookPayload = JSON.parse(rawBody);

    // 2. Generate or extract Unique Event Identifier for Idempotency
    const headerEventId = request.headers.get('x-razorpay-event-id');
    const subId = payload.payload?.subscription?.entity?.id || '';
    const paymentId = payload.payload?.payment?.entity?.id || '';
    const providerEventId =
      headerEventId ||
      `${payload.event}_${subId || paymentId}_${payload.created_at || Date.now()}`;

    const supabase = createAdminClient();

    // 3. Idempotency Check: check if provider_event_id already exists in payment_events
    const { data: existingEvent } = await supabase
      .from('payment_events')
      .select('id, processed_status')
      .eq('provider_event_id', providerEventId)
      .maybeSingle();

    if (existingEvent) {
      // Event already recorded & processed; return 200 immediately to prevent duplicate side effects
      return NextResponse.json({
        received: true,
        status: 'duplicate_ignored',
        eventId: providerEventId,
      });
    }

    // 4. Record event as initial processing
    await supabase.from('payment_events').insert({
      provider_event_id: providerEventId,
      event_type: payload.event,
      signature_verified: !!(secret && signature),
      processed_status: 'processed',
      payload: payload as unknown as import('@/types/database.types').Json,
    });

    // 5. Process the event state transitions
    const result = await processWebhookEvent(payload);

    return NextResponse.json({
      received: true,
      handled: result.handled,
      message: result.message,
    });
  } catch (error) {
    console.error('Webhook processing exception:', error);
    return NextResponse.json(
      { error: 'Error processing webhook event' },
      { status: 500 }
    );
  }
}
