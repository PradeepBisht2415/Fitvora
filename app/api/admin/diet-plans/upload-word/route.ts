import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { parseDietPlanFile } from '@/lib/parsers/word-diet-parser';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasSupabase =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (!hasSupabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    let userId = formData.get('userId') as string | null;
    const autoPublish = formData.get('autoPublish') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No diet plan (PDF or Word) file uploaded.' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Target member userId is required.' }, { status: 400 });
    }

    // Handle intake lead if passed as `lead_<assessmentId>`
    if (userId.startsWith('lead_')) {
      const assessmentId = userId.replace('lead_', '');
      const { data: asmt } = await adminSupabase
        .from('assessments')
        .select('id, user_id, first_name, email')
        .eq('id', assessmentId)
        .maybeSingle();

      if (asmt?.user_id) {
        userId = asmt.user_id;
      } else {
        return NextResponse.json(
          {
            error: `Client "${asmt?.first_name || 'Candidate'}" is an intake lead without a registered account. Please have them register before publishing a diet plan.`,
          },
          { status: 400 }
        );
      }
    }

    // Verify target user profile exists in public.profiles
    const { data: targetProfile } = await adminSupabase
      .from('profiles')
      .select('id, first_name')
      .eq('id', userId)
      .maybeSingle();

    if (!targetProfile) {
      return NextResponse.json(
        { error: 'Target member account was not found in profiles.' },
        { status: 404 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsedResult = await parseDietPlanFile(buffer, file.name);

    if (!parsedResult.success) {
      return NextResponse.json(
        { error: parsedResult.error || 'Failed to parse diet plan document.' },
        { status: 422 }
      );
    }

    // If autoPublish is requested, insert into diet_plans and diet_plan_meals directly
    let dietPlanId: string | undefined;
    if (autoPublish) {
      // Find latest version to increment
      const { data: latestExisting } = await adminSupabase
        .from('diet_plans')
        .select('version')
        .eq('user_id', userId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextVersion = (latestExisting?.version ?? 0) + 1;

      // 1st day starts from the next date of applied date
      const appliedDate = new Date();
      const nextDate = new Date(appliedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const effectiveStartDate = nextDate.toISOString().split('T')[0]!;

      // 1. Insert Diet Plan Header
      const { data: newPlan, error: planErr } = await adminSupabase
        .from('diet_plans')
        .insert({
          user_id: userId,
          version: nextVersion,
          status: 'published',
          effective_start_date: effectiveStartDate,
          guidance_notes: parsedResult.guidanceNotes || null,
          created_by: user.id,
          published_at: appliedDate.toISOString(),
        })
        .select('id')
        .single();

      if (planErr || !newPlan) {
        console.error('Error creating plan header:', planErr);
        return NextResponse.json(
          { error: planErr?.message || 'Failed to create plan record in database' },
          { status: 500 }
        );
      }
      dietPlanId = newPlan.id;

      // 2. Insert Meal Rows
      const mealsToInsert = parsedResult.meals.map((m, idx) => ({
        diet_plan_id: dietPlanId!,
        day_of_week: m.dayOfWeek,
        meal_type: m.mealType,
        scheduled_time: m.scheduledTime,
        meal_template_id: m.mealTemplateId?.startsWith('template_seed_') ? null : m.mealTemplateId || null,
        custom_title: m.customTitle,
        custom_portion: m.customPortion,
        custom_notes: m.customNotes || null,
        custom_alternatives: m.customAlternatives || [],
        order_index: m.orderIndex ?? idx,
      }));

      if (mealsToInsert.length > 0) {
        const { error: mealsErr } = await adminSupabase
          .from('diet_plan_meals')
          .insert(mealsToInsert);

        if (mealsErr) {
          console.error('Error inserting scheduled meals:', mealsErr);
          return NextResponse.json(
            { error: 'Failed to save scheduled meals: ' + mealsErr.message },
            { status: 500 }
          );
        }
      }

      // 3. Archive any previous published plans for this user
      await adminSupabase
        .from('diet_plans')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .neq('id', dietPlanId)
        .eq('status', 'published');
    }

    return NextResponse.json({
      success: true,
      published: autoPublish,
      dietPlanId,
      daysFound: parsedResult.daysFound,
      totalMealsParsed: parsedResult.totalMealsParsed,
      guidanceNotes: parsedResult.guidanceNotes,
      meals: parsedResult.meals,
      rawTextPreview: parsedResult.rawTextPreview,
      message: autoPublish
        ? `Successfully published 7-day diet plan for member from ${file.name}!`
        : `Parsed ${parsedResult.totalMealsParsed} meals across ${parsedResult.daysFound.length || 7} days from ${file.name}.`,
    });
  } catch (err: unknown) {
    console.error('Error handling Word diet plan upload:', err);
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
