'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { submitCheckIn } from '@/features/checkins/checkin-actions';
import { ClipboardCheck, Loader2 } from 'lucide-react';

interface CheckInFormProps {
  onSuccess: () => void;
}

export function CheckInForm({ onSuccess }: CheckInFormProps) {
  const [adherence, setAdherence] = useState(4);
  const [energy, setEnergy] = useState(4);
  const [appetiteNotes, setAppetiteNotes] = useState('');
  const [challenges, setChallenges] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adherenceLabels: Record<number, string> = {
    1: '1 - Major disruptions / Off track',
    2: '2 - Struggled with portion / meal timing',
    3: '3 - Mostly followed with 1-2 swaps/treats',
    4: '4 - Very solid adherence (80–90%)',
    5: '5 - Followed plan 100% exactly',
  };

  const energyLabels: Record<number, string> = {
    1: '1 - Low / Tired / Poor sleep',
    2: '2 - Sluggish afternoon dips',
    3: '3 - Steady & balanced throughout day',
    4: '4 - Good energy & alert focus',
    5: '5 - Excellent energy & refreshed sleep',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const w = weightKg ? parseFloat(weightKg) : undefined;
    if (w !== undefined && (isNaN(w) || w < 30 || w > 300)) {
      setError('Please enter a valid weight between 30 and 300 kg.');
      setLoading(false);
      return;
    }

    try {
      const res = await submitCheckIn({
        adherence_rating: adherence,
        energy_level: energy,
        appetite_notes: appetiteNotes.trim() || undefined,
        challenges_text: challenges.trim() || undefined,
        current_weight_kg: w,
      });

      if (!res.success) {
        setError(res.error || 'Failed to submit check-in');
      } else {
        onSuccess();
      }
    } catch {
      setError('An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-[#075B2B]">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#1A2E1C]">Weekly Structured Check-In</h3>
          <p className="text-xs text-gray-500">
            Submit your weekly experience for personalized founder review and adjustments.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating 1: Meal Plan Adherence */}
        <div>
          <label className="block text-xs font-bold text-[#1A2E1C] mb-1">
            1. Meal Plan Adherence this past week *
          </label>
          <p className="text-[11px] text-gray-500 mb-2">
            Selected: <span className="font-semibold text-[#075B2B]">{adherenceLabels[adherence]}</span>
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setAdherence(lvl)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  adherence === lvl
                    ? 'border-[#075B2B] bg-[#075B2B] text-white shadow-xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Rating 2: Energy & Sleep */}
        <div>
          <label className="block text-xs font-bold text-[#1A2E1C] mb-1">
            2. Energy &amp; Sleep Quality *
          </label>
          <p className="text-[11px] text-gray-500 mb-2">
            Selected: <span className="font-semibold text-[#075B2B]">{energyLabels[energy]}</span>
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setEnergy(lvl)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  energy === lvl
                    ? 'border-[#075B2B] bg-[#075B2B] text-white shadow-xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Current Weight */}
        <div>
          <label className="block text-xs font-bold text-[#1A2E1C] mb-1">
            3. Current Morning Weight (Optional)
          </label>
          <div className="relative max-w-xs">
            <input
              type="number"
              step="0.1"
              min="30"
              max="300"
              inputMode="decimal"
              placeholder="e.g. 68.2"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#2FAF37] focus:outline-none focus:ring-1 focus:ring-[#2FAF37]"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-bold text-gray-400">
              kg
            </span>
          </div>
        </div>

        {/* Appetite / Digestion Notes */}
        <div>
          <label className="block text-xs font-bold text-[#1A2E1C] mb-1">
            4. Appetite &amp; Digestion
          </label>
          <textarea
            rows={2}
            placeholder="Did you feel excessively hungry before dinner? Any bloating or discomfort with specific foods?"
            value={appetiteNotes}
            onChange={(e) => setAppetiteNotes(e.target.value)}
            className="w-full rounded-xl border border-gray-200 p-3 text-xs text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#2FAF37] focus:outline-none focus:ring-1 focus:ring-[#2FAF37] resize-none"
          />
        </div>

        {/* Challenges Faced */}
        <div>
          <label className="block text-xs font-bold text-[#1A2E1C] mb-1">
            5. Challenges or Upcoming Schedule Changes
          </label>
          <textarea
            rows={2}
            placeholder="Travel plans, festivals, family dinners, late work shifts, or any routines to adjust for next week?"
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            className="w-full rounded-xl border border-gray-200 p-3 text-xs text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#2FAF37] focus:outline-none focus:ring-1 focus:ring-[#2FAF37] resize-none"
          />
        </div>

        <div className="flex items-center justify-end pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#075B2B] text-white hover:bg-[#064e24] text-xs font-bold px-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Weekly Check-In'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
