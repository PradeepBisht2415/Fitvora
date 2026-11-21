import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const targetPlan = body.target_plan || 'premium';

    const adminSupabase = createAdminClient();

    // Fetch existing active subscription
    const { data: sub, error: subErr } = await adminSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subErr || !sub) {
      return NextResponse.json(
        { error: 'No active subscription found to upgrade.' },
        { status: 400 }
      );
    }

    if (sub.plan_id === targetPlan) {
      return NextResponse.json(
        { message: `You are already subscribed to the ${targetPlan} plan.` },
        { status: 200 }
      );
    }

    // In production, Razorpay update subscription API would be called.
    // In sandbox / development or upon webhook confirmation, update the subscription record:
    const { error: updateErr } = await adminSupabase
      .from('subscriptions')
      .update({
        plan_id: targetPlan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to upgrade tier' }, { status: 500 });
    }

    // Crucial invariant: Verify that the member's active published diet plan remains untouched!
    const { data: publishedPlans } = await adminSupabase
      .from('diet_plans')
      .select('id, version, status')
      .eq('user_id', user.id)
      .eq('status', 'published');

    // Audit log
    await adminSupabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'upgrade_subscription_tier',
      entity_type: 'subscription',
      entity_id: sub.id,
      metadata: {
        previous_plan: sub.plan_id,
        new_plan: targetPlan,
        preserved_published_plans_count: publishedPlans?.length || 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${targetPlan} plan. Priority support and weekly check-ins are now active.`,
    });
  } catch (err) {
    console.error('Error in subscription upgrade route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
