'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export interface ActionItem {
  type: string;
  title: string;
  description: string;
  href: string;
  urgency: 'high' | 'medium' | 'low';
}

interface ActionNeededListProps {
  actionItems: ActionItem[];
  isZeroState: boolean;
}

export function ActionNeededList({
  actionItems,
  isZeroState,
}: ActionNeededListProps) {
  if (isZeroState || actionItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#075B2B] mb-3">
          <Sparkles className="h-6 w-6 text-[#2FAF37]" />
        </div>
        <h3 className="text-base font-extrabold text-[#1A2E1C]">
          All Systems Operational
        </h3>
        <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
          Zero members yet — your system is ready for launch. All triage pipelines, meal builder engines, payment webhooks, and DPDP rights compliance are fully active.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link
            href="/admin/meal-library"
            className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-3.5 py-1.5 text-xs font-bold text-[#075B2B] hover:bg-emerald-100 transition-colors"
          >
            Review Meal Library &rarr;
          </Link>
          <Link
            href="/admin/assessments"
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Intake Review Desk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <h2 className="text-sm font-bold text-[#1A2E1C]">Immediate Actions Required</h2>
      </div>

      <div className="divide-y divide-gray-100 rounded-2xl border border-emerald-100 bg-white shadow-xs overflow-hidden">
        {actionItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-emerald-50/20 transition-colors gap-3"
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
                  item.urgency === 'high'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-[#075B2B]'
                }`}
              >
                {item.urgency === 'high' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A2E1C]">{item.title}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{item.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-[#075B2B] shrink-0 self-end sm:self-center">
              <span>Take Action</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
