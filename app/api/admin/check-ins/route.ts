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

    // Fetch check-ins
    const { data: checkIns, error: dbErr } = await adminSupabase
      .from('check_ins')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (dbErr) {
      return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
    }

    // Enrich with member profiles
    const userIds = Array.from(new Set((checkIns || []).map((c) => c.user_id)));
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const enriched = (checkIns || []).map((c) => ({
      ...c,
      member: profileMap.get(c.user_id) || null,
    }));

    return NextResponse.json({ checkIns: enriched });
  } catch (err) {
    console.error('Error in admin check-ins GET:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
