import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberUserId } = await params;

    // Check admin authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { data: adminProfile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    // 1. Fetch Profile
    const { data: profile, error: profileErr } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', memberUserId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // 2. Fetch Membership
    const { data: membership } = await adminSupabase
      .from('memberships')
      .select('*')
      .eq('user_id', memberUserId)
      .maybeSingle();

    // 3. Fetch Subscription
    const { data: subscription } = await adminSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', memberUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 4. Fetch Linked Assessment (by user_id or email)
    let { data: assessment } = await adminSupabase
      .from('assessments')
      .select('*')
      .eq('user_id', memberUserId)
      .maybeSingle();

    if (!assessment && profile.email) {
      const { data: asmtByEmail } = await adminSupabase
        .from('assessments')
        .select('*')
        .eq('email', profile.email)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (asmtByEmail) {
        assessment = asmtByEmail;
        // Lazily link the user_id for future fast lookups
        await adminSupabase
          .from('assessments')
          .update({ user_id: memberUserId })
          .eq('id', asmtByEmail.id);
      }
    }

    // 5. Fetch Audit Logs
    const { data: auditLogs } = await adminSupabase
      .from('audit_logs')
      .select('*')
      .or(`actor_id.eq.${memberUserId},entity_id.eq.${memberUserId}`)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      profile,
      membership,
      subscription,
      assessment,
      auditLogs: auditLogs || [],
    });
  } catch (error) {
    console.error('Error fetching member details:', error);
    return NextResponse.json(
      { error: 'Internal server error while retrieving member details' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberUserId } = await params;

    // Check admin authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { data: adminProfile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    // 1. Delete dependent support messages
    await adminSupabase.from('support_messages').delete().eq('sender_id', memberUserId);

    // 2. Delete public profile (cascades memberships, subscriptions, diet_plans)
    const { error: profileErr } = await adminSupabase
      .from('profiles')
      .delete()
      .eq('id', memberUserId);

    if (profileErr) {
      console.error('Failed to delete member profile:', profileErr);
      return NextResponse.json({ error: 'Failed to delete member profile' }, { status: 500 });
    }

    // 3. Delete auth user
    await adminSupabase.auth.admin.deleteUser(memberUserId);

    return NextResponse.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json(
      { error: 'Internal server error while deleting member' },
      { status: 500 }
    );
  }
}
