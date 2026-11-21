'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/admin-nav';
import { Button } from '@/components/ui/button';
import { Search, Zap, Clock, CheckCircle2, MessageSquare, RefreshCw } from 'lucide-react';
import type { SupportThread } from '@/types/database.types';

interface ExtendedThread extends SupportThread {
  member?: {
    id: string;
    first_name: string;
    last_name?: string | null;
    email: string;
  } | null;
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
      return matchSubject || matchName || matchEmail;
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
                const isPremium = thread.priority === 'premium';
                return (
                  <Link
                    key={thread.id}
                    href={`/admin/support/${thread.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-emerald-50/20 transition-colors gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                          isPremium
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-[#075B2B]'
                        }`}
                      >
                        {isPremium ? (
                          <Zap className="h-4 w-4" />
                        ) : (
                          <MessageSquare className="h-4 w-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#1A2E1C]">
                            {thread.subject}
                          </h4>
                          {isPremium && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                              ⚡ Premium
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mt-0.5">
                          {thread.member
                            ? `${thread.member.first_name} ${thread.member.last_name || ''} (${thread.member.email})`
                            : 'Unknown Member'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div>
                        {thread.status === 'open' && (
                          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            <Clock className="h-3 w-3" /> Open / Needs Reply
                          </span>
                        )}
                        {thread.status === 'waiting_member' && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            Waiting for Member
                          </span>
                        )}
                        {thread.status === 'resolved' && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-[#075B2B]">
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
                    </div>
                  </Link>
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
