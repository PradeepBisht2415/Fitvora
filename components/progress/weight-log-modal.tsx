'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { logWeightEntry } from '@/features/progress/weight-actions';
import { Plus, X, Loader2, Scale } from 'lucide-react';

interface WeightLogModalProps {
  onSuccess?: () => void;
  defaultDate?: string;
}

export function WeightLogModal({ onSuccess, defaultDate }: WeightLogModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [recordedAt, setRecordedAt] = useState(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(weightKg);
    if (isNaN(val) || val < 30 || val > 300) {
      setError('Please enter a realistic weight between 30 and 300 kg.');
      return;
    }

    setLoading(true);
    try {
      const res = await logWeightEntry({
        weight_kg: val,
        recorded_at: recordedAt,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setError(res.error || 'Failed to record weight.');
      } else {
        setIsOpen(false);
        setWeightKg('');
        setNotes('');
        if (onSuccess) onSuccess();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#075B2B] text-white hover:bg-[#064e24] shadow-xs flex items-center gap-1.5"
      >
        <Plus className="h-4 w-4" />
        <span>Log Today&apos;s Weight</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-emerald-100">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-[#075B2B]">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A2E1C]">Log Weight Entry</h3>
                <p className="text-xs text-gray-500">Record your morning body weight</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Weight (in Kilograms) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    inputMode="decimal"
                    placeholder="e.g. 68.5"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-base font-semibold text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#2FAF37] focus:outline-none focus:ring-2 focus:ring-[#2FAF37]/20"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-gray-400">
                    kg
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={recordedAt}
                  onChange={(e) => setRecordedAt(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-[#1A2E1C] focus:border-[#2FAF37] focus:outline-none focus:ring-2 focus:ring-[#2FAF37]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  maxLength={500}
                  placeholder="e.g. After morning hydration, post 7h sleep"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#2FAF37] focus:outline-none focus:ring-2 focus:ring-[#2FAF37]/20"
                />
              </div>

              <div className="rounded-xl bg-[#EAF8E7]/60 p-3 text-xs text-[#075B2B]">
                💡 Tip: Weigh yourself first thing in the morning after using the washroom for consistent tracking.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#075B2B] text-white hover:bg-[#064e24] text-xs font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Entry'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
