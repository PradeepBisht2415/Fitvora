import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // 1. Profile
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // 2. Assessment
    const { data: assessment } = await adminSupabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // 3. Subscriptions
    const { data: subscriptions } = await adminSupabase
      .from('subscriptions')
      .select('id, plan_id, status, current_period_start, current_period_end, created_at')
      .eq('user_id', user.id);

    // 4. Published Diet Plans
    const { data: plans } = await adminSupabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', user.id);

    // 5. Weight Entries
    const { data: weightEntries } = await adminSupabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: true });

    // 6. Check-ins
    const { data: checkIns } = await adminSupabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id);

    // 7. Consent Records
    const { data: consents } = await adminSupabase
      .from('consent_records')
      .select('*')
      .eq('user_id', user.id);

    // Package complete DPDP Act compliant export object
    const exportPackage = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        regulation: 'Digital Personal Data Protection Act (DPDP), 2023',
        serviceProvider: 'Fitvora Wellness',
        userId: user.id,
      },
      profile,
      intakeAssessment: assessment || null,
      subscriptions: subscriptions || [],
      dietPlans: plans || [],
      weightHistory: weightEntries || [],
      weeklyCheckIns: checkIns || [],
      consentHistory: consents || [],
    };

    const jsonString = JSON.stringify(exportPackage, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="fitvora_data_export_${user.id.slice(0, 8)}.json"`,
      },
    });
  } catch (err) {
    console.error('Error generating DPDP data export:', err);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
