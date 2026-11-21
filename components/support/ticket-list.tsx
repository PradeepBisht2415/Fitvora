'use client';

import React from 'react';
import type { SupportThread } from '@/types/database.types';
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface TicketListProps {
  threads: SupportThread[];
  activeThreadId?: string;
  onSelectThread: (threadId: string) => void;
}

export function TicketList({
  threads,
  activeThreadId,
  onSelectThread,
}: TicketListProps) {
  if (!threads || threads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-100 bg-white p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#075B2B]">
          <MessageSquare className="h-5 w-5" />
        </div>
        <h4 className="mt-2 text-sm font-bold text-[#1A2E1C]">No Inquiries Yet</h4>
        <p className="mt-1 text-xs text-gray-500 max-w-xs mx-auto">
          Need guidance on meal timing, home-cooked food alternatives, or managing routine fatigue? Click &quot;Ask a Question&quot; above.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: SupportThread['status']) => {
    switch (status) {
      case 'open':
        return (
          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            <Clock className="h-3 w-3" /> Under Review
          </span>
        );
      case 'waiting_member':
        return (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-[#075B2B]">
            <AlertCircle className="h-3 w-3" /> Founder Replied
          </span>
        );
      case 'resolved':
        return (
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
            <CheckCircle2 className="h-3 w-3" /> Resolved
          </span>
        );
      case 'closed':
        return (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
            Closed
          </span>
        );
    }
  };

  return (
    <div className="space-y-2">
      {threads.map((thread) => {
        const isSelected = thread.id === activeThreadId;
        const formattedDate = new Date(thread.last_message_at).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
        });

        return (
          <div
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={`cursor-pointer rounded-2xl border p-4 transition-all duration-150 ${
              isSelected
                ? 'border-[#2FAF37] bg-white shadow-xs'
                : 'border-emerald-100/70 bg-white hover:border-emerald-200 hover:bg-emerald-50/20'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-xs font-bold text-[#1A2E1C] line-clamp-1">
                {thread.subject}
              </h4>
              <span className="text-[10px] text-gray-400 shrink-0">{formattedDate}</span>
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {getStatusBadge(thread.status)}
                {thread.priority === 'premium' && (
                  <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-200/60">
                    ⚡ Priority
                  </span>
                )}
              </div>

              <span className="text-[11px] font-semibold text-[#075B2B] hover:underline">
                View &rarr;
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
