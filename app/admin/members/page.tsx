import React from 'react';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { AdminNav } from '@/components/admin/admin-nav';
import { MemberTable, type AdminMemberRow } from '@/components/admin/member-table';
import type { MembershipStatus } from '@/types/database.types';

async function getAdminMembers(): Promise<AdminMemberRow[]> {
  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (!hasSupabase) {
    return [];
  }

  try {
    const supabase = createAdminClient();

    // Query profiles with role = 'member'
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone, created_at, role')
      .eq('role', 'member')
      .order('created_at', { ascending: false });

    if (error || !profiles) {
      return [];
    }

    // Query memberships
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

    // Query subscriptions
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

    return profiles.map((p) => {
      const mem = membershipMap.get(p.id);
      const sub = subscriptionMap.get(p.id);

      const fullName = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Member';

      return {
        userId: p.id,
        name: fullName,
        email: p.email,
        phone: p.phone,
        tier: sub?.planId || 'none',
        lifecycleStatus: mem?.status || 'registered',
        joinedAt: mem?.joinedAt || p.created_at,
        subscriptionStatus: sub?.status || null,
      };
    });
  } catch (err) {
    console.warn('Error fetching admin members:', err);
    return [];
  }
}

export default async function AdminMembersPage() {
  const members = await getAdminMembers();

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A2E1C]">Members Directory</h1>
            <p className="text-xs text-[#1A2E1C]/70 mt-1">
              Search and manage member accounts, subscription tiers, and lifecycle statuses
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Total Members: {members.length}
            </span>
          </div>
        </div>

        <MemberTable initialMembers={members} />
      </main>
    </div>
  );
}
