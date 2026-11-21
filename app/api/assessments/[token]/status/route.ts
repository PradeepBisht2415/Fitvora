import { NextRequest, NextResponse } from 'next/server';
import { hashToken } from '@/lib/utils/crypto';
import { createAdminClient } from '@/lib/db/supabase-admin';

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { token } = await context.params;

    if (!token || token.length < 16) {
      return NextResponse.json(
        { error: 'Invalid or missing status token' },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);

    const hasSupabase =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (!hasSupabase) {
      // In local/demo mode without connected database
      return NextResponse.json({
        status: 'pending_review',
        first_name: 'Member',
        submitted_at: new Date().toISOString(),
        target_direction: 'lose_weight',
      });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('assessments')
      .select('status, submitted_at, first_name, target_direction')
      .eq('draft_token_hash', tokenHash)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Assessment not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: data.status,
      first_name: data.first_name,
      submitted_at: data.submitted_at,
      target_direction: data.target_direction,
    });
  } catch (error) {
    console.error('Error retrieving assessment status:', error);
    return NextResponse.json(
      { error: 'Internal server error retrieving status' },
      { status: 500 }
    );
  }
}
