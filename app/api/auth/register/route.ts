import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { firstName, email, password } = await request.json();

    if (!firstName || !email || !password) {
      return NextResponse.json(
        { error: 'First name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const hasSupabase =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (!hasSupabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const adminSupabase = createAdminClient();

    // Create user with email_confirm: true (no confirmation email needed, zero rate limits, instant login)
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName.trim(),
        role: 'member',
      },
    });

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes('already') || authError.status === 422) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Upsert public profile
    await adminSupabase.from('profiles').upsert({
      id: authData.user.id,
      first_name: firstName.trim(),
      email: email.trim().toLowerCase(),
      role: 'member',
      timezone: 'Asia/Kolkata',
    });

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err) {
    console.error('Registration API error:', err);
    return NextResponse.json(
      { error: 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
