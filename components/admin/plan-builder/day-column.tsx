'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2, Library, AlertCircle } from 'lucide-react';
import type { PlanMealSlot } from '@/features/diet-plans/plan-builder-store';

interface DayColumnProps {
  dayName: string;
  dayOfWeek: number;
  meals: PlanMealSlot[];
  onUpdateMeal: (slotId: string, updates: Partial<PlanMealSlot>) => void;
  onDeleteMeal: (slotId: string) => void;
  onAddMeal: (dayOfWeek: number) => void;
  onOpenPicker: (slotId: string, mealType: string) => void;
  memberAllergies: string[];
}

export function DayColumn({
  dayName,
  dayOfWeek,
  meals,
  onUpdateMeal,
  onDeleteMeal,
  onAddMeal,
  onOpenPicker,
  memberAllergies,
}: DayColumnProps) {
  const sortedMeals = [...meals].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h3 className="font-bold text-base text-[#1A2E1C]">{dayName}</h3>
        <span className="text-xs text-gray-400 font-medium">{meals.length} meals</span>
      </div>

      <div className="space-y-3">
        {sortedMeals.map((slot) => {
          // Check if this slot contains an allergy conflict
          const hasAllergyConflict = slot.allergenTags.some((tag) =>
            memberAllergies.some((a) => a.toLowerCase().includes(tag.toLowerCase()))
          );

          return (
            <Card
              key={slot.id}
              className={`border transition-all shadow-xs ${
                hasAllergyConflict
                  ? 'border-red-300 bg-red-50/30'
                  : 'border-gray-200 bg-white hover:border-emerald-200'
              }`}
            >
              <CardHeader className="p-3 pb-2 border-b border-gray-100 flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200">
                    {slot.mealType.replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                    <Clock className="h-3 w-3 text-emerald-700" />
                    <input
                      type="text"
                      value={slot.scheduledTime}
                      onChange={(e) => onUpdateMeal(slot.id, { scheduledTime: e.target.value })}
                      placeholder="08:30"
                      className="w-14 rounded border border-gray-200 px-1 py-0.5 text-center text-[11px] font-mono focus:border-[#075B2B]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onDeleteMeal(slot.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Remove slot"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-3 space-y-2 text-xs">
                {hasAllergyConflict && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-100/60 p-1.5 rounded">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Contains member allergen: {slot.allergenTags.join(', ')}</span>
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                    Meal Name
                  </label>
                  <input
                    type="text"
                    value={slot.customTitle}
                    onChange={(e) => onUpdateMeal(slot.id, { customTitle: e.target.value })}
                    placeholder="Meal description"
                    className="w-full rounded border border-gray-200 p-1.5 text-xs font-semibold text-gray-800 focus:border-[#075B2B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                    Portion (Household Measures)
                  </label>
                  <input
                    type="text"
                    value={slot.customPortion}
                    onChange={(e) => onUpdateMeal(slot.id, { customPortion: e.target.value })}
                    placeholder="e.g. 1 katori dal + 2 roti"
                    className="w-full rounded border border-gray-200 p-1.5 text-xs text-gray-700 focus:border-[#075B2B]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                    Instructions / Notes
                  </label>
                  <input
                    type="text"
                    value={slot.customNotes || ''}
                    onChange={(e) => onUpdateMeal(slot.id, { customNotes: e.target.value })}
                    placeholder="e.g. Pair with warm water"
                    className="w-full rounded border border-gray-200 p-1.5 text-[11px] text-gray-500 focus:border-[#075B2B]"
                  />
                </div>

                {slot.customAlternatives.length > 0 && (
                  <div className="pt-1 text-[11px] text-gray-500 border-t border-gray-50">
                    <span className="font-semibold text-emerald-800">Approved Swap: </span>
                    <span>{slot.customAlternatives[0]?.title}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAddMeal(dayOfWeek)}
          className="w-full border-dashed border-emerald-200 text-[#075B2B] hover:bg-emerald-50/50 text-xs py-2 h-auto"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add Meal Slot to {dayName}
        </Button>
      </div>
    </div>
  );
}
