import { NextRequest, NextResponse } from 'next/server';
import { assessmentSubmissionSchema } from '@/lib/validation/assessment-schema';
import { generateOpaqueToken, hashToken, hashIp } from '@/lib/utils/crypto';
import { sendNewAssessmentAlert } from '@/lib/email/resend-client';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { createClient } from '@/lib/db/supabase-server';
import { activateSubscriptionAndProvisionDietPlan } from '@/lib/plans/instant-activation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Strict Zod validation
    const result = assessmentSubmissionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { about, body: bodyGoal, routine, preferences, wellness } = result.data;

    // 2. Automated Safety Flag Detection (PRD Section 7, FR-03)
    const safetyFlags: string[] = [];
    if (about.age < 18) {
      safetyFlags.push('minor_under_18');
    }
    if (wellness.is_pregnant_or_nursing) {
      safetyFlags.push('pregnancy_or_lactation');
    }
    if (wellness.eating_disorder_history) {
      safetyFlags.push('eating_disorder_concern');
    }
    if (wellness.conditions.length > 0 && !wellness.conditions.includes('none_of_above')) {
      safetyFlags.push(...wellness.conditions.map((c) => `condition_${c}`));
    }
    if (preferences.allergies.length > 0) {
      safetyFlags.push(...preferences.allergies.map((a) => `allergy_${a}`));
    }

    // Extreme BMI checks
    const heightM = bodyGoal.height_cm / 100;
    const bmi = bodyGoal.weight_kg / (heightM * heightM);
    if (bmi < 16.5 || bmi > 38) {
      safetyFlags.push(`extreme_bmi_${bmi.toFixed(1)}`);
    }

    // 3. Generate secure opaque token
    const rawOpaqueToken = generateOpaqueToken();
    const tokenHash = hashToken(rawOpaqueToken);

    // Get client IP for DPDP consent audit log
    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const ipHash = hashIp(clientIp);

    let assessmentId = crypto.randomUUID();
    let authUserId: string | null = null;

    // Check if user is authenticated
    try {
      const userClient = await createClient();
      const {
        data: { user },
      } = await userClient.auth.getUser();
      if (user) {
        authUserId = user.id;
      }
    } catch {
      // Unauthenticated visitor is allowed
    }

    // 4. Save to Supabase (if configured)
    const hasSupabase =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (hasSupabase) {
      try {
        const adminSupabase = createAdminClient();
        const { data, error } = await adminSupabase
          .from('assessments')
          .insert({
            id: assessmentId,
            user_id: authUserId,
            draft_token_hash: tokenHash,
            first_name: about.first_name,
            email: about.email,
            phone: about.phone || null,
            age: about.age,
            gender: about.gender || null,
            height_cm: bodyGoal.height_cm,
            weight_kg: bodyGoal.weight_kg,
            target_direction: bodyGoal.target_direction,
            target_weight_kg: bodyGoal.target_weight_kg || null,
            timeline_weeks: bodyGoal.timeline_weeks || null,
            routine_data: routine,
            food_preferences: preferences,
            health_screening: wellness,
            consent_version: 'v1.0-2026',
            health_consent_granted: true,
            status: authUserId ? 'approved' : 'pending_review',
          })
          .select('id')
          .single();

        if (error) {
          console.error('Supabase assessment insertion error:', error);
          throw error;
        }

        if (data) {
          assessmentId = data.id;
        }

        // Record DPDP consent record
        await adminSupabase.from('consent_records').insert({
          user_id: authUserId,
          assessment_id: assessmentId,
          purpose: 'dietary_planning_and_health_assessment',
          policy_version: 'v1.0-2026',
          ip_hash: ipHash,
        });

        // If authenticated user with active subscription, re-provision personalized diet plan now
        if (authUserId) {
          const { data: sub } = await adminSupabase
            .from('subscriptions')
            .select('plan_id, status')
            .eq('user_id', authUserId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (sub) {
            await activateSubscriptionAndProvisionDietPlan({
              userId: authUserId,
              planId: sub.plan_id === 'premium' ? 'premium' : 'normal',
            });
          }
        }
      } catch (dbErr) {
        console.warn('Database write failed, continuing with generated ID:', dbErr);
      }
    }

    // 5. Trigger async founder notification
    await sendNewAssessmentAlert({
      assessmentId,
      firstName: about.first_name,
      targetDirection: bodyGoal.target_direction,
      hasMedicalFlags: safetyFlags.length > 0,
    });

    // 6. Return response
    return NextResponse.json(
      {
        success: true,
        message: authUserId
          ? 'Assessment completed. Your personalized meal plan is ready!'
          : 'Assessment submitted successfully. Awaiting founder review.',
        token: rawOpaqueToken,
        assessment_id: assessmentId,
        redirectUrl: authUserId ? '/dashboard' : null,
        status: authUserId ? 'approved' : 'pending_review',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Assessment submission error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your assessment' },
      { status: 500 }
    );
  }
}
