'use server';

import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import type { SupportMessage } from '@/types/database.types';
import { revalidatePath } from 'next/cache';

export async function createSupportThread(
  subject: string,
  initialMessage: string,
  asMemberId?: string
): Promise<{
  success: boolean;
  threadId?: string;
  error?: string;
}> {
  try {
    if (!subject?.trim() || !initialMessage?.trim()) {
      return { success: false, error: 'Subject and message are required.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    const adminSupabase = createAdminClient();
    let targetUserId = user.id;

    if (asMemberId) {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role === 'admin') {
        targetUserId = asMemberId;
      }
    }

    // Check member's subscription tier to set priority
    const { data: sub } = await adminSupabase
      .from('subscriptions')
      .select('plan_id, status')
      .eq('user_id', targetUserId)
      .eq('status', 'active')
      .maybeSingle();

    const priority = sub?.plan_id === 'premium' ? 'premium' : 'normal';

    // Create thread
    const { data: thread, error: threadErr } = await adminSupabase
      .from('support_threads')
      .insert({
        user_id: targetUserId,
        subject: subject.trim(),
        status: 'open',
        priority,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (threadErr || !thread) {
      console.error('Error creating support thread:', threadErr);
      return { success: false, error: 'Failed to create inquiry.' };
    }

    // Insert initial message
    const { error: msgErr } = await adminSupabase
      .from('support_messages')
      .insert({
        thread_id: thread.id,
        sender_id: targetUserId,
        body: initialMessage.trim(),
      });

    if (msgErr) {
      console.error('Error inserting initial message:', msgErr);
    }

    revalidatePath('/dashboard/support');
    revalidatePath('/admin/support');

    return { success: true, threadId: thread.id };
  } catch (err) {
    console.error('Unexpected error in createSupportThread:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function postSupportMessage(
  threadId: string,
  body: string,
  asMemberId?: string
): Promise<{
  success: boolean;
  message?: SupportMessage;
  error?: string;
}> {
  try {
    if (!body?.trim()) {
      return { success: false, error: 'Message body cannot be empty.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    const adminSupabase = createAdminClient();

    // Verify access to thread
    const { data: thread } = await adminSupabase
      .from('support_threads')
      .select('id, user_id, status')
      .eq('id', threadId)
      .single();

    if (!thread) {
      return { success: false, error: 'Thread not found.' };
    }

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const isOwner = thread.user_id === user.id;

    if (!isAdmin && !isOwner) {
      return { success: false, error: 'Forbidden. You do not have access to this thread.' };
    }

    let senderId = user.id;
    if (isAdmin && asMemberId) {
      senderId = asMemberId;
    }

    // Insert message
    const { data: newMsg, error: msgErr } = await adminSupabase
      .from('support_messages')
      .insert({
        thread_id: threadId,
        sender_id: senderId,
        body: body.trim(),
      })
      .select()
      .single();

    if (msgErr) {
      return { success: false, error: 'Failed to send message.' };
    }

    // Update thread status & last_message_at
    const newStatus = isAdmin ? 'waiting_member' : 'open';
    await adminSupabase
      .from('support_threads')
      .update({
        status: newStatus,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', threadId);

    revalidatePath('/dashboard/support');
    revalidatePath(`/dashboard/support/${threadId}`);
    revalidatePath('/admin/support');
    revalidatePath(`/admin/support/${threadId}`);

    return { success: true, message: newMsg as SupportMessage };
  } catch (err) {
    console.error('Error posting support message:', err);
    return { success: false, error: 'Failed to send message.' };
  }
}

export async function updateThreadStatus(
  threadId: string,
  status: 'open' | 'waiting_member' | 'resolved' | 'closed'
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized.' };
    }

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from('support_threads')
      .update({ status })
      .eq('id', threadId);

    if (error) {
      return { success: false, error: 'Failed to update thread status.' };
    }

    revalidatePath('/dashboard/support');
    revalidatePath(`/dashboard/support/${threadId}`);
    revalidatePath('/admin/support');
    revalidatePath(`/admin/support/${threadId}`);

    return { success: true };
  } catch (err) {
    console.error('Error in updateThreadStatus:', err);
    return { success: false, error: 'Unexpected error.' };
  }
}
