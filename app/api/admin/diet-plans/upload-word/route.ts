import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { parseDietPlanFile } from '@/lib/parsers/word-diet-parser';
import { saveDietPlanAction } from '@/features/diet-plans/publish-plan-action';

export async function POST(request: Request) {
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
    const userId = formData.get('userId') as string | null;
    const autoPublish = formData.get('autoPublish') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No diet plan (PDF or Word) file uploaded.' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Target member userId is required.' }, { status: 400 });
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

    // If autoPublish is requested, immediately save & publish the plan
    let dietPlanId: string | undefined;
    if (autoPublish) {
      const saveRes = await saveDietPlanAction({
        userId,
        guidanceNotes: parsedResult.guidanceNotes,
        meals: parsedResult.meals,
        status: 'published',
      });

      if (!saveRes.success) {
        return NextResponse.json(
          { error: saveRes.error || 'Failed to publish diet plan.' },
          { status: 500 }
        );
      }
      dietPlanId = saveRes.dietPlanId;
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
