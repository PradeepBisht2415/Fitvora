'use client';

import React, { useState } from 'react';
import { MealCard } from './meal-card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type { DietPlanMeal } from '@/types/database.types';

interface WeeklyPlanTabsProps {
  meals: DietPlanMeal[];
  effectiveStartDate?: string | null;
  publishedAt?: string | null;
}

const DAYS_ORDER = [
  { dayIndex: 1, dayOfWeek: 1, defaultName: 'Monday' },
  { dayIndex: 2, dayOfWeek: 2, defaultName: 'Tuesday' },
  { dayIndex: 3, dayOfWeek: 3, defaultName: 'Wednesday' },
  { dayIndex: 4, dayOfWeek: 4, defaultName: 'Thursday' },
  { dayIndex: 5, dayOfWeek: 5, defaultName: 'Friday' },
  { dayIndex: 6, dayOfWeek: 6, defaultName: 'Saturday' },
  { dayIndex: 7, dayOfWeek: 0, defaultName: 'Sunday' },
];

export function WeeklyPlanTabs({ meals, effectiveStartDate, publishedAt }: WeeklyPlanTabsProps) {
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let startDate: Date;
  if (effectiveStartDate) {
    const parts = effectiveStartDate.split('-').map(Number);
    startDate = new Date(parts[0]!, parts[1]! - 1, parts[2]!);
  } else if (publishedAt) {
    const applied = new Date(publishedAt);
    startDate = new Date(applied.getFullYear(), applied.getMonth(), applied.getDate() + 1);
  } else {
    startDate = todayDate;
  }
  startDate.setHours(0, 0, 0, 0);

  const isBeforeStart = todayDate.getTime() < startDate.getTime();
  let currentPlanDay = 1;

  if (!isBeforeStart) {
    const diffMs = todayDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    currentPlanDay = (diffDays % 7) + 1; // 1 to 7
  }

  const defaultActiveDayOfWeek = currentPlanDay === 7 ? 0 : currentPlanDay;
  const [activeDay, setActiveDay] = useState<number>(defaultActiveDayOfWeek);

  const activeMeals = meals
    .filter((m) => m.day_of_week === activeDay)
    .sort((a, b) => a.order_index - b.order_index);

  const handlePrint = () => {
    window.print();
  };

  const activeDayInfo = DAYS_ORDER.find((d) => d.dayOfWeek === activeDay) || DAYS_ORDER[0]!;

  return (
    <div className="space-y-5">
      {/* Top Day Switcher Bar & Print Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        {/* Day Tabs */}
        <div className="flex overflow-x-auto gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex-1">
          {DAYS_ORDER.map(({ dayIndex, dayOfWeek, defaultName }) => {
            const isActive = activeDay === dayOfWeek;
            const isToday = !isBeforeStart && currentPlanDay === dayIndex;
            const isStartsTomorrow = isBeforeStart && dayIndex === 1;
            const count = meals.filter((m) => m.day_of_week === dayOfWeek).length;

            // Calculate date for this day
            const dayCalendarDate = new Date(startDate);
            dayCalendarDate.setDate(dayCalendarDate.getDate() + (dayIndex - 1));
            const formattedDate = dayCalendarDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            });
            const weekdayShort = dayCalendarDate.toLocaleDateString('en-IN', {
              weekday: 'short',
            });

            return (
              <button
                key={dayOfWeek}
                type="button"
                onClick={() => setActiveDay(dayOfWeek)}
                className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-lg text-center transition-all ${
                  isActive
                    ? 'bg-[#075B2B] text-white font-bold shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100 font-medium'
                }`}
              >
                <div className="text-xs flex items-center justify-center gap-1">
                  <span>Day {dayIndex}</span>
                  {isToday && (
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-amber-300' : 'bg-[#075B2B]'}`} title="Today" />
                  )}
                  {isStartsTomorrow && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Starts Tomorrow" />
                  )}
                </div>
                <div className={`text-[10px] ${isActive ? 'text-emerald-100' : 'text-gray-400'}`}>
                  {weekdayShort}, {formattedDate} • {count}m
                </div>
              </button>
            );
          })}
        </div>

        {/* Print / Save as PDF Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handlePrint}
          className="border-gray-200 text-xs text-gray-700 hover:bg-gray-50 h-10 shrink-0"
        >
          <Printer className="mr-1.5 h-3.5 w-3.5" />
          Print / PDF
        </Button>
      </div>

      {/* Active Day Header */}
      <div className="border-b border-gray-200 pb-2 print:border-b-2 print:border-black flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#1A2E1C]">
            Day {activeDayInfo.dayIndex} Meal Schedule ({activeDayInfo.defaultName})
          </h3>
          <p className="text-xs text-gray-500">
            Tailored portions in Indian household measures (katori, roti). Swaps available for every meal.
          </p>
        </div>
        {(!isBeforeStart && currentPlanDay === activeDayInfo.dayIndex) && (
          <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5">
            Today
          </span>
        )}
        {(isBeforeStart && activeDayInfo.dayIndex === 1) && (
          <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5">
            Starts Tomorrow
          </span>
        )}
      </div>

      {/* Meals Grid */}
      {activeMeals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center text-xs text-gray-400 italic">
          No meals recorded for this day.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
}
