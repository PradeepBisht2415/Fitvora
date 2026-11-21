import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export const dynamic = 'force-dynamic';

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

    // Fetch all threads with user details
    const { data: threads, error: threadsErr } = await adminSupabase
      .from('support_threads')
      .select('*')
      .order('priority', { ascending: false }) // 'premium' before 'normal'
      .order('last_message_at', { ascending: false });

    if (threadsErr) {
      return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 });
    }

    // Enrich with member profiles and active subscriptions
    const userIds = Array.from(new Set((threads || []).map((t) => t.user_id)));
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone')
      .in('id', userIds);

    const { data: subscriptions } = await adminSupabase
      .from('subscriptions')
      .select('user_id, plan_id, status')
      .in('user_id', userIds)
      .eq('status', 'active');

    const subMap = new Map((subscriptions || []).map((s) => [s.user_id, s.plan_id]));

    const profileMap = new Map(
      (profiles || []).map((p) => [
        p.id,
        {
          ...p,
          planId: subMap.get(p.id) || null,
          membershipTier:
            subMap.get(p.id) === 'premium'
              ? 'Premium Plan (₹999)'
              : subMap.get(p.id) === 'normal'
              ? 'Normal Plan (₹499)'
              : 'Standard Member',
        },
      ])
    );

    const enriched = (threads || []).map((t) => {
      const member = profileMap.get(t.user_id) || null;
      return {
        ...t,
        member,
        membershipTier:
          member?.membershipTier ||
          (t.priority === 'premium' ? 'Premium Plan (₹999)' : 'Normal Plan (₹499)'),
        planId: member?.planId || (t.priority === 'premium' ? 'premium' : 'normal'),
      };
    });

    return NextResponse.json({ threads: enriched });
  } catch (err) {
    console.error('Error in admin support API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
