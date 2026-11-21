'use client';

import React, { useState, useEffect, useCallback, use, Suspense } from 'react';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/admin-nav';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Sparkles,
  UtensilsCrossed,
  Send,
  Loader2,
} from 'lucide-react';
import type { CheckIn, WeightEntry } from '@/types/database.types';

const CHECKIN_SNIPPETS = [
  {
    title: 'Adherence Encouragement',
    text: 'Great work maintaining solid adherence this week! Consistency with regular home meals is the true foundation of sustainable progress. Keep your water intake around 2.5–3L and maintain your walk routine.',
  },
  {
    title: 'Digestive & Appetite Adjustment',
    text: 'Noted your feedback regarding afternoon appetite. We are slightly increasing your lunch protein portion (an extra 30g paneer / 1 boiled egg) and adding salted buttermilk to keep afternoon energy steady without sugar cravings.',
  },
  {
    title: 'Upcoming Travel / Schedule Guidance',
    text: 'For your upcoming travel days, prioritize simple choices: roasted chana/nuts for transit snacks, plain dal and steamed rice or dry phulkas for dining out, and skip heavy gravies where possible.',
  },
];

function AdminCheckInDetailContent({ checkInId }: { checkInId: string }) {
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [member, setMember] = useState<{
    id: string;
    first_name: string;
    last_name?: string | null;
    email: string;
  } | null>(null);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [activePlan, setActivePlan] = useState<{ id: string; version: number } | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchDetail = useCallback(() => {
    fetch(`/api/admin/check-ins/${checkInId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setCheckIn(data.checkIn);
        setMember(data.member);
        setWeightEntries(data.weightEntries || []);
        setActivePlan(data.activePlan);
        if (data.checkIn?.admin_feedback) {
          setFeedback(data.checkIn.admin_feedback);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching check-in details:', err);
        setLoading(false);
      });
  }, [checkInId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;

    setSubmitting(true);
    setSuccess(false);
    try {
      const res = await fetch(`/api/admin/check-ins/${checkInId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedback.trim() }),
      });

      if (res.ok) {
        setSuccess(true);
        fetchDetail();
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400">
        Loading check-in review...
      </div>
    );
  }

  if (!checkIn) {
    return (
      <div className="p-12 text-center text-xs text-red-500">
        Check-in not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/check-ins"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#075B2B]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Check-Ins Desk
        </Link>

        {activePlan && (
          <Link
            href={`/admin/diet-plans/new?memberId=${member?.id}&fromCheckIn=${checkIn.id}`}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-[#075B2B] hover:bg-emerald-50 shadow-2xs"
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            <span>Create Revised Diet Plan (v{activePlan.version + 1})</span>
          </Link>
        )}
      </div>

      {/* Member & Submission Summary */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              ⚡ Premium Member Check-In
            </span>
            <h1 className="text-xl font-extrabold text-[#1A2E1C] mt-1.5">
              {member ? `${member.first_name} ${member.last_name || ''}` : 'Member'}
            </h1>
            <p className="text-xs text-gray-400">
              {member?.email} • Week of {checkIn.week_start_date}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {checkIn.status === 'reviewed' ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#075B2B]">
                <CheckCircle2 className="h-4 w-4" /> Feedback Delivered
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                Needs Review
              </span>
            )}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl bg-gray-50 p-3">
            <span className="text-[10px] text-gray-500 block">Adherence Rating</span>
            <p className="text-base font-extrabold text-[#1A2E1C]">
              {checkIn.adherence_rating} <span className="text-xs text-gray-400">/ 5</span>
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3">
            <span className="text-[10px] text-gray-500 block">Energy &amp; Sleep</span>
            <p className="text-base font-extrabold text-[#1A2E1C]">
              {checkIn.energy_level} <span className="text-xs text-gray-400">/ 5</span>
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3">
            <span className="text-[10px] text-gray-500 block">Current Weight</span>
            <p className="text-base font-extrabold text-[#1A2E1C]">
              {checkIn.current_weight_kg ? `${checkIn.current_weight_kg} kg` : 'Not recorded'}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3">
            <span className="text-[10px] text-gray-500 block">Active Plan</span>
            <p className="text-base font-extrabold text-[#075B2B]">
              {activePlan ? `Version ${activePlan.version}` : 'None'}
            </p>
          </div>
        </div>

        {/* Member notes */}
        <div className="mt-4 space-y-3 rounded-xl bg-[#FFFDF7] p-4 border border-emerald-50 text-xs text-[#1A2E1C]">
          <div>
            <strong className="text-gray-700 block mb-0.5">Appetite &amp; Digestion Feedback:</strong>
            <p className="text-gray-600">
              {checkIn.appetite_notes || 'No specific notes mentioned.'}
            </p>
          </div>

          <div>
            <strong className="text-gray-700 block mb-0.5">Challenges &amp; Schedule Notes:</strong>
            <p className="text-gray-600">
              {checkIn.challenges_text || 'No schedule hurdles reported.'}
            </p>
          </div>
        </div>
      </div>

      {/* Weight History Preview if available */}
      {weightEntries.length > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs">
          <h3 className="text-xs font-bold text-gray-700 mb-2">Recent Weight Log Entries</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {weightEntries.map((w) => (
              <span
                key={w.id}
                className="rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-800 font-medium flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                {w.recorded_at}: <strong>{w.weight_kg} kg</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Editor */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2FAF37]" />
            <h3 className="text-sm font-bold text-[#1A2E1C]">Review &amp; Guidance</h3>
          </div>
          {success && (
            <span className="text-xs font-bold text-[#075B2B]">
              ✓ Feedback saved &amp; sent to member!
            </span>
          )}
        </div>

        {/* Guidance templates */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#075B2B] block mb-1.5">
            Quick Guidance Templates:
          </span>
          <div className="flex flex-wrap gap-2">
            {CHECKIN_SNIPPETS.map((s) => (
              <button
                key={s.title}
                type="button"
                onClick={() => setFeedback((prev) => (prev ? `${prev}\n\n${s.text}` : s.text))}
                className="rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#075B2B] hover:bg-emerald-50 shadow-2xs transition-colors"
              >
                + {s.title}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={6}
          placeholder="Write your detailed review, praise consistent habits, and outline any meal adjustments for the coming week..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={submitting}
          className="w-full rounded-xl border border-gray-200 p-3.5 text-xs text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#2FAF37] focus:outline-none focus:ring-1 focus:ring-[#2FAF37] bg-white resize-none"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-gray-400">
            Delivering feedback marks check-in as &quot;Reviewed&quot; and notifies the member dashboard.
          </span>

          <Button
            onClick={handleSubmitFeedback}
            disabled={submitting || !feedback.trim()}
            className="bg-[#075B2B] text-white hover:bg-[#064e24] text-xs font-bold px-6"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminCheckInDetailWrapper({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(paramsPromise);
  return <AdminCheckInDetailContent checkInId={unwrappedParams.id} />;
}

export default function AdminCheckInDetailPage({
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
            Loading check-in review...
          </div>
        }
      >
        <AdminCheckInDetailWrapper paramsPromise={params} />
      </Suspense>
    </div>
  );
}
