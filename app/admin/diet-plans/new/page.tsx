'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminNav } from '@/components/admin/admin-nav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AllergenBanner } from '@/components/admin/plan-builder/allergen-banner';
import { DayColumn } from '@/components/admin/plan-builder/day-column';
import { MealPickerModal } from '@/components/admin/plan-builder/meal-picker-modal';
import {
  DAYS_OF_WEEK,
  createInitial7DaySchedule,
  type PlanMealSlot,
} from '@/features/diet-plans/plan-builder-store';
import { saveDietPlanAction } from '@/features/diet-plans/publish-plan-action';
import { ArrowLeft, Save, Send, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import type { MealTemplate } from '@/types/database.types';

function PlanBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  const [activeDayOfWeek, setActiveDayOfWeek] = useState<number>(1); // Monday default
  const [meals, setMeals] = useState<PlanMealSlot[]>(() => createInitial7DaySchedule());
  const [guidanceNotes, setGuidanceNotes] = useState(
    'Drink 2.5–3 liters of water throughout the day. Finish dinner at least 2 hours before sleeping. Feel free to use the swap alternatives if any ingredient is unavailable.'
  );

  const [memberInfo, setMemberInfo] = useState<{
    name: string;
    email: string;
    allergies: string[];
    targetDirection: string;
    dietType: string;
  }>({
    name: 'Member',
    email: '',
    allergies: [],
    targetDirection: 'Weight Management',
    dietType: 'Vegetarian',
  });

  const [pickerSlotId, setPickerSlotId] = useState<string | null>(null);
  const [pickerMealType, setPickerMealType] = useState<string | undefined>(undefined);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    fetch(`/api/admin/members/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.profile) {
          const assessment = data.assessment;
          const allergies: string[] = assessment?.food_preferences?.allergies || [];
          const dietType = assessment?.food_preferences?.diet_type || 'Vegetarian';
          const direction = assessment?.target_direction?.replace('_', ' ') || 'Weight Management';

          setMemberInfo({
            name: `${data.profile.first_name} ${data.profile.last_name || ''}`.trim(),
            email: data.profile.email,
            allergies,
            targetDirection: direction,
            dietType,
          });
        }
      })
      .catch((err) => console.error('Failed to load member profile:', err));

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const activeDayMeals = useMemo(() => {
    return meals.filter((m) => m.dayOfWeek === activeDayOfWeek);
  }, [meals, activeDayOfWeek]);

  const handleUpdateMeal = (slotId: string, updates: Partial<PlanMealSlot>) => {
    setMeals((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, ...updates } : slot))
    );
  };

  const handleDeleteMeal = (slotId: string) => {
    setMeals((prev) => prev.filter((slot) => slot.id !== slotId));
  };

  const handleAddMeal = (dayOfWeek: number) => {
    const newSlot: PlanMealSlot = {
      id: `slot_${dayOfWeek}_${Date.now()}`,
      dayOfWeek,
      mealType: 'evening_snack',
      scheduledTime: '16:00',
      customTitle: 'Roasted Makhana with Green Tea',
      customPortion: '1 bowl makhana + 1 cup unsweetened tea',
      customNotes: 'Light mid-day nourishment',
      customAlternatives: [],
      allergenTags: [],
      orderIndex: meals.filter((m) => m.dayOfWeek === dayOfWeek).length,
    };
    setMeals((prev) => [...prev, newSlot]);
  };

  const handleOpenPicker = (slotId: string, mealType: string) => {
    setPickerSlotId(slotId);
    setPickerMealType(mealType);
    setIsPickerOpen(true);
  };

  const handleSelectTemplate = (template: MealTemplate) => {
    if (!pickerSlotId) return;

    setMeals((prev) =>
      prev.map((slot) => {
        if (slot.id === pickerSlotId) {
          const alts = Array.isArray(template.alternatives)
            ? (template.alternatives as { title: string; portion: string }[])
            : [];

          return {
            ...slot,
            mealTemplateId: template.id,
            customTitle: template.title,
            customPortion: template.default_portion,
            customNotes: template.preparation_notes || '',
            customAlternatives: alts,
            allergenTags: template.allergen_tags || [],
            approxCalories: template.approx_calories,
            approxProteinG: template.approx_protein_g,
          };
        }
        return slot;
      })
    );
  };

  const handleSaveOrPublish = async (status: 'draft' | 'published') => {
    if (!userId) {
      setErrorMsg('No user selected for this plan.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await saveDietPlanAction({
      userId,
      guidanceNotes,
      meals,
      status,
    });

    setSaving(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save diet plan');
    } else {
      setSuccessMsg(
        status === 'published'
          ? 'Diet plan published! Member will immediately see this on their dashboard.'
          : 'Diet plan saved as draft.'
      );
      if (status === 'published') {
        setTimeout(() => {
          router.push(`/admin/members/${userId}`);
        }, 1500);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={userId ? `/admin/members/${userId}` : '/admin/members'}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A2E1C]">
                7-Day Diet Plan Builder
              </h1>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] uppercase font-bold">
                {memberInfo.dietType}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Member: <strong className="text-gray-700">{memberInfo.name}</strong> • Goal: <span className="capitalize">{memberInfo.targetDirection}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => handleSaveOrPublish('draft')}
            className="border-gray-300 text-gray-700 text-xs h-9"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Save Draft
          </Button>

          <Button
            type="button"
            disabled={saving}
            onClick={() => handleSaveOrPublish('published')}
            className="bg-[#075B2B] text-white hover:bg-[#075B2B]/90 font-semibold text-xs h-9 shadow-xs"
          >
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Publish Plan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#2FAF37] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Automated Allergen Safety Banner */}
      <AllergenBanner memberAllergies={memberInfo.allergies} meals={meals} />

      {/* 7-Day Navigation Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-1 bg-white p-1 rounded-xl shadow-xs">
        {DAYS_OF_WEEK.map(({ dayOfWeek, name }) => {
          const isActive = activeDayOfWeek === dayOfWeek;
          const count = meals.filter((m) => m.dayOfWeek === dayOfWeek).length;

          return (
            <button
              key={dayOfWeek}
              type="button"
              onClick={() => setActiveDayOfWeek(dayOfWeek)}
              className={`flex-1 min-w-[95px] py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center ${
                isActive
                  ? 'bg-[#075B2B] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div>{name}</div>
              <div className={`text-[10px] font-normal ${isActive ? 'text-emerald-100' : 'text-gray-400'}`}>
                {count} meals
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Day Content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
        <DayColumn
          dayName={DAYS_OF_WEEK.find((d) => d.dayOfWeek === activeDayOfWeek)?.name || 'Day'}
          dayOfWeek={activeDayOfWeek}
          meals={activeDayMeals}
          onUpdateMeal={handleUpdateMeal}
          onDeleteMeal={handleDeleteMeal}
          onAddMeal={handleAddMeal}
          onOpenPicker={handleOpenPicker}
          memberAllergies={memberInfo.allergies}
        />
      </div>

      {/* General Founder Guidance Notes */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs space-y-2">
        <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-[#075B2B]" />
          Founder Guidance & Hydration Notes (Visible to Member)
        </label>
        <textarea
          rows={3}
          value={guidanceNotes}
          onChange={(e) => setGuidanceNotes(e.target.value)}
          placeholder="Enter weekly lifestyle guidance, step count recommendation, and hydration notes..."
          className="w-full rounded-lg border border-gray-200 p-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#075B2B]"
        />
      </div>

      {/* Meal Template Library Picker Modal */}
      <MealPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectTemplate}
        targetMealType={pickerMealType}
      />
    </div>
  );
}

export default function NewDietPlanPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075B2B] mx-auto"></div>
              <p className="mt-2 text-xs text-gray-500">Loading diet plan builder...</p>
            </div>
          }
        >
          <PlanBuilderContent />
        </Suspense>
      </main>
    </div>
  );
}
