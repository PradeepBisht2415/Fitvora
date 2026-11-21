import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import {
  sanitizeAssessmentForExport,
  generateAssessmentCsv,
  type SanitizedAssessment,
} from '@/lib/export/assessment-exporter';

export async function GET() {
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

    let sanitizedList: SanitizedAssessment[] = [];

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

      const { data: assessments, error } = await adminSupabase
        .from('assessments')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
      }

      sanitizedList = (assessments || []).map((a) =>
        sanitizeAssessmentForExport(a as unknown as Record<string, unknown>)
      );
    } else {
      // Demo mock fallback
      sanitizedList = [
        sanitizeAssessmentForExport({
          id: 'demo-lead-1',
          first_name: 'Priya',
          email: 'secret@example.com',
          phone: '9876543210',
          age: 28,
          gender: 'female',
          height_cm: 162,
          weight_kg: 68,
          target_direction: 'lose_weight',
          target_weight_kg: 60,
          timeline_weeks: 12,
          routine_data: { wake_time: '06:30', sleep_time: '23:00', work_shift: 'standard_day' },
          food_preferences: { diet_type: 'vegetarian', regional_preference: 'north_indian' },
          health_screening: { conditions: ['pcos_pcod'], medications: 'None' },
          status: 'pending_review',
          submitted_at: new Date().toISOString(),
        }),
      ];
    }

    const csvContent = generateAssessmentCsv(sanitizedList);

    const today = new Date().toISOString().split('T')[0];
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="fitvora_assessments_sanitized_${today}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting assessments CSV:', error);
    return NextResponse.json({ error: 'Failed to export assessments' }, { status: 500 });
  }
}
