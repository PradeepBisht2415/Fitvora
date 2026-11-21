'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlternativeSwapModal } from './alternative-swap-modal';
import { Clock, RefreshCw, Sparkles } from 'lucide-react';
import { formatMealTime } from '@/lib/utils/diet-formatters';
import type { DietPlanMeal } from '@/types/database.types';

interface MealCardProps {
  meal: DietPlanMeal;
  isNext?: boolean;
}

export function MealCard({ meal, isNext }: MealCardProps) {
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  const alternatives = Array.isArray(meal.custom_alternatives)
    ? (meal.custom_alternatives as { title: string; portion: string }[])
    : [];

  // Defensive clean title: strip leading bullets/bullets with times, or fallback if title looks like a time
  let displayTitle = (meal.custom_title || '').replace(/^[·•–—\s*]+/, '').trim();
  if (!displayTitle || /^\d{1,2}:\d{2}/.test(displayTitle)) {
    displayTitle = meal.meal_type
      ? meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1).replace('_', ' ')
      : 'Meal';
  }

  // Guard against isolated numbers or summary values mistakenly stored as portions
  let displayPortion = (meal.custom_portion || 'Standard household portion').trim();
  if (/^\d{3,4}$/.test(displayPortion)) {
    displayPortion = 'Standard household portion';
  }

  // If title is just generic meal type (e.g. "Dinner", "Breakfast") and portion has real dish items, derive dish name
  const genericTypes = ['breakfast', 'lunch', 'dinner', 'evening_snack', 'morning_snack', 'post_dinner', 'meal'];
  if (genericTypes.includes(displayTitle.toLowerCase().trim())) {
    if (meal.custom_portion && meal.custom_portion.length > 5 && !/^\d+$/.test(meal.custom_portion)) {
      let firstPart = meal.custom_portion.split(/;|\(/)[0]!.trim();
      firstPart = firstPart.replace(/^\d+\s+/, '').replace(/\s*\d+\s*(?:g|gm|ml|raw|cooked).*$/i, '').trim();
      if (meal.custom_portion.toLowerCase().includes('cooked rice') && !firstPart.toLowerCase().includes('rice')) {
        firstPart += ' with Rice';
      } else if (meal.custom_portion.toLowerCase().includes('moong dal') && !firstPart.toLowerCase().includes('dal')) {
        firstPart += ' & Dal';
      }
      if (firstPart.length >= 3) {
        displayTitle = firstPart.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }
  }

  return (
    <>
      <Card className="bg-white border border-gray-200 hover:border-emerald-200 transition-all shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-gray-100 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="capitalize text-[10px] font-semibold border-emerald-200 bg-emerald-50 text-emerald-800"
            >
              {meal.custom_notes && /^meal\s*\d/i.test(meal.custom_notes)
                ? meal.custom_notes.match(/^meal\s*\d/i)?.[0]
                : meal.meal_type.replace('_', ' ')}
            </Badge>

            <div className="flex items-center gap-1 text-xs font-mono font-bold text-gray-700">
              <Clock className="h-3.5 w-3.5 text-[#075B2B]" />
              <span>{formatMealTime(meal.scheduled_time)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3 text-xs">
          <div>
            <CardTitle className="text-base font-bold text-[#1A2E1C] leading-snug">
              {displayTitle}
            </CardTitle>
            <div className="mt-2 rounded-lg bg-[#EAF8E7]/60 px-3 py-2 text-xs text-emerald-950 border border-emerald-200/60 leading-relaxed font-normal">
              <span className="font-semibold text-[#075B2B]">Portion: </span>
              <span>{displayPortion}</span>
            </div>
          </div>

          {meal.custom_notes && !/^meal\s*\d+$/i.test(meal.custom_notes.trim()) && (
            <p className="text-gray-600 text-[11px] leading-relaxed flex items-start gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#2FAF37] shrink-0 mt-0.5" />
              <span>{meal.custom_notes}</span>
            </p>
          )}

          {alternatives.length > 0 && (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                {alternatives.length} approved swap{alternatives.length > 1 ? 's' : ''} available
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSwapModalOpen(true)}
                className="h-7 px-2.5 text-xs border-emerald-200 text-[#075B2B] hover:bg-emerald-50"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                View Swaps
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlternativeSwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        baseMealTitle={meal.custom_title || 'Meal'}
        basePortion={meal.custom_portion}
        alternatives={alternatives}
      />
    </>
  );
}
