'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlternativeSwapModal } from './alternative-swap-modal';
import { Clock, RefreshCw, Sparkles } from 'lucide-react';
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

  return (
    <>
      <Card
        className={`bg-white border transition-all shadow-xs ${
          isNext
            ? 'border-[#075B2B] ring-2 ring-[#075B2B]/20 shadow-sm'
            : 'border-gray-200 hover:border-emerald-200'
        }`}
      >
        <CardHeader className="p-4 pb-3 border-b border-gray-100 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="capitalize text-[10px] font-semibold border-emerald-200 bg-emerald-50 text-emerald-800"
            >
              {meal.meal_type.replace('_', ' ')}
            </Badge>

            <div className="flex items-center gap-1 text-xs font-mono font-bold text-gray-700">
              <Clock className="h-3.5 w-3.5 text-[#075B2B]" />
              <span>{meal.scheduled_time}</span>
            </div>
          </div>

          {isNext && (
            <Badge className="bg-[#075B2B] text-white text-[10px] font-bold uppercase tracking-wider">
              Upcoming Next
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-4 space-y-3 text-xs">
          <div>
            <CardTitle className="text-base font-bold text-[#1A2E1C]">
              {meal.custom_title}
            </CardTitle>
            <div className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[#EAF8E7]/50 px-2.5 py-1 text-xs text-emerald-900 font-semibold border border-emerald-100">
              <span>Portion: {meal.custom_portion}</span>
            </div>
          </div>

          {meal.custom_notes && (
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
