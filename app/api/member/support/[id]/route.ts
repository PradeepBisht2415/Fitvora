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
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Fetch thread
    const { data: thread, error: threadErr } = await adminSupabase
      .from('support_threads')
      .select('*')
      .eq('id', id)
      .single();

    if (threadErr || !thread) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Check ownership or admin
    if (thread.user_id !== user.id) {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Fetch messages
    const { data: messages, error: msgErr } = await adminSupabase
      .from('support_messages')
      .select('*')
      .eq('thread_id', id)
      .order('created_at', { ascending: true });

    if (msgErr) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Mark unread messages from other sender as read
    await adminSupabase
      .from('support_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('thread_id', id)
      .neq('sender_id', user.id)
      .is('read_at', null);

    // Enrich messages with sender info
    const senderIds = Array.from(new Set((messages || []).map((m) => m.sender_id)));
    const { data: senders } = await adminSupabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .in('id', senderIds);

    const senderMap = new Map((senders || []).map((s) => [s.id, s]));

    const enrichedMessages = (messages || []).map((m) => ({
      ...m,
      sender: senderMap.get(m.sender_id) || null,
    }));

    // Enrich thread with member profile and active subscription
    const { data: memberProfile } = await adminSupabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone')
      .eq('id', thread.user_id)
      .maybeSingle();

    const { data: memberSub } = await adminSupabase
      .from('subscriptions')
      .select('plan_id, status')
      .eq('user_id', thread.user_id)
      .eq('status', 'active')
      .maybeSingle();

    const enrichedThread = {
      ...thread,
      member: memberProfile
        ? {
            ...memberProfile,
            planId: memberSub?.plan_id || null,
            membershipTier:
              memberSub?.plan_id === 'premium'
                ? 'Premium Plan (₹999)'
                : memberSub?.plan_id === 'normal'
                ? 'Normal Plan (₹499)'
                : 'Standard Member',
          }
        : null,
      membershipTier:
        memberSub?.plan_id === 'premium'
          ? 'Premium Plan (₹999)'
          : memberSub?.plan_id === 'normal'
          ? 'Normal Plan (₹499)'
          : thread.priority === 'premium'
          ? 'Premium Plan (₹999)'
          : 'Standard Member',
      planId: memberSub?.plan_id || (thread.priority === 'premium' ? 'premium' : 'normal'),
    };

    return NextResponse.json({
      thread: enrichedThread,
      messages: enrichedMessages,
    });
  } catch (err) {
    console.error('Error fetching support thread details:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
