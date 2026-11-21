import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import type { MembershipStatus } from '@/types/database.types';
import { z } from 'zod';

const overrideSchema = z.object({
  status: z.enum(['invited', 'registered', 'active', 'paused', 'inactive'] as const),
  reason: z.string().min(5, 'Mandatory reason must be at least 5 characters for audit compliance'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberUserId } = await params;

    // Verify requesting user is admin
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

    const body = await request.json();
    const validation = overrideSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid parameters' },
        { status: 400 }
      );
    }

    const { status, reason } = validation.data;

    // Fetch existing membership
    const { data: existingMembership } = await adminSupabase
      .from('memberships')
      .select('id, lifecycle_status')
      .eq('user_id', memberUserId)
      .maybeSingle();

    const previousStatus = existingMembership?.lifecycle_status || 'unknown';

    // Update or insert membership
    await adminSupabase.from('memberships').upsert({
      user_id: memberUserId,
      lifecycle_status: status as MembershipStatus,
      updated_at: new Date().toISOString(),
    });

    // Write strictly to audit_logs
    await adminSupabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'admin_membership_override',
      entity_type: 'membership',
      entity_id: existingMembership?.id || memberUserId,
      metadata: {
        target_user_id: memberUserId,
        previous_status: previousStatus,
        new_status: status,
        reason: reason.trim(),
        overridden_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Member status updated to ${status}`,
    });
  } catch (error) {
    console.error('Member status override error:', error);
    return NextResponse.json(
      { error: 'Internal server error while overriding member status' },
      { status: 500 }
    );
  }
}
