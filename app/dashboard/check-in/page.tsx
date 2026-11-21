'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckInForm } from '@/components/check-ins/check-in-form';
import { FeedbackCard } from '@/components/check-ins/feedback-card';
import { UpgradeModal } from '@/components/billing/upgrade-modal';
import type { CheckIn } from '@/types/database.types';
import { ClipboardCheck, Zap, History } from 'lucide-react';

function CheckInContent() {
  const searchParams = useSearchParams();
  const asMember = searchParams.get('asMember') || undefined;
  const [isPremium, setIsPremium] = useState(false);
  const [currentCheckIn, setCurrentCheckIn] = useState<CheckIn | null>(null);
  const [pastCheckIns, setPastCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    fetch(`/api/member/check-ins${asMember ? `?asMember=${asMember}` : ''}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setIsPremium(data.isPremium || false);
        setCurrentCheckIn(data.currentCheckIn || null);
        setPastCheckIns(data.pastCheckIns || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load check-ins:', err);
        setLoading(false);
      });
  }, [asMember]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-12 text-center text-xs text-gray-400">
        Loading check-in portal...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2FAF37]">
            Structured Accountability
          </span>
          {isPremium && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              <Zap className="h-3 w-3" /> Premium Plan Active
            </span>
          )}
        </div>
        <h1 className="text-2xl font-extrabold text-[#1A2E1C]">Weekly Check-In Desk</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Review your appetite, schedule challenges, and weekly habit adherence with your coach.
        </p>
      </div>

      {/* If Normal tier: Show Upgrade Callout */}
      {!isPremium ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 sm:p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 mb-4">
            <ClipboardCheck className="h-6 w-6" />
          </div>

          <h2 className="text-lg font-extrabold text-[#1A2E1C]">
            Unlock Weekly Coach Reviews
          </h2>
          <p className="mt-2 max-w-md mx-auto text-xs text-gray-600 leading-relaxed">
            Both Normal and Premium plans receive the <strong>exact same high standard</strong> of personalized Indian home-food meal planning. Weekly check-in forms and direct schedule adjustments are unlocked with the Premium tier (₹999/mo).
          </p>

          <div className="mt-6 flex justify-center">
            <UpgradeModal onSuccess={loadData} />
          </div>
        </div>
      ) : (
        /* If Premium tier: Current Week Check-In Form or Submitted Status */
        <div className="space-y-6">
          {currentCheckIn ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1A2E1C]">This Week&apos;s Review Status</h2>
              </div>
              <FeedbackCard checkIn={currentCheckIn} />
            </div>
          ) : (
            <CheckInForm onSuccess={loadData} />
          )}

          {/* Past Check-ins History */}
          {pastCheckIns.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#075B2B]" />
                <h3 className="text-sm font-bold text-[#1A2E1C]">
                  Past Check-In History ({pastCheckIns.length})
                </h3>
              </div>

              <div className="space-y-3">
                {pastCheckIns.map((item) => (
                  <FeedbackCard key={item.id} checkIn={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl p-6 text-center text-xs text-gray-500">
          Loading check-in desk...
        </div>
      }
    >
      <CheckInContent />
    </Suspense>
  );
}
