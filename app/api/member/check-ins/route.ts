import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

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

    // Check tier
    const { data: sub } = await adminSupabase
      .from('subscriptions')
      .select('plan_id, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const isPremium = sub?.plan_id === 'premium';

    // Fetch member's check-ins
    const { data: checkIns, error } = await adminSupabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('week_start_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
    }

    // Determine current week's start date
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const currentWeekStartDate = monday.toISOString().split('T')[0];

    const currentCheckIn = (checkIns || []).find(
      (c) => c.week_start_date === currentWeekStartDate
    );

    return NextResponse.json({
      isPremium,
      currentWeekStartDate,
      currentCheckIn: currentCheckIn || null,
      pastCheckIns: (checkIns || []).filter(
        (c) => c.week_start_date !== currentWeekStartDate
      ),
      allCheckIns: checkIns || [],
    });
  } catch (err) {
    console.error('Error fetching member check-ins:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
