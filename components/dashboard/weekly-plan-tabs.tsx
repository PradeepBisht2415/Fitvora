'use client';

import React, { useState } from 'react';
import { MealCard } from './meal-card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type { DietPlanMeal } from '@/types/database.types';

interface WeeklyPlanTabsProps {
  meals: DietPlanMeal[];
}

const DAYS = [
  { dayOfWeek: 1, name: 'Monday' },
  { dayOfWeek: 2, name: 'Tuesday' },
  { dayOfWeek: 3, name: 'Wednesday' },
  { dayOfWeek: 4, name: 'Thursday' },
  { dayOfWeek: 5, name: 'Friday' },
  { dayOfWeek: 6, name: 'Saturday' },
  { dayOfWeek: 0, name: 'Sunday' },
];

export function WeeklyPlanTabs({ meals }: WeeklyPlanTabsProps) {
  const currentDay = new Date().getDay();
  const [activeDay, setActiveDay] = useState<number>(currentDay);

  const activeMeals = meals
    .filter((m) => m.day_of_week === activeDay)
    .sort((a, b) => a.order_index - b.order_index);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Top Day Switcher Bar & Print Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        {/* Day Tabs */}
        <div className="flex overflow-x-auto gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex-1">
          {DAYS.map(({ dayOfWeek, name }) => {
            const isActive = activeDay === dayOfWeek;
            const isToday = currentDay === dayOfWeek;
            const count = meals.filter((m) => m.day_of_week === dayOfWeek).length;

            return (
              <button
                key={dayOfWeek}
                type="button"
                onClick={() => setActiveDay(dayOfWeek)}
                className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-lg text-center transition-all ${
                  isActive
                    ? 'bg-[#075B2B] text-white font-bold shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100 font-medium'
                }`}
              >
                <div className="text-xs flex items-center justify-center gap-1">
                  <span>{name}</span>
                  {isToday && (
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-amber-300' : 'bg-[#075B2B]'}`} />
                  )}
                </div>
                <div className={`text-[10px] ${isActive ? 'text-emerald-100' : 'text-gray-400'}`}>
                  {count} meals
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
      <div className="border-b border-gray-200 pb-2 print:border-b-2 print:border-black">
        <h3 className="text-lg font-bold text-[#1A2E1C]">
          {DAYS.find((d) => d.dayOfWeek === activeDay)?.name}&apos;s Meal Schedule
        </h3>
        <p className="text-xs text-gray-500">
          Tailored portions in Indian household measures (katori, roti)
        </p>
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
