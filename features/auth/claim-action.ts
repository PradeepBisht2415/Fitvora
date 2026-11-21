'use server';

import { createAdminClient } from '@/lib/db/supabase-admin';
import { hashToken } from '@/lib/utils/crypto';
import { z } from 'zod';

const claimSchema = z.object({
  token: z.string().min(10, 'Invalid claim token'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export interface ClaimVerificationResult {
  valid: boolean;
  error?: string;
  firstName?: string;
  email?: string;
  targetDirection?: string;
}

/**
 * Validates whether an opaque token corresponds to an approved, unclaimed assessment.
 */
export async function verifyClaimToken(token: string): Promise<ClaimVerificationResult> {
  try {
    const tokenHash = hashToken(token);
    const supabase = createAdminClient();

    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('id, user_id, status, first_name, email, target_direction')
      .eq('draft_token_hash', tokenHash)
      .single();

    if (error || !assessment) {
      return { valid: false, error: 'Assessment invitation not found or link has expired.' };
    }

    if (assessment.user_id) {
      return {
        valid: false,
        error: 'This assessment has already been claimed. Please log in with your credentials.',
      };
    }

    if (assessment.status !== 'approved') {
      return {
        valid: false,
        error: `This assessment is currently in '${assessment.status.replace('_', ' ')}' status. Only approved assessments can be claimed.`,
      };
    }

    return {
      valid: true,
      firstName: assessment.first_name,
      email: assessment.email,
      targetDirection: assessment.target_direction,
    };
  } catch (err) {
    console.error('Error verifying claim token:', err);
    return { valid: false, error: 'Unable to verify invitation link at this time.' };
  }
}

/**
 * Creates the user account, links the assessment, and initializes the member lifecycle.
 */
export async function claimAssessmentAccount(formData: {
  token: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = claimSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Invalid input' };
    }

    const { token, password } = validated.data;
    const tokenHash = hashToken(token);
    const supabase = createAdminClient();

    // 1. Re-verify the assessment record
    const { data: assessment, error: fetchErr } = await supabase
      .from('assessments')
      .select('id, user_id, status, first_name, email, phone')
      .eq('draft_token_hash', tokenHash)
      .single();

    if (fetchErr || !assessment) {
      return { success: false, error: 'Assessment invitation not found.' };
    }

    if (assessment.user_id) {
      return { success: false, error: 'This assessment has already been claimed.' };
    }

    if (assessment.status !== 'approved') {
      return { success: false, error: 'Only approved assessments can be claimed.' };
    }

    // 2. Create the user in Supabase Auth via Admin Client
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: assessment.email,
      password: password,
      email_confirm: true, // Auto-confirm since token was sent to their verified email
      user_metadata: {
        first_name: assessment.first_name,
        role: 'member',
      },
      app_metadata: {
        role: 'member',
      },
    });

    if (authError || !authUser.user) {
      // If user already exists in Auth with that email, retrieve their ID
      if (authError?.message?.includes('already been registered')) {
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existing = existingUsers?.users?.find(
          (u) => u.email?.toLowerCase() === assessment.email.toLowerCase()
        );
        if (existing) {
          // Link assessment to existing user
          await linkAssessmentToUser(supabase, assessment.id, existing.id);
          return { success: true };
        }
      }
      return { success: false, error: authError?.message || 'Failed to create user account' };
    }

    const userId = authUser.user.id;

    // 3. Link assessment, create profile, and set membership to 'invited'
    await linkAssessmentToUser(supabase, assessment.id, userId, {
      first_name: assessment.first_name,
      email: assessment.email,
      phone: assessment.phone,
    });

    return { success: true };
  } catch (err) {
    console.error('Error claiming assessment account:', err);
    return { success: false, error: 'An unexpected error occurred during account claiming.' };
  }
}

async function linkAssessmentToUser(
  supabase: ReturnType<typeof createAdminClient>,
  assessmentId: string,
  userId: string,
  profileData?: { first_name: string; email: string; phone?: string | null }
) {
  // Update assessment
  await supabase
    .from('assessments')
    .update({ user_id: userId })
    .eq('id', assessmentId);

  // Upsert profile
  if (profileData) {
    await supabase.from('profiles').upsert({
      id: userId,
      first_name: profileData.first_name,
      email: profileData.email,
      phone: profileData.phone || null,
      role: 'member',
      timezone: 'Asia/Kolkata',
    });
  }

  // Create membership with 'invited' status
  await supabase.from('memberships').upsert({
    user_id: userId,
    lifecycle_status: 'invited',
    joined_at: new Date().toISOString(),
  });

  // Write audit log
  await supabase.from('audit_logs').insert({
    actor_id: userId,
    action: 'assessment_claimed',
    entity_type: 'assessment',
    entity_id: assessmentId,
    metadata: {
      claimed_at: new Date().toISOString(),
    },
  });
}
