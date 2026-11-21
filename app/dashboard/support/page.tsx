'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TicketList } from '@/components/support/ticket-list';
import { MessageThread } from '@/components/support/message-thread';
import { NewTicketModal } from '@/components/support/new-ticket-modal';
import type { SupportThread, SupportMessage } from '@/types/database.types';
import { ShieldAlert, Zap, Clock } from 'lucide-react';

interface ExtendedMessage extends SupportMessage {
  sender?: {
    first_name: string;
    last_name?: string | null;
    role: string;
  } | null;
}

function SupportContent() {
  const searchParams = useSearchParams();
  const asMember = searchParams.get('asMember') || undefined;
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<SupportThread | null>(null);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadThreads = useCallback(() => {
    fetch(`/api/member/support${asMember ? `?asMember=${asMember}` : ''}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setThreads(data.threads || []);
        setIsPremium(data.isPremium || false);
        setCurrentUserId(data.userId || '');

        if (!activeThreadId && data.threads?.length > 0) {
          setActiveThreadId(data.threads[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load support threads:', err);
        setLoading(false);
      });
  }, [activeThreadId, asMember]);

  const loadThreadMessages = useCallback((threadId: string) => {
    fetch(`/api/member/support/${threadId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setActiveThread(data.thread);
        setMessages(data.messages || []);
      })
      .catch((err) => {
        console.error('Failed to load thread messages:', err);
      });
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (activeThreadId) {
      loadThreadMessages(activeThreadId);
    }
  }, [activeThreadId, loadThreadMessages]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      {/* Header & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2FAF37]">
              In-App Support Desk
            </span>
            {isPremium ? (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                <Zap className="h-3 w-3" /> Premium Priority Support
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                <Clock className="h-3 w-3" /> Normal Plan Support
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A2E1C]">Direct Support Inbox</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Ask questions regarding meal schedules, grocery alternatives, and routine adherence.
          </p>
        </div>

        <div>
          <NewTicketModal
            isPremium={isPremium}
            asMember={asMember}
            onSuccess={(newId) => {
              setActiveThreadId(newId);
              loadThreads();
            }}
          />
        </div>
      </div>

      {/* Advisory & Scope Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-[#EAF8E7]/60 p-4 text-xs text-[#075B2B]">
        <ShieldAlert className="h-4 w-4 shrink-0 text-[#075B2B] mt-0.5" />
        <div>
          <p className="font-bold">General Nutrition &amp; Routine Guidance</p>
          <p className="text-[11px] text-[#1A2E1C]/80 mt-0.5">
            All replies are delivered directly by your founder reviewer. For urgent health issues or medical diagnosis, please contact your registered healthcare provider.
          </p>
        </div>
      </div>

      {/* Two-Pane Ticket Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: List of inquiries */}
        <div className="md:col-span-1 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Your Inquiries ({threads.length})
          </h2>
          <TicketList
            threads={threads}
            activeThreadId={activeThreadId || undefined}
            onSelectThread={(id) => setActiveThreadId(id)}
          />
        </div>

        {/* Right Column: Active Conversation */}
        <div className="md:col-span-2">
          {activeThread ? (
            <MessageThread
              thread={activeThread}
              messages={messages}
              currentUserId={currentUserId}
              asMember={asMember}
              onMessageSent={() => {
                if (activeThreadId) loadThreadMessages(activeThreadId);
                loadThreads();
              }}
            />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-white p-6 text-center text-xs text-gray-400">
              {loading ? 'Loading conversations...' : 'Select an inquiry on the left to read messages.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl p-6 text-center text-xs text-gray-500">
          Loading support inbox...
        </div>
      }
    >
      <SupportContent />
    </Suspense>
  );
}
