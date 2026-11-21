import React from 'react';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { AdminNav } from '@/components/admin/admin-nav';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { CreditCard, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Subscription } from '@/types/database.types';

interface SubscriptionWithProfile extends Subscription {
  profiles?: {
    first_name: string;
    email: string;
  } | null;
}

async function getAdminSubscriptions(): Promise<SubscriptionWithProfile[]> {
  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (!hasSupabase) {
    return [];
  }

  try {
    const supabase = createAdminClient();
    const { data: subs, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !subs) {
      return [];
    }

    // Fetch associated profile emails
    const userIds = Array.from(new Set(subs.map((s) => s.user_id)));
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, email')
      .in('id', userIds);

    const profileMap = new Map<string, { first_name: string; email: string }>();
    profiles?.forEach((p) => profileMap.set(p.id, { first_name: p.first_name, email: p.email }));

    return subs.map((s) => ({
      ...s,
      profiles: profileMap.get(s.user_id) || null,
    }));
  } catch (err) {
    console.warn('Error fetching admin subscriptions:', err);
    return [];
  }
}

export default async function AdminSubscriptionsPage() {
  const subscriptions = await getAdminSubscriptions();

  // Metrics
  const totalSubs = subscriptions.length;
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const haltedSubs = subscriptions.filter((s) => s.status === 'halted');
  const cancelledSubs = subscriptions.filter((s) => s.status === 'cancelled');

  const mrrPaise = activeSubs.reduce((acc, curr) => {
    return acc + (curr.plan_id === 'premium' ? 99900 : 49900);
  }, 0);
  const mrrRupees = (mrrPaise / 100).toLocaleString('en-IN');

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-extrabold text-[#1A2E1C]">Subscriptions & Revenue</h1>
          <p className="text-xs text-[#1A2E1C]/70 mt-1">
            Real-time Razorpay recurring subscription monitoring and Monthly Recurring Revenue (MRR)
          </p>
        </div>

        {/* Metric Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
              <span>Active Subscriptions</span>
              <CheckCircle2 className="h-4 w-4 text-[#2FAF37]" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-[#1A2E1C]">{activeSubs.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Paying members</p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold uppercase">
              <span>Estimated MRR</span>
              <TrendingUp className="h-4 w-4 text-[#075B2B]" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-[#075B2B]">₹{mrrRupees}</p>
            <p className="text-[11px] text-emerald-700/80 mt-0.5">Monthly recurring revenue</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
              <span>Total Created</span>
              <CreditCard className="h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-[#1A2E1C]">{totalSubs}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Lifetime checkouts</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold uppercase">
              <span>Halted / Cancelled</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-amber-700">
              {haltedSubs.length + cancelledSubs.length}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {haltedSubs.length} halted • {cancelledSubs.length} cancelled
            </p>
          </div>
        </div>

        {/* Subscriptions Table */}
        {subscriptions.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Zero Subscriptions Recorded"
            description="Fitvora launches with zero real members. As users complete Razorpay checkout for Normal (₹499) and Premium (₹999) plans, transactions will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EAF8E7]/50 text-gray-700 uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">User / Email</th>
                    <th className="py-3 px-4 font-semibold">Tier</th>
                    <th className="py-3 px-4 font-semibold">Provider Subscription ID</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Period End / Renewal</th>
                    <th className="py-3 px-4 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#1A2E1C]">
                          {sub.profiles?.first_name || 'Member'}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {sub.profiles?.email || sub.user_id}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {sub.plan_id === 'premium' ? (
                          <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-800 font-semibold">
                            Premium (₹999)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold">
                            Normal (₹499)
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                        {sub.provider_subscription_id || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {sub.current_period_end
                          ? new Date(sub.current_period_end).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(sub.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
