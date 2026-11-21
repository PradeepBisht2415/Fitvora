import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Fetch check-in
    const { data: checkIn, error: cErr } = await adminSupabase
      .from('check_ins')
      .select('*')
      .eq('id', id)
      .single();

    if (cErr || !checkIn) {
      return NextResponse.json({ error: 'Check-in not found' }, { status: 404 });
    }

    // Fetch member profile
    const { data: member } = await adminSupabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('id', checkIn.user_id)
      .single();

    // Fetch recent weight entries
    const { data: weightEntries } = await adminSupabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', checkIn.user_id)
      .order('recorded_at', { ascending: false })
      .limit(5);

    // Fetch active diet plan
    const { data: activePlan } = await adminSupabase
      .from('diet_plans')
      .select('id, version, status')
      .eq('user_id', checkIn.user_id)
      .eq('status', 'published')
      .single();

    return NextResponse.json({
      checkIn,
      member,
      weightEntries: weightEntries || [],
      activePlan: activePlan || null,
    });
  } catch (err) {
    console.error('Error fetching admin checkin detail:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
