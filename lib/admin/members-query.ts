import { createAdminClient } from '@/lib/db/supabase-admin';
import type { MembershipStatus } from '@/types/database.types';

export interface AdminMemberRow {
  userId: string;
  assessmentId?: string | null;
  name: string;
  email: string;
  phone: string | null;
  tier: 'normal' | 'premium' | 'none';
  lifecycleStatus: MembershipStatus;
  joinedAt: string | null;
  subscriptionStatus?: string | null;
  isLead?: boolean;
}

/**
 * Fetches all members and intake leads for the Members Directory.
 * Ensures non-admin profiles (even if role is 'visitor' or unconfirmed)
 * and prospective assessment leads are never silently omitted.
 */
export async function getAdminMembersList(): Promise<AdminMemberRow[]> {
  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (!hasSupabase) {
    return [];
  }

  try {
    const supabase = createAdminClient();

    // 1. Query all profiles ordered by created_at desc
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone, created_at, role')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.warn('Error fetching profiles for members directory:', profilesError);
    }

    // Filter out administrator accounts; include all members, visitors, and users
    const profiles = (allProfiles || []).filter((p) => p.role !== 'admin');

    // 2. Query memberships
    const { data: memberships } = await supabase
      .from('memberships')
      .select('user_id, lifecycle_status, joined_at');

    const membershipMap = new Map<string, { status: MembershipStatus; joinedAt: string | null }>();
    memberships?.forEach((m) => {
      membershipMap.set(m.user_id, {
        status: m.lifecycle_status,
        joinedAt: m.joined_at,
      });
    });

    // 3. Query subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('user_id, plan_id, status')
      .order('created_at', { ascending: false });

    const subscriptionMap = new Map<string, { planId: 'normal' | 'premium'; status: string }>();
    subscriptions?.forEach((s) => {
      if (!subscriptionMap.has(s.user_id)) {
        subscriptionMap.set(s.user_id, {
          planId: s.plan_id as 'normal' | 'premium',
          status: s.status,
        });
      }
    });

    // 4. Query assessments to link intake leads & phone numbers
    const { data: assessments } = await supabase
      .from('assessments')
      .select('id, user_id, first_name, email, phone, status, submitted_at')
      .order('submitted_at', { ascending: false });

    const assessmentByUserId = new Map<string, NonNullable<typeof assessments>[0]>();
    const assessmentByEmail = new Map<string, NonNullable<typeof assessments>[0]>();

    assessments?.forEach((asmt) => {
      if (asmt.user_id && !assessmentByUserId.has(asmt.user_id)) {
        assessmentByUserId.set(asmt.user_id, asmt);
      }
      if (asmt.email && !assessmentByEmail.has(asmt.email.toLowerCase())) {
        assessmentByEmail.set(asmt.email.toLowerCase(), asmt);
      }
    });

    // 5. Build member rows for all registered profiles
    const profileEmails = new Set<string>();
    const registeredRows: AdminMemberRow[] = profiles.map((p) => {
      const mem = membershipMap.get(p.id);
      const sub = subscriptionMap.get(p.id);
      const asmt =
        assessmentByUserId.get(p.id) ||
        (p.email ? assessmentByEmail.get(p.email.toLowerCase()) : null);

      if (p.email) {
        profileEmails.add(p.email.toLowerCase());
      }

      const fullName =
        [p.first_name, p.last_name].filter(Boolean).join(' ') ||
        asmt?.first_name ||
        'Member';
      const phoneNum = p.phone || asmt?.phone || null;

      return {
        userId: p.id,
        assessmentId: asmt?.id || null,
        name: fullName,
        email: p.email,
        phone: phoneNum,
        tier: sub?.planId || 'none',
        lifecycleStatus: mem?.status || (sub?.status === 'active' ? 'active' : 'registered'),
        joinedAt: mem?.joinedAt || p.created_at,
        subscriptionStatus: sub?.status || (asmt ? `Assessment ${asmt.status.replace(/_/g, ' ')}` : null),
        isLead: false,
      };
    });

    // 6. Include assessment leads that don't have an auth profile yet
    const leadRows: AdminMemberRow[] = [];
    assessments?.forEach((asmt) => {
      if (asmt.email && !profileEmails.has(asmt.email.toLowerCase())) {
        profileEmails.add(asmt.email.toLowerCase());
        leadRows.push({
          userId: `lead_${asmt.id}`,
          assessmentId: asmt.id,
          name: asmt.first_name || 'Intake Candidate',
          email: asmt.email,
          phone: asmt.phone || null,
          tier: 'none',
          lifecycleStatus: asmt.status === 'approved' ? 'registered' : 'invited',
          joinedAt: asmt.submitted_at || new Date().toISOString(),
          subscriptionStatus: `Assessment ${asmt.status.replace(/_/g, ' ')}`,
          isLead: true,
        });
      }
    });

    return [...registeredRows, ...leadRows];
  } catch (err) {
    console.warn('Error fetching admin members list:', err);
    return [];
  }
}
