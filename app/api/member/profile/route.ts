import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  timezone: z.string().default('Asia/Kolkata'),
});

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, timezone } = validation.data;
    const adminSupabase = createAdminClient();

    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName || null,
        phone: phone || null,
        timezone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update profile error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    await adminSupabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'member_profile_updated',
      entity_type: 'profile',
      entity_id: user.id,
      metadata: {
        updated_fields: ['first_name', 'last_name', 'phone', 'timezone'],
        updated_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    console.error('Profile API exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
