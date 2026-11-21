import React from 'react';
import { createClient } from '@/lib/db/supabase-server';
import { AdminNav } from '@/components/admin/admin-nav';
import { MemberTable } from '@/components/admin/member-table';
import { getAdminMembersList } from '@/lib/admin/members-query';

export default async function AdminMembersPage() {
  // Invoking createClient() reads cookies() to guarantee dynamic real-time evaluation
  const supabase = await createClient();
  await supabase.auth.getUser();

  const members = await getAdminMembersList();

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A2E1C]">Members Directory</h1>
            <p className="text-xs text-[#1A2E1C]/70 mt-1">
              Search and manage member accounts, subscription tiers, and intake leads
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Total Clients &amp; Leads: {members.length}
            </span>
          </div>
        </div>

        <MemberTable initialMembers={members} />
      </main>
    </div>
  );
}
