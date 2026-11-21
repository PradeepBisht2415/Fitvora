'use client';

import React, { useState } from 'react';
import type { SupportThread, SupportMessage } from '@/types/database.types';
import { postSupportMessage, updateThreadStatus } from '@/features/support/ticket-actions';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle2, User, Sparkles, Loader2 } from 'lucide-react';

interface ExtendedMessage extends SupportMessage {
  sender?: {
    first_name: string;
    last_name?: string | null;
    role: string;
  } | null;
}

interface MessageThreadProps {
  thread: SupportThread;
  messages: ExtendedMessage[];
  currentUserId: string;
  onMessageSent: () => void;
}

export function MessageThread({
  thread,
  messages,
  currentUserId,
  onMessageSent,
}: MessageThreadProps) {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await postSupportMessage(thread.id, replyText);
      if (!res.success) {
        setError(res.error || 'Failed to send reply');
      } else {
        setReplyText('');
        onMessageSent();
      }
    } catch {
      setError('An error occurred while sending your message.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!confirm('Mark this inquiry as resolved?')) return;
    await updateThreadStatus(thread.id, 'resolved');
    onMessageSent();
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-emerald-100 bg-white shadow-xs overflow-hidden">
      {/* Thread Header */}
      <div className="border-b border-gray-100 bg-[#FFFDF7] p-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#1A2E1C]">{thread.subject}</h3>
            {thread.priority === 'premium' && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                ⚡ Premium Queue
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500">
            Started on {new Date(thread.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {thread.status !== 'resolved' && thread.status !== 'closed' && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleResolve}
            className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-8 flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Mark Resolved</span>
          </Button>
        )}
      </div>

      {/* Messages stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[420px]">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const isFounder = msg.sender?.role === 'admin' || !isMe;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[11px] text-gray-400">
                {isFounder ? (
                  <span className="flex items-center gap-1 font-semibold text-[#075B2B]">
                    <Sparkles className="h-3 w-3 text-[#2FAF37]" /> Fitvora Founder Reviewer
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-semibold text-gray-700">
                    <User className="h-3 w-3" /> You
                  </span>
                )}
                <span>•</span>
                <span>
                  {new Date(msg.created_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isMe
                    ? 'bg-[#075B2B] text-white rounded-br-xs'
                    : 'bg-[#EAF8E7] text-[#1A2E1C] rounded-bl-xs border border-emerald-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply input */}
      <div className="border-t border-gray-100 bg-[#FFFDF7] p-3 sm:p-4">
        {error && (
          <div className="mb-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Write your follow-up reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#2FAF37] focus:outline-none focus:ring-2 focus:ring-[#2FAF37]/20 bg-white"
          />
          <Button
            type="submit"
            disabled={loading || !replyText.trim()}
            className="bg-[#075B2B] text-white hover:bg-[#064e24] text-xs font-bold h-9 px-4 shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="mr-1 h-3.5 w-3.5" />
                <span>Send</span>
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
