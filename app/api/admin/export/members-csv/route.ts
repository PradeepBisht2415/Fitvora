import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Verify admin
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Query active subscriptions with profile info (no sensitive health disclosures)
    const { data: subs, error } = await adminSupabase
      .from('subscriptions')
      .select('id, user_id, plan_id, status, current_period_start, current_period_end, created_at');

    if (error) {
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    const userIds = Array.from(new Set((subs || []).map((s) => s.user_id)));
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    // Build CSV
    const rows = [
      ['Member ID', 'First Name', 'Last Name', 'Email', 'Plan Tier', 'Subscription Status', 'Period Start', 'Period End', 'Created Date'],
    ];

    for (const sub of subs || []) {
      const p = profileMap.get(sub.user_id);
      rows.push([
        sub.user_id,
        `"${(p?.first_name || '').replace(/"/g, '""')}"`,
        `"${(p?.last_name || '').replace(/"/g, '""')}"`,
        `"${(p?.email || '').replace(/"/g, '""')}"`,
        sub.plan_id.toUpperCase(),
        sub.status,
        sub.current_period_start || '',
        sub.current_period_end || '',
        sub.created_at,
      ]);
    }

    const csvContent = rows.map((r) => r.join(',')).join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="fitvora_members_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (err) {
    console.error('Error in CSV export:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
