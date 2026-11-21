'use client';

import React from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Users,
  UtensilsCrossed,
  MessageSquare,
  Zap,
} from 'lucide-react';

export interface AdminMetrics {
  pendingAssessments: number;
  activeNormalMembers: number;
  activePremiumMembers: number;
  totalActiveMembers: number;
  openSupportTickets: number;
  premiumOpenTickets: number;
  pendingCheckIns: number;
  plansNeedingPublication: number;
}

interface MetricsSummaryProps {
  metrics: AdminMetrics;
}

export function MetricsSummary({ metrics }: MetricsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Intake Assessments */}
      <Link
        href="/admin/assessments"
        className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs hover:border-[#2FAF37] hover:shadow-sm transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Intake Triage</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ClipboardList className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-extrabold text-[#1A2E1C]">
          {metrics.pendingAssessments}
        </p>
        <p className="mt-1 text-[11px] text-gray-400">
          {metrics.pendingAssessments === 1
            ? '1 assessment pending review'
            : `${metrics.pendingAssessments} assessments pending review`}
        </p>
      </Link>

      {/* 2. Active Memberships */}
      <Link
        href="/admin/members"
        className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs hover:border-[#2FAF37] hover:shadow-sm transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Active Members</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-[#075B2B]">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-extrabold text-[#1A2E1C]">
          {metrics.totalActiveMembers}
        </p>
        <p className="mt-1 text-[11px] text-emerald-700 font-medium">
          {metrics.activeNormalMembers} Normal (₹499) • {metrics.activePremiumMembers} Premium (₹999)
        </p>
      </Link>

      {/* 3. Meal Plans Due */}
      <Link
        href="/admin/members"
        className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs hover:border-[#2FAF37] hover:shadow-sm transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Plans Due</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <UtensilsCrossed className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-extrabold text-[#1A2E1C]">
          {metrics.plansNeedingPublication}
        </p>
        <p className="mt-1 text-[11px] text-gray-400">
          Members awaiting initial published diet
        </p>
      </Link>

      {/* 4. Support Desk & Check-Ins */}
      <Link
        href="/admin/support"
        className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs hover:border-[#2FAF37] hover:shadow-sm transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">Support &amp; Reviews</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
            <MessageSquare className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <p className="text-2xl font-extrabold text-[#1A2E1C]">
            {metrics.openSupportTickets}
          </p>
          {metrics.premiumOpenTickets > 0 && (
            <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
              <Zap className="h-3 w-3" /> {metrics.premiumOpenTickets} Premium
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-gray-400">
          {metrics.pendingCheckIns} weekly check-ins awaiting review
        </p>
      </Link>
    </div>
  );
}
