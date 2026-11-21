import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { z } from 'zod';

const reviewDecisionSchema = z.object({
  decision: z.enum(['approved', 'needs_info', 'not_suitable']),
  safety_flags: z.array(z.string()).default([]),
  reviewer_notes: z.string().max(1000).optional().nullable(),
});

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Missing assessment ID' }, { status: 400 });
    }

    const body = await request.json();
    const result = reviewDecisionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid review payload', issues: result.error.flatten() },
        { status: 400 }
      );
    }

    const { decision, safety_flags, reviewer_notes } = result.data;

    const hasSupabase =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (!hasSupabase) {
      // In local/demo mode without connected database
      return NextResponse.json({
        success: true,
        message: `Decision marked as ${decision}`,
        decision,
      });
    }

    const supabase = createAdminClient();

    // 1. Update assessment status
    const { error: updateError } = await supabase
      .from('assessments')
      .update({ status: decision })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update assessment status:', updateError);
      throw updateError;
    }

    // 2. Insert into assessment_reviews
    await supabase.from('assessment_reviews').insert({
      assessment_id: id,
      reviewer_id: id, // Fallback or authenticated admin ID
      decision,
      safety_flags,
      reviewer_notes: reviewer_notes || null,
    });

    // 3. Write to audit_logs
    await supabase.from('audit_logs').insert({
      action: 'assessment_review_completed',
      entity_type: 'assessment',
      entity_id: id,
      metadata: { decision, safety_flags_count: safety_flags.length },
    });

    return NextResponse.json({
      success: true,
      message: `Assessment review successfully updated to ${decision}`,
      decision,
    });
  } catch (error) {
    console.error('Error in assessment review route:', error);
    return NextResponse.json(
      { error: 'Failed to record assessment review' },
      { status: 500 }
    );
  }
}
