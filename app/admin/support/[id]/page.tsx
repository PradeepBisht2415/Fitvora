'use client';

import React, { useState, useEffect, useCallback, use, Suspense } from 'react';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/admin-nav';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Zap,
  Sparkles,
  User,
  Loader2,
  Eye,
} from 'lucide-react';
import type { SupportThread, SupportMessage } from '@/types/database.types';

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

interface ExtendedMessage extends SupportMessage {
  sender?: {
    first_name: string;
    last_name?: string | null;
    role: string;
  } | null;
}

const GUIDANCE_TEMPLATES = [
  {
    title: 'Approved Dal / Roti Swap',
    text: 'For Indian home cooking, you can easily substitute Dal Tadka with Moong Dal or Rajma in equal 1-cup portions. If dining out, ask for dry roti without butter and yellow dal with light tadka.',
  },
  {
    title: 'Afternoon Hunger Tip',
    text: 'Afternoon energy drops often happen if your lunch was carb-heavy without sufficient protein or fiber. Try having a handful of roasted chana (30g) or a small glass of salted buttermilk (chaas) around 4:30 PM.',
  },
  {
    title: 'Hydration & Bloating Relief',
    text: 'Body weight can fluctuate by 0.5–1.5 kg due to water retention, especially after high-sodium meals or hormonal shifts. Aim for 2.5–3 liters of water and gentle 15-minute walks post dinner.',
  },
];

function AdminThreadContent({ threadId }: { threadId: string }) {
  const [thread, setThread] = useState<ExtendedThread | null>(null);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchThread = useCallback(() => {
    fetch(`/api/member/support/${threadId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setThread(data.thread);
        setMessages(data.messages || []);
        setLoading(false);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('fitvora:support-read'));
        }
      })
      .catch((err) => {
        console.error('Error fetching thread details:', err);
        setLoading(false);
      });
  }, [threadId]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  const handleSendReply = async (newStatus = 'waiting_member') => {
    if (!replyText.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/admin/support/${threadId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyText.trim(),
          status: newStatus,
        }),
      });

      if (res.ok) {
        setReplyText('');
        fetchThread();
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await fetch(`/api/admin/support/${threadId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[Status Updated to ${status.replace('_', ' ').toUpperCase()}]`,
          status,
        }),
      });
      fetchThread();
    } catch (err) {
      console.error('Status change error:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400">
        Loading ticket...
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="p-12 text-center text-xs text-red-500">
        Ticket not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/support"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#075B2B]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Support Queue
        </Link>

        <div className="flex items-center gap-2">
          {thread.status !== 'resolved' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('resolved')}
              className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-8"
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Mark Resolved
            </Button>
          )}
        </div>
      </div>

      {/* Client Overview & Ticket Details Box */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs space-y-4">
        {/* Top bar: Client Name, Membership Tier, Client View Button, and Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold text-[#1A2E1C]">
                {thread.member
                  ? [thread.member.first_name, thread.member.last_name].filter(Boolean).join(' ') || 'Member'
                  : 'Member Inquiry'}
              </h1>
              {thread.planId === 'premium' || thread.priority === 'premium' ? (
                <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 border border-purple-200">
                  <Zap className="h-3.5 w-3.5" /> Premium Plan (₹999)
                </span>
              ) : thread.planId === 'normal' ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                  Normal Plan (₹499)
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 border border-gray-200">
                  Standard Member
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              {thread.member?.email && <span>✉️ {thread.member.email}</span>}
              {thread.member?.phone && (
                <a href={`tel:${thread.member.phone}`} className="font-semibold text-emerald-800 hover:underline">
                  📞 +91 {thread.member.phone}
                </a>
              )}
              {thread.member?.phone && (
                <a
                  href={`https://wa.me/91${thread.member.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold hover:bg-emerald-200"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard?asMember=${thread.user_id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#075B2B] hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <Eye className="h-3.5 w-3.5 text-[#2FAF37]" />
              <span>View Client Dashboard</span>
            </Link>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Status:</span>
              <select
                value={thread.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#1A2E1C] focus:border-[#2FAF37] focus:outline-none"
              >
                <option value="open">Open</option>
                <option value="waiting_member">Waiting for Member</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inquiry Subject */}
        <div>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">Inquiry Subject</span>
          <p className="text-sm font-bold text-[#1A2E1C] mt-0.5">{thread.subject}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Ticket ID: {thread.id} • Created {new Date(thread.created_at).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="rounded-2xl border border-emerald-100 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-[#FFFDF7] flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700">Conversation History</span>
          <span className="text-[11px] text-gray-400">{messages.length} messages</span>
        </div>

        <div className="p-5 space-y-4 max-h-[460px] overflow-y-auto">
          {messages.map((msg) => {
            const isSupport = msg.sender?.role === 'admin';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isSupport ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[11px] text-gray-400">
                  {isSupport ? (
                    <span className="flex items-center gap-1 font-bold text-[#075B2B]">
                      <Sparkles className="h-3 w-3 text-[#2FAF37]" /> Fitvora Support (You)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-bold text-gray-700">
                      <User className="h-3 w-3" /> Member
                    </span>
                  )}
                  <span>•</span>
                  <span>{new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isSupport
                      ? 'bg-[#075B2B] text-white rounded-br-xs'
                      : 'bg-gray-100 text-[#1A2E1C] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guidance Quick Snippets */}
        <div className="border-t border-gray-100 bg-emerald-50/40 p-3 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#075B2B] block mb-2">
            Quick Guidance Snippets:
          </span>
          <div className="flex flex-wrap gap-2">
            {GUIDANCE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.title}
                type="button"
                onClick={() => setReplyText((prev) => (prev ? `${prev}\n\n${tmpl.text}` : tmpl.text))}
                className="rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#075B2B] hover:bg-emerald-50 shadow-2xs transition-colors"
              >
                + {tmpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Support Reply Box */}
        <div className="border-t border-gray-100 p-4 bg-[#FFFDF7]">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Support Response
          </label>
          <textarea
            rows={4}
            placeholder="Type your personalized guidance to the member..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={sending}
            className="w-full rounded-xl border border-gray-200 p-3 text-xs text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#2FAF37] focus:outline-none focus:ring-1 focus:ring-[#2FAF37] bg-white resize-none"
          />

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              Sending a reply automatically updates status to &quot;Waiting for Member&quot;.
            </span>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSendReply('resolved')}
                disabled={sending || !replyText.trim()}
                className="text-xs text-emerald-800 border-emerald-200"
              >
                Reply &amp; Resolve
              </Button>
              <Button
                size="sm"
                onClick={() => handleSendReply('waiting_member')}
                disabled={sending || !replyText.trim()}
                className="bg-[#075B2B] text-white hover:bg-[#064e24] text-xs font-bold"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminThreadWrapper({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(paramsPromise);
  return <AdminThreadContent threadId={unwrappedParams.id} />;
}

export default function AdminThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <AdminNav />
      <Suspense
        fallback={
          <div className="p-12 text-center text-xs text-gray-400">
            Loading ticket...
          </div>
        }
      >
        <AdminThreadWrapper paramsPromise={params} />
      </Suspense>
    </div>
  );
}
