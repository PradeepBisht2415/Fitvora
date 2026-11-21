import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || requestUrl.searchParams.get('redirectTo') || '/dashboard';

  const supabase = await createClient();

  try {
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    } else if (tokenHash && type) {
      await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'email' | 'recovery' | 'invite' | 'signup',
      });
    }

    // Check user and ensure profile
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role === 'admin' && next === '/dashboard') {
        return NextResponse.redirect(new URL('/admin', requestUrl.origin));
      }
    }
  } catch (err) {
    console.warn('Auth callback exchange warning:', err);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
