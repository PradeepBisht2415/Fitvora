'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createSupportThread } from '@/features/support/ticket-actions';
import { Plus, X, Loader2, MessageSquare, AlertCircle } from 'lucide-react';

interface NewTicketModalProps {
  onSuccess?: (threadId: string) => void;
  isPremium?: boolean;
}

export function NewTicketModal({ onSuccess, isPremium }: NewTicketModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Please provide both a subject and details for your question.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createSupportThread(subject, message);
      if (!res.success || !res.threadId) {
        setError(res.error || 'Failed to submit inquiry.');
      } else {
        setIsOpen(false);
        setSubject('');
        setMessage('');
        if (onSuccess) onSuccess(res.threadId);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#075B2B] text-white hover:bg-[#064e24] shadow-xs flex items-center gap-1.5"
      >
        <Plus className="h-4 w-4" />
        <span>Ask a Question</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-emerald-100">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-[#075B2B]">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#1A2E1C]">New Support Inquiry</h3>
                  {isPremium && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      ⚡ Priority Queue
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Reach your founder reviewer directly</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swapping dinner dal when eating out, hunger levels in afternoon"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#2FAF37] focus:outline-none focus:ring-2 focus:ring-[#2FAF37]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your Question or Routine Challenge *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe what's on your mind. Mention specific meal items or schedule details so the founder can give actionable advice."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#2FAF37] focus:outline-none focus:ring-2 focus:ring-[#2FAF37]/20 resize-none"
                />
              </div>

              {/* Scope & Medical Disclaimer */}
              <div className="flex items-start gap-2 rounded-xl bg-amber-50/70 border border-amber-200/60 p-3 text-[11px] text-amber-900 leading-tight">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Routine & Nutrition Guidance Only:</strong> Fitvora is not a clinic or medical emergency service. For acute symptoms, medical conditions, or medication adjustments, please consult your physician.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#075B2B] text-white hover:bg-[#064e24] text-xs font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Submit Inquiry'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
