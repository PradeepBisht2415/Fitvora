import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import type { Profile } from '@/types/database.types';

export interface EffectiveDashboardUserResult {
  authenticatedUser: { id: string; email?: string } | null;
  effectiveUserId: string | null;
  isAdmin: boolean;
  isImpersonating: boolean;
  clientProfile: Profile | null;
}

/**
 * Returns the effective user context for dashboard views.
 * If the authenticated user is an admin and passes `asMemberId`,
 * returns that member's ID and profile for client preview mode.
 * Otherwise, returns the authenticated user's own identity.
 */
export async function getEffectiveDashboardUser(
  asMemberId?: string
): Promise<EffectiveDashboardUserResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authenticatedUser: null,
      effectiveUserId: null,
      isAdmin: false,
      isImpersonating: false,
      clientProfile: null,
    };
  }

  const adminSupabase = createAdminClient();
  const { data: currentProfile } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const isAdmin = currentProfile?.role === 'admin';

  // Admin impersonating/viewing a client
  if (isAdmin && asMemberId) {
    const { data: clientProfile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', asMemberId)
      .maybeSingle();

    if (clientProfile) {
      return {
        authenticatedUser: user,
        effectiveUserId: clientProfile.id,
        isAdmin: true,
        isImpersonating: true,
        clientProfile: clientProfile as Profile,
      };
    }
  }

  // Admin viewing member dashboard without explicit member ID:
  // If admin doesn't have their own active subscription, fallback to first active member for preview
  if (isAdmin && !asMemberId) {
    const { data: adminSub } = await adminSupabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!adminSub) {
      const { data: firstMemberSub } = await adminSupabase
        .from('subscriptions')
        .select('user_id')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (firstMemberSub?.user_id) {
        const { data: clientProfile } = await adminSupabase
          .from('profiles')
          .select('*')
          .eq('id', firstMemberSub.user_id)
          .maybeSingle();

        if (clientProfile) {
          return {
            authenticatedUser: user,
            effectiveUserId: clientProfile.id,
            isAdmin: true,
            isImpersonating: true,
            clientProfile: clientProfile as Profile,
          };
        }
      }
    }
  }

  return {
    authenticatedUser: user,
    effectiveUserId: user.id,
    isAdmin,
    isImpersonating: false,
    clientProfile: currentProfile as Profile | null,
  };
}
