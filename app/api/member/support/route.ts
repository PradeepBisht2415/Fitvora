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

    // Fetch user subscription tier
    const { data: sub } = await adminSupabase
      .from('subscriptions')
      .select('plan_id, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const isPremium = sub?.plan_id === 'premium';

    // Fetch member's threads
    const { data: threads, error: threadsErr } = await adminSupabase
      .from('support_threads')
      .select('*')
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false });

    if (threadsErr) {
      return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
    }

    return NextResponse.json({
      threads: threads || [],
      isPremium,
      userId: user.id,
    });
  } catch (err) {
    console.error('Error in member support GET:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
