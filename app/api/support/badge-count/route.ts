import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ count: 0 });
    }

    const adminSupabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const asMember = searchParams.get('asMember');

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isAdmin = profile?.role === 'admin';

    // 1. Admin impersonating / previewing a client
    if (isAdmin && asMember) {
      const { data: memberThreads } = await adminSupabase
        .from('support_threads')
        .select('id')
        .eq('user_id', asMember);

      const threadIds = (memberThreads || []).map((t) => t.id);
      let count = 0;
      if (threadIds.length > 0) {
        const { count: c } = await adminSupabase
          .from('support_messages')
          .select('*', { count: 'exact', head: true })
          .in('thread_id', threadIds)
          .neq('sender_id', asMember)
          .is('read_at', null);
        count = c || 0;
      }
      return NextResponse.json({ count });
    }

    // 2. Admin viewing Founder Portal
    if (isAdmin) {
      const { count: unreadCount } = await adminSupabase
        .from('support_messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', user.id)
        .is('read_at', null);

      const { count: openThreadsCount } = await adminSupabase
        .from('support_threads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      const count = Math.max(unreadCount || 0, openThreadsCount || 0);
      return NextResponse.json({ count });
    }

    // 3. Normal member viewing Member Portal
    const { data: userThreads } = await adminSupabase
      .from('support_threads')
      .select('id')
      .eq('user_id', user.id);

    const threadIds = (userThreads || []).map((t) => t.id);
    let count = 0;
    if (threadIds.length > 0) {
      const { count: c } = await adminSupabase
        .from('support_messages')
        .select('*', { count: 'exact', head: true })
        .in('thread_id', threadIds)
        .neq('sender_id', user.id)
        .is('read_at', null);
      count = c || 0;
    }

    return NextResponse.json({ count });
  } catch (err) {
    console.error('Error fetching support badge count:', err);
    return NextResponse.json({ count: 0 });
  }
}
