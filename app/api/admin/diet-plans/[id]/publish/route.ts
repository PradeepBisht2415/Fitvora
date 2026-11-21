import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dietPlanId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    // Fetch plan details
    const { data: plan, error: planErr } = await adminSupabase
      .from('diet_plans')
      .select('id, user_id, version')
      .eq('id', dietPlanId)
      .single();

    if (planErr || !plan) {
      return NextResponse.json({ error: 'Diet plan not found' }, { status: 404 });
    }

    // Archive old published plans
    await adminSupabase
      .from('diet_plans')
      .update({ status: 'archived' })
      .eq('user_id', plan.user_id)
      .neq('id', dietPlanId)
      .eq('status', 'published');

    // Publish current plan
    await adminSupabase
      .from('diet_plans')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        version: plan.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dietPlanId);

    // Audit log
    await adminSupabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'diet_plan_published',
      entity_type: 'diet_plan',
      entity_id: dietPlanId,
      metadata: {
        published_by: user.id,
        published_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Diet plan published successfully',
    });
  } catch (error) {
    console.error('Publish diet plan API error:', error);
    return NextResponse.json(
      { error: 'Internal server error while publishing plan' },
      { status: 500 }
    );
  }
}
