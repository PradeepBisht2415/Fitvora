import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, MessageCircle, AlertTriangle, HeartPulse } from 'lucide-react';
import type { Assessment } from '@/types/database.types';

interface PreferencesViewProps {
  assessment?: Assessment | null;
}

export function PreferencesView({ assessment }: PreferencesViewProps) {
  if (!assessment) {
    return (
      <Card className="bg-white border-gray-200 shadow-xs">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-[#1A2E1C]">Dietary Baseline</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Intake preferences and verified screening records
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 text-xs text-gray-500 italic">
          No assessment record linked to your profile.
        </CardContent>
      </Card>
    );
  }

  const foodPrefs = (assessment.food_preferences || {}) as {
    diet_type?: string;
    allergies?: string[];
    dislikes?: string[];
    regional_preference?: string;
    cooking_access?: string;
  };

  const healthScreening = (assessment.health_screening || {}) as {
    conditions?: string[];
    is_pregnant_or_nursing?: boolean;
    medications?: string;
    eating_disorder_history?: boolean;
  };

  const routine = (assessment.routine_data || {}) as {
    wake_time?: string;
    sleep_time?: string;
    work_shift?: string;
    meal_frequency?: string;
    activity_level?: string;
  };

  const allergies = foodPrefs.allergies || [];
  const conditions = healthScreening.conditions || [];

  return (
    <Card className="bg-white border-emerald-100 shadow-xs space-y-4">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#075B2B]">
              <Lock className="h-3.5 w-3.5" />
              <span>Verified Assessment Records</span>
            </div>
            <CardTitle className="text-base font-bold text-[#1A2E1C] mt-0.5">
              Food Preferences & Safety Baseline
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Locked to ensure founder review before modifying allergen safety limits
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] uppercase font-bold">
            {assessment.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1 text-xs">
        {/* Goal and Diet Category */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Goal</span>
            <p className="font-bold text-[#1A2E1C] capitalize mt-0.5">
              {assessment.target_direction?.replace('_', ' ')}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Diet Type</span>
            <p className="font-bold text-[#1A2E1C] capitalize mt-0.5">
              {foodPrefs.diet_type || 'Vegetarian'}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Height & Weight</span>
            <p className="font-bold text-[#1A2E1C] mt-0.5">
              {assessment.height_cm} cm • {assessment.weight_kg} kg
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Regional Taste</span>
            <p className="font-bold text-[#1A2E1C] capitalize mt-0.5">
              {foodPrefs.regional_preference?.replace('_', ' ') || 'Pan-Indian'}
            </p>
          </div>
        </div>

        {/* Disclosed Allergies */}
        <div className="space-y-1.5">
          <span className="font-bold text-gray-700 block">Declared Food Allergies</span>
          {allergies.length === 0 ? (
            <p className="text-gray-500 italic">Zero declared food allergies.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {allergies.map((allg) => (
                <span
                  key={allg}
                  className="rounded-lg bg-red-50 border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 flex items-center gap-1"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {allg}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Routine Schedule */}
        <div className="space-y-1.5 border-t border-gray-100 pt-3">
          <span className="font-bold text-gray-700 block">Daily Living Routine</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-gray-600">
            <div>
              <span className="text-gray-400">Wake / Sleep:</span>{' '}
              <strong>{routine.wake_time || '07:00'} - {routine.sleep_time || '23:00'}</strong>
            </div>
            <div>
              <span className="text-gray-400">Work Shift:</span>{' '}
              <strong className="capitalize">{routine.work_shift?.replace('_', ' ') || 'Standard Day'}</strong>
            </div>
            <div>
              <span className="text-gray-400">Activity Level:</span>{' '}
              <strong className="capitalize">{routine.activity_level?.replace('_', ' ') || 'Lightly Active'}</strong>
            </div>
          </div>
        </div>

        {/* Health Conditions */}
        {conditions.length > 0 && (
          <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3 space-y-1 text-amber-900">
            <span className="font-bold flex items-center gap-1">
              <HeartPulse className="h-4 w-4 text-amber-600" />
              Noted Health Flags:
            </span>
            <p className="text-[11px]">{conditions.join(', ')}</p>
          </div>
        )}

        {/* Request Change CTA */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <p className="font-bold text-gray-800">Need to update allergies or diet type?</p>
            <p className="text-[11px] text-gray-500">
              For your safety, dietary changes require a brief review by the founder before diet plans update.
            </p>
          </div>
          <a href="mailto:support@fitvora.com?subject=Request%20Dietary%20Preference%20Update">
            <Button variant="outline" size="sm" className="border-emerald-200 text-[#075B2B] text-xs h-8 shrink-0">
              <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
              Request Preference Update
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
