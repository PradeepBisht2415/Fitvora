'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, X, Check, Loader2, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
}

export function UpgradeModal({ onSuccess, triggerButton }: UpgradeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_plan: 'premium' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete upgrade.');
      }

      setIsOpen(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upgrade failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)}>{triggerButton}</div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-[#075B2B] to-[#2FAF37] text-white hover:opacity-95 text-xs font-bold shadow-xs flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Upgrade to Premium (₹999/mo)</span>
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-amber-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Tier Upgrade
                </span>
                <h3 className="text-base font-extrabold text-[#1A2E1C]">
                  Switch to Premium Plan
                </h3>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              Both Normal and Premium members receive the <strong>exact same high standard</strong> of personalized Indian home-food meal planning. Upgrading unlocks weekly accountability and priority turnaround.
            </p>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Feature comparison */}
            <div className="space-y-2.5 rounded-xl bg-amber-50/60 p-4 border border-amber-200/60 text-xs text-[#1A2E1C] mb-5">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                <span>
                  <strong>Weekly Structured Check-Ins:</strong> Submit adherence, appetite, and routine hurdles every week for direct founder reviews.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                <span>
                  <strong>Priority Support Turnaround:</strong> Your inquiries are routed to the top of the founder triage desk.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Interruption:</strong> Your existing published meal plan remains 100% untouched.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div>
                <span className="text-xs text-gray-500">Premium Subscription</span>
                <p className="text-lg font-extrabold text-[#1A2E1C]">
                  ₹999 <span className="text-xs font-normal text-gray-500">/ month</span>
                </p>
              </div>

              <div className="flex gap-2">
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
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="bg-[#075B2B] text-white hover:bg-[#064e24] text-xs font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Upgrading...
                    </>
                  ) : (
                    'Confirm Upgrade'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
