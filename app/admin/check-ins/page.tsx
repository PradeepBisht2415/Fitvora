'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/admin-nav';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Clock, CheckCircle2, Search, RefreshCw } from 'lucide-react';
import type { CheckIn } from '@/types/database.types';

interface ExtendedCheckIn extends CheckIn {
  member?: {
    id: string;
    first_name: string;
    last_name?: string | null;
    email: string;
  } | null;
}

function AdminCheckInsContent() {
  const [checkIns, setCheckIns] = useState<ExtendedCheckIn[]>([]);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'reviewed'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCheckIns = useCallback(() => {
    fetch('/api/admin/check-ins')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.checkIns) setCheckIns(data.checkIns);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load check-ins:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  const filtered = checkIns.filter((c) => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = c.member
        ? `${c.member.first_name} ${c.member.last_name || ''}`.toLowerCase().includes(q)
        : false;
      const matchEmail = c.member?.email.toLowerCase().includes(q) || false;
      return matchName || matchEmail;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <AdminNav />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2FAF37]">
              Premium Operations
            </span>
            <h1 className="text-2xl font-extrabold text-[#1A2E1C]">Weekly Check-In Desk</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review weekly adherence logs from Premium members and deliver personalized guidance.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchCheckIns}
            className="h-8 border-gray-200 text-xs"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Desk
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
            {(['all', 'submitted', 'reviewed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                  filter === tab
                    ? 'bg-white text-[#075B2B] shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab === 'submitted' ? 'Pending Review' : tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search member name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#2FAF37] focus:outline-none focus:ring-1 focus:ring-[#2FAF37]"
            />
          </div>
        </div>

        {/* Check-ins Table / List */}
        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xs">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400">
              {loading ? 'Loading check-ins...' : 'No check-ins match this filter.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/check-ins/${item.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-emerald-50/20 transition-colors gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-[#075B2B] shrink-0">
                      <ClipboardCheck className="h-4 w-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#1A2E1C]">
                          {item.member
                            ? `${item.member.first_name} ${item.member.last_name || ''}`
                            : 'Unknown Member'}
                        </h4>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          ⚡ Premium
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Week of {item.week_start_date} • {item.member?.email}
                      </p>

                      <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-600">
                        <span>Adherence: <strong>{item.adherence_rating}/5</strong></span>
                        <span>Energy: <strong>{item.energy_level}/5</strong></span>
                        {item.current_weight_kg && (
                          <span>Weight: <strong>{item.current_weight_kg} kg</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div>
                      {item.status === 'submitted' ? (
                        <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          <Clock className="h-3 w-3" /> Needs Review
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-[#075B2B]">
                          <CheckCircle2 className="h-3 w-3" /> Reviewed
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-gray-400">
                      Submitted {new Date(item.submitted_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminCheckInsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-500">
          Loading check-ins desk...
        </div>
      }
    >
      <AdminCheckInsContent />
    </Suspense>
  );
}
