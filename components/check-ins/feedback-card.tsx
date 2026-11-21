'use client';

import React from 'react';
import type { CheckIn } from '@/types/database.types';
import { Sparkles, Calendar, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

interface FeedbackCardProps {
  checkIn: CheckIn;
}

export function FeedbackCard({ checkIn }: FeedbackCardProps) {
  const isReviewed = checkIn.status === 'reviewed';

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#075B2B]" />
          <h4 className="text-xs font-bold text-[#1A2E1C]">
            Week of {new Date(checkIn.week_start_date).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </h4>
        </div>

        <div>
          {isReviewed ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#075B2B]">
              <CheckCircle2 className="h-3 w-3" /> Coach Feedback Ready
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              <Clock className="h-3 w-3" /> Submitted • Awaiting Review
            </span>
          )}
        </div>
      </div>

      {/* Member Logged Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="rounded-xl bg-gray-50 p-2.5">
          <span className="text-[10px] text-gray-500 block">Adherence</span>
          <span className="font-bold text-[#1A2E1C]">{checkIn.adherence_rating} / 5</span>
        </div>

        <div className="rounded-xl bg-gray-50 p-2.5">
          <span className="text-[10px] text-gray-500 block">Energy &amp; Sleep</span>
          <span className="font-bold text-[#1A2E1C]">{checkIn.energy_level} / 5</span>
        </div>

        <div className="rounded-xl bg-gray-50 p-2.5">
          <span className="text-[10px] text-gray-500 block">Reported Weight</span>
          <span className="font-bold text-[#1A2E1C]">
            {checkIn.current_weight_kg ? `${checkIn.current_weight_kg} kg` : '—'}
          </span>
        </div>

        <div className="rounded-xl bg-gray-50 p-2.5">
          <span className="text-[10px] text-gray-500 block">Submitted At</span>
          <span className="font-bold text-[#1A2E1C]">
            {new Date(checkIn.submitted_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Member Notes if any */}
      {(checkIn.appetite_notes || checkIn.challenges_text) && (
        <div className="space-y-1.5 rounded-xl bg-gray-50/70 p-3 text-xs text-gray-600">
          {checkIn.appetite_notes && (
            <p>
              <strong className="text-gray-700">Appetite:</strong> {checkIn.appetite_notes}
            </p>
          )}
          {checkIn.challenges_text && (
            <p>
              <strong className="text-gray-700">Challenges:</strong> {checkIn.challenges_text}
            </p>
          )}
        </div>
      )}

      {/* Coach Personalized Feedback */}
      {isReviewed && checkIn.admin_feedback ? (
        <div className="rounded-2xl border border-emerald-200 bg-[#EAF8E7]/50 p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#075B2B] mb-2">
            <Sparkles className="h-4 w-4 text-[#2FAF37]" /> Coach Recommendations:
          </div>
          <p className="text-xs text-[#1A2E1C] leading-relaxed whitespace-pre-wrap">
            {checkIn.admin_feedback}
          </p>
          {checkIn.reviewed_at && (
            <p className="mt-2 text-[10px] text-emerald-800">
              Reviewed on {new Date(checkIn.reviewed_at).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500 italic">
          Your coach is preparing this week&apos;s observations and meal plan adjustments.
        </p>
      )}

      <div className="flex justify-end pt-1">
        <Link
          href="/dashboard/meal-plan"
          className="text-xs font-bold text-[#075B2B] hover:underline"
        >
          View Updated 7-Day Plan &rarr;
        </Link>
      </div>
    </div>
  );
}
