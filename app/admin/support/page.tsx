'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/admin-nav';
import { Button } from '@/components/ui/button';
import { Search, Zap, Clock, CheckCircle2, MessageSquare, RefreshCw, Eye } from 'lucide-react';
import type { SupportThread } from '@/types/database.types';

interface ExtendedThread extends SupportThread {
  member?: {
    id: string;
    first_name: string;
    last_name?: string | null;
    email: string;
    phone?: string | null;
    planId?: 'normal' | 'premium' | null;
    membershipTier?: string;
  } | null;
  membershipTier?: string;
  planId?: 'normal' | 'premium' | null;
}

function AdminSupportContent() {
  const [threads, setThreads] = useState<ExtendedThread[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'waiting_member' | 'resolved'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchThreads = useCallback(() => {
    fetch('/api/admin/support')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.threads) setThreads(data.threads);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load support threads:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const filtered = threads.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSubject = t.subject.toLowerCase().includes(q);
      const matchName = t.member
        ? `${t.member.first_name} ${t.member.last_name || ''}`.toLowerCase().includes(q)
        : false;
      const matchEmail = t.member?.email.toLowerCase().includes(q) || false;
      const matchTier = (t.membershipTier || '').toLowerCase().includes(q);
      return matchSubject || matchName || matchEmail || matchTier;
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
              Operations &amp; Member Relations
            </span>
            <h1 className="text-2xl font-extrabold text-[#1A2E1C]">Support Queue</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Triage inquiries with automatic priority routing for Premium members.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchThreads}
            className="h-8 border-gray-200 text-xs"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
            {(['all', 'open', 'waiting_member', 'resolved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                  filter === tab
                    ? 'bg-white text-[#075B2B] shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab === 'waiting_member' ? 'Waiting Member' : tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search member, email, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#2FAF37] focus:outline-none focus:ring-1 focus:ring-[#2FAF37]"
            />
          </div>
        </div>

        {/* Support Queue Table */}
        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xs">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400">
              {loading ? 'Loading support queue...' : 'No inquiries match this filter.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((thread) => {
                const memberName = thread.member
                  ? [thread.member.first_name, thread.member.last_name].filter(Boolean).join(' ') || 'Member'
                  : 'Member';
                const isPremium = thread.planId === 'premium' || thread.priority === 'premium';
                const isNormal = thread.planId === 'normal';

                return (
                  <div
                    key={thread.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-emerald-50/20 transition-colors gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                          isPremium
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-[#075B2B]'
                        }`}
                      >
                        {isPremium ? (
                          <Zap className="h-4 w-4" />
                        ) : (
                          <MessageSquare className="h-4 w-4" />
                        )}
                      </div>

                      <div className="space-y-1">
                        {/* 1. Client Name & Membership Type Badge */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/admin/support/${thread.id}`}
                            className="text-sm font-bold text-[#1A2E1C] hover:text-[#075B2B] hover:underline"
                          >
                            {memberName}
                          </Link>

                          {isPremium ? (
                            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-800 border border-purple-200 flex items-center gap-1">
                              <Zap className="h-3 w-3" /> Premium Plan (₹999)
                            </span>
                          ) : isNormal ? (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                              Normal Plan (₹499)
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 border border-gray-200">
                              Standard Member
                            </span>
                          )}
                        </div>

                        {/* 2. Inquiry / Subject */}
                        <div className="text-xs text-[#1A2E1C]">
                          <span className="text-gray-400 font-medium">Inquiry:</span>{' '}
                          <Link
                            href={`/admin/support/${thread.id}`}
                            className="font-semibold text-gray-800 hover:underline"
                          >
                            {thread.subject}
                          </Link>
                        </div>

                        {/* 3. Contact details (email & phone) */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-500">
                          {thread.member?.email && <span>✉️ {thread.member.email}</span>}
                          {thread.member?.phone && (
                            <a
                              href={`tel:${thread.member.phone}`}
                              className="font-semibold text-[#075B2B] hover:underline"
                            >
                              📞 +91 {thread.member.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                      <div>
                        {thread.status === 'open' && (
                          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                            <Clock className="h-3 w-3" /> Open / Needs Reply
                          </span>
                        )}
                        {thread.status === 'waiting_member' && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                            Waiting for Member
                          </span>
                        )}
                        {thread.status === 'resolved' && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-[#075B2B] border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> Resolved
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-gray-400">
                        {new Date(thread.last_message_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <Link
                        href={`/dashboard?asMember=${thread.user_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-[#075B2B] hover:bg-emerald-100 transition-colors shadow-2xs"
                        title="View client dashboard"
                      >
                        <Eye className="h-3 w-3 text-[#2FAF37]" />
                        <span>Client View</span>
                      </Link>

                      <Link href={`/admin/support/${thread.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs border-gray-200 text-gray-700 hover:bg-gray-100"
                        >
                          Reply
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminSupportPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-500">
          Loading support queue...
        </div>
      }
    >
      <AdminSupportContent />
    </Suspense>
  );
}
