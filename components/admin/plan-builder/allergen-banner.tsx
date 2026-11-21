'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import type { PlanMealSlot } from '@/features/diet-plans/plan-builder-store';

interface AllergenBannerProps {
  memberAllergies: string[];
  meals: PlanMealSlot[];
}

export function AllergenBanner({ memberAllergies, meals }: AllergenBannerProps) {
  if (!memberAllergies || memberAllergies.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50/80 border border-emerald-200 p-3 text-xs text-emerald-900">
        <ShieldCheck className="h-4 w-4 text-[#2FAF37] shrink-0" />
        <span>No known allergies disclosed in member assessment. All standard recipes safe.</span>
      </div>
    );
  }

  // Find any conflicts
  const conflicts: { dayOfWeek: number; mealType: string; mealTitle: string; matchedAllergen: string }[] = [];

  const normalizedMemberAllergies = memberAllergies.map((a) => a.toLowerCase().trim());

  meals.forEach((m) => {
    m.allergenTags.forEach((tag) => {
      const lowerTag = tag.toLowerCase().trim();
      if (normalizedMemberAllergies.some((a) => a.includes(lowerTag) || lowerTag.includes(a))) {
        conflicts.push({
          dayOfWeek: m.dayOfWeek,
          mealType: m.mealType,
          mealTitle: m.customTitle,
          matchedAllergen: tag,
        });
      }
    });
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (conflicts.length > 0) {
    return (
      <div className="rounded-xl bg-red-50 border-2 border-red-300 p-4 text-xs text-red-950 space-y-2 animate-in fade-in">
        <div className="flex items-center gap-2 font-bold text-red-800 text-sm">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <span>ALLERGEN SAFETY ALERT: {conflicts.length} conflict(s) detected!</span>
        </div>
        <p className="leading-relaxed">
          The member has declared allergies to:{' '}
          <strong className="text-red-900 underline">{memberAllergies.join(', ')}</strong>.
          The following planned meals contain ingredients that match their allergy tags:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-red-900 font-medium">
          {conflicts.map((c, i) => (
            <li key={i}>
              <strong>{dayNames[c.dayOfWeek]} {c.mealType.replace('_', ' ')}:</strong> &ldquo;{c.mealTitle}&rdquo; contains <strong>{c.matchedAllergen}</strong>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-red-700 italic">
          Please replace these meal slots or edit portions to eliminate allergen ingredients before publishing.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
      <ShieldCheck className="h-4 w-4 text-[#2FAF37] shrink-0" />
      <span>
        Allergen check passed! None of the 7-day meals contain the member&apos;s declared allergens ({memberAllergies.join(', ')}).
      </span>
    </div>
  );
}
