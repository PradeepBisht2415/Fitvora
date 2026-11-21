import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export async function POST(
  req: Request,
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

    const body = await req.json();
    const { message, status } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message body cannot be empty' }, { status: 400 });
    }

    // Insert support reply
    const { data: newMsg, error: msgErr } = await adminSupabase
      .from('support_messages')
      .insert({
        thread_id: id,
        sender_id: user.id,
        body: message.trim(),
      })
      .select()
      .single();

    if (msgErr) {
      return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
    }

    // Update thread status & timestamp
    const updatedStatus = status || 'waiting_member';
    await adminSupabase
      .from('support_threads')
      .update({
        status: updatedStatus,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', id);

    return NextResponse.json({ success: true, message: newMsg });
  } catch (err) {
    console.error('Error posting admin reply:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
