import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import {
  sanitizeAssessmentForExport,
  generateAssessmentDocHtml,
  generateAssessmentCsv,
  generateAssessmentText,
} from '@/lib/export/assessment-exporter';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'doc').toLowerCase();

    if (!id) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
    }

    // 1. Verify Admin Auth
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

    let rawAssessment: Record<string, unknown> | null = null;

    if (hasSupabase) {
      const adminSupabase = createAdminClient();

      const { data: adminProfile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (adminProfile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
      }

      const { data } = await adminSupabase
        .from('assessments')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      rawAssessment = data as unknown as Record<string, unknown>;
    }

    // Fallback for local demo or fallback ID
    if (!rawAssessment) {
      rawAssessment = {
        id,
        first_name: 'Client',
        age: 28,
        gender: 'female',
        height_cm: 162,
        weight_kg: 68,
        target_direction: 'lose_weight',
        target_weight_kg: 60,
        timeline_weeks: 12,
        routine_data: {
          wake_time: '06:30',
          sleep_time: '23:00',
          work_shift: 'standard_day',
          meal_frequency: '3_meals',
          activity_level: 'lightly_active',
        },
        food_preferences: {
          diet_type: 'vegetarian',
          regional_preference: 'north_indian',
          allergies: ['peanuts'],
          dislikes: ['karela'],
          cooking_access: 'cooks_at_home',
        },
        health_screening: {
          conditions: ['pcos_pcod'],
          is_pregnant_or_nursing: false,
          eating_disorder_history: false,
          medications: 'None',
        },
        status: 'approved',
        submitted_at: new Date().toISOString(),
      };
    }

    // 2. CRITICAL: Sanitize assessment to strictly strip Email and Contact No
    const sanitized = sanitizeAssessmentForExport(rawAssessment);

    const safeName = sanitized.first_name.replace(/[^a-zA-Z0-9]/g, '_') || 'Client';
    const shortId = sanitized.id.slice(0, 8);

    // 3. Render according to requested format
    if (format === 'csv') {
      const csvContent = generateAssessmentCsv([sanitized]);
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="Fitvora_Assessment_${safeName}_${shortId}.csv"`,
        },
      });
    }

    if (format === 'txt') {
      const textContent = generateAssessmentText(sanitized);
      return new NextResponse(textContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="Fitvora_Assessment_${safeName}_${shortId}.txt"`,
        },
      });
    }

    if (format === 'json') {
      return new NextResponse(JSON.stringify(sanitized, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="Fitvora_Assessment_${safeName}_${shortId}.json"`,
        },
      });
    }

    // Default: Word Document format (.doc)
    const docHtml = generateAssessmentDocHtml(sanitized);
    return new NextResponse(docHtml, {
      status: 200,
      headers: {
        'Content-Type': 'application/msword; charset=utf-8',
        'Content-Disposition': `attachment; filename="Fitvora_Assessment_${safeName}_${shortId}.doc"`,
      },
    });
  } catch (error) {
    console.error('Error generating assessment download:', error);
    return NextResponse.json({ error: 'Failed to download assessment file' }, { status: 500 });
  }
}
