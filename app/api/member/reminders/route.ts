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
    const { data: profile, error } = await adminSupabase
      .from('profiles')
      .select('meal_reminders_enabled, reminder_channel')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      enabled: profile.meal_reminders_enabled,
      channel: profile.reminder_channel,
    });
  } catch (err) {
    console.error('Error fetching reminder settings:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { enabled, channel } = body;

    const adminSupabase = createAdminClient();
    const updates: { meal_reminders_enabled?: boolean; reminder_channel?: string } = {};

    if (typeof enabled === 'boolean') {
      updates.meal_reminders_enabled = enabled;
    }
    if (channel && ['email', 'sms', 'in_app'].includes(channel)) {
      updates.reminder_channel = channel;
    }

    const { data: updated, error } = await adminSupabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('meal_reminders_enabled, reminder_channel')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update reminder settings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      enabled: updated.meal_reminders_enabled,
      channel: updated.reminder_channel,
    });
  } catch (err) {
    console.error('Error updating reminder settings:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
