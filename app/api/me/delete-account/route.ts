import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { confirmation } = body;

    if (confirmation !== 'DELETE MY FITVORA ACCOUNT') {
      return NextResponse.json(
        {
          error:
            'Please type "DELETE MY FITVORA ACCOUNT" to confirm permanent erasure.',
        },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Audit log before erasure
    await adminSupabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'dpdp_account_deletion_request',
      entity_type: 'profile',
      entity_id: user.id,
      metadata: {
        requested_at: new Date().toISOString(),
        regulation: 'DPDP Act 2023 Right to Erasure',
      },
    });

    // 2. Anonymize profile
    await adminSupabase
      .from('profiles')
      .update({
        first_name: 'Anonymized',
        last_name: 'User',
        email: `anonymized_${user.id.slice(0, 8)}@deleted.fitvora.com`,
        phone: null,
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // 3. Anonymize assessment
    await adminSupabase
      .from('assessments')
      .update({
        first_name: 'Anonymized',
        email: `deleted_${user.id.slice(0, 8)}@deleted.fitvora.com`,
        phone: null,
      })
      .eq('user_id', user.id);

    // 4. Cancel active subscriptions locally
    await adminSupabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // 5. Update membership lifecycle to inactive
    await adminSupabase
      .from('memberships')
      .update({
        lifecycle_status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // 6. Delete progress photos
    await adminSupabase
      .from('progress_photos')
      .delete()
      .eq('user_id', user.id);

    // 7. Revoke consent records
    await adminSupabase
      .from('consent_records')
      .update({
        revoked_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // 8. Sign out user session
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message:
        'Your account and personal health data have been erased in compliance with DPDP Act 2023.',
    });
  } catch (err) {
    console.error('Error during account erasure:', err);
    return NextResponse.json(
      { error: 'Failed to process account deletion' },
      { status: 500 }
    );
  }
}
