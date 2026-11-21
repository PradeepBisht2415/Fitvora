import * as React from 'react';
import { type RoutineData } from '@/lib/validation/assessment-schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sun, Moon, Clock, Sparkles } from 'lucide-react';
import { formatTime12 } from '@/lib/utils';

interface StepRoutineProps {
  data: RoutineData;
  onChange: (data: Partial<RoutineData>) => void;
  errors?: Record<string, string>;
}

const WAKE_PRESETS = [
  { label: '6:00 AM', value: '06:00' },
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '4:00 PM (Night Shift)', value: '16:00' },
];

const SLEEP_PRESETS = [
  { label: '10:00 PM', value: '22:00' },
  { label: '11:00 PM', value: '23:00' },
  { label: '12:00 AM', value: '00:00' },
  { label: '8:00 AM (Night Shift)', value: '08:00' },
];

export function StepRoutine({ data, onChange, errors = {} }: StepRoutineProps) {
  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-forest-green">Daily Routine & Schedule</CardTitle>
        <CardDescription>
          Diets work best when meals fit your natural body clock and work hours—including night shifts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Circadian Guidance Notice */}
        <div className="rounded-xl bg-[#EAF8E7]/70 border border-emerald-200/60 p-3.5 flex items-start gap-2.5 text-xs text-[#075B2B]">
          <Sparkles className="h-4 w-4 shrink-0 text-[#2FAF37] mt-0.5" />
          <p className="leading-relaxed">
            <strong>Circadian Meal Timing:</strong> Your customized breakfast, lunch, snacks, and dinner hours will be calculated directly around your exact wake up and sleep times to prevent energy slumps and late-night snacking.
          </p>
        </div>

        {/* Wake and Sleep Times */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Wake Up Time */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-dark-text flex items-center gap-1.5" htmlFor="wake_time">
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Wake Up Time</span> <span className="text-destructive">*</span>
              </label>
              {data.wake_time && (
                <span className="text-xs font-extrabold text-[#075B2B] bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  {formatTime12(data.wake_time)}
                </span>
              )}
            </div>
            <Input
              id="wake_time"
              type="time"
              value={data.wake_time}
              onChange={(e) => onChange({ wake_time: e.target.value })}
              className={`bg-white ${errors['wake_time'] ? 'border-destructive' : ''}`}
            />
            {errors['wake_time'] && (
              <p className="text-xs text-destructive">{errors['wake_time']}</p>
            )}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                Quick Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {WAKE_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => onChange({ wake_time: p.value })}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      data.wake_time === p.value
                        ? 'bg-[#075B2B] text-white shadow-2xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sleep Time */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-dark-text flex items-center gap-1.5" htmlFor="sleep_time">
                <Moon className="h-4 w-4 text-indigo-500" />
                <span>Sleep Time (Bedtime)</span> <span className="text-destructive">*</span>
              </label>
              {data.sleep_time && (
                <span className="text-xs font-extrabold text-[#075B2B] bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  {formatTime12(data.sleep_time)}
                </span>
              )}
            </div>
            <Input
              id="sleep_time"
              type="time"
              value={data.sleep_time}
              onChange={(e) => onChange({ sleep_time: e.target.value })}
              className={`bg-white ${errors['sleep_time'] ? 'border-destructive' : ''}`}
            />
            {errors['sleep_time'] && (
              <p className="text-xs text-destructive">{errors['sleep_time']}</p>
            )}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
                Quick Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SLEEP_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => onChange({ sleep_time: p.value })}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      data.sleep_time === p.value
                        ? 'bg-[#075B2B] text-white shadow-2xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Work Shift Type */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-dark-text">
            Work Schedule <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { id: 'standard_day', label: 'Day Shift', desc: 'Standard 9 AM to 6 PM' },
              { id: 'overnight_shift', label: 'Night / Graveyard', desc: 'Meals cross midnight' },
              { id: 'rotating', label: 'Rotating Shifts', desc: 'Changes week to week' },
              { id: 'flexible', label: 'Flexible / WFH', desc: 'Self-paced schedule' },
            ].map((shift) => (
              <button
                key={shift.id}
                type="button"
                onClick={() =>
                  onChange({ work_shift: shift.id as RoutineData['work_shift'] })
                }
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  data.work_shift === shift.id
                    ? 'border-forest-green bg-pale-green text-forest-green shadow-sm ring-1 ring-forest-green'
                    : 'border-border-soft bg-white text-dark-text hover:bg-pale-green/20'
                }`}
              >
                <span className="font-bold text-xs">{shift.label}</span>
                <span className="text-[10px] text-muted-text mt-0.5">{shift.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Meal Frequency */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-dark-text">
            Preferred Number of Daily Meals <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { id: '2_meals', label: '2 Meals', desc: 'e.g. Brunch + Dinner' },
              { id: '3_meals', label: '3 Meals', desc: 'Breakfast, Lunch, Dinner' },
              { id: '4_meals', label: '4 Meals', desc: '3 Meals + Evening Chai Snack' },
              { id: '5_plus_meals', label: '5+ Small Meals', desc: 'Frequent smaller portions' },
            ].map((freq) => (
              <button
                key={freq.id}
                type="button"
                onClick={() =>
                  onChange({ meal_frequency: freq.id as RoutineData['meal_frequency'] })
                }
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  data.meal_frequency === freq.id
                    ? 'border-forest-green bg-pale-green text-forest-green shadow-sm ring-1 ring-forest-green'
                    : 'border-border-soft bg-white text-dark-text hover:bg-pale-green/20'
                }`}
              >
                <span className="font-bold text-xs">{freq.label}</span>
                <span className="text-[10px] text-muted-text mt-0.5">{freq.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-dark-text">
            Daily Physical Activity Level <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              {
                id: 'sedentary',
                title: 'Sedentary',
                desc: 'Desk job, mostly sitting, under 4,000 steps/day',
              },
              {
                id: 'lightly_active',
                title: 'Lightly Active',
                desc: 'Occasional walks, household chores, 4,000–7,000 steps/day',
              },
              {
                id: 'moderately_active',
                title: 'Moderately Active',
                desc: 'Regular workout 3-4x/week or 8,000–10,000 steps/day',
              },
              {
                id: 'very_active',
                title: 'Very Active',
                desc: 'Heavy manual labor, sports training, intense daily exercise',
              },
            ].map((activity) => (
              <button
                key={activity.id}
                type="button"
                onClick={() =>
                  onChange({
                    activity_level: activity.id as RoutineData['activity_level'],
                  })
                }
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  data.activity_level === activity.id
                    ? 'border-forest-green bg-pale-green text-forest-green shadow-sm ring-1 ring-forest-green'
                    : 'border-border-soft bg-white text-dark-text hover:bg-pale-green/20'
                }`}
              >
                <div className="font-bold text-xs text-forest-green">{activity.title}</div>
                <div className="text-[11px] text-muted-text mt-0.5">{activity.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
