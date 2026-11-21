'use client';

import React from 'react';
import type { WeightEntry } from '@/types/database.types';
import { Award, TrendingDown, TrendingUp, Sparkles, Calendar } from 'lucide-react';

interface MilestoneCardProps {
  entries: WeightEntry[];
  baselineWeight?: number | null;
  targetDirection?: string | null;
}

export function MilestoneCard({
  entries,
  baselineWeight,
  targetDirection,
}: MilestoneCardProps) {
  if (!entries || entries.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#075B2B]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1A2E1C]">Start Your Journey</h4>
            <p className="text-xs text-gray-500">
              Log your initial weight today to unlock weekly milestone pacing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const firstEntry = sorted[0];
  const lastEntry = sorted[sorted.length - 1];
  const initialWeight = baselineWeight || (firstEntry ? Number(firstEntry.weight_kg) : 0);
  const latestWeight = lastEntry ? Number(lastEntry.weight_kg) : initialWeight;
  const totalChange = latestWeight - initialWeight;
  const isLoss = targetDirection === 'lose_weight';
  const isGain = targetDirection === 'gain_weight';

  // Total logged days count
  const entryCount = sorted.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Metric 1: Total Delta */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Overall Progress</span>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              totalChange === 0
                ? 'bg-gray-100 text-gray-600'
                : (isLoss && totalChange < 0) || (isGain && totalChange > 0)
                ? 'bg-emerald-100 text-[#075B2B]'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {totalChange <= 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
          </div>
        </div>
        <p className="mt-2 text-xl font-extrabold text-[#1A2E1C]">
          {totalChange > 0 ? `+${totalChange.toFixed(1)}` : totalChange.toFixed(1)}{' '}
          <span className="text-xs font-normal text-gray-500">kg</span>
        </p>
        <p className="mt-1 text-[11px] text-gray-500">
          From {initialWeight} kg baseline
        </p>
      </div>

      {/* Metric 2: Consistency Streak */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Consistency</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-[#075B2B]">
            <Calendar className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-xl font-extrabold text-[#1A2E1C]">
          {entryCount}{' '}
          <span className="text-xs font-normal text-gray-500">
            {entryCount === 1 ? 'entry' : 'entries'}
          </span>
        </p>
        <p className="mt-1 text-[11px] text-emerald-700 font-medium">
          {entryCount >= 7
            ? '🔥 Excellent logging habit!'
            : '🌱 Building routine day by day'}
        </p>
      </div>

      {/* Metric 3: Sustainable Pacing */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Mindset Note</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-[#075B2B]">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-xs font-semibold text-[#1A2E1C]">
          Sustainable Habits
        </p>
        <p className="mt-1 text-[11px] text-gray-500 leading-tight">
          True wellness is made of balanced meals and daily energy, not daily scale noise.
        </p>
      </div>
    </div>
  );
}
