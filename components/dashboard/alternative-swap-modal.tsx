'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { X, RefreshCw, CheckCircle2 } from 'lucide-react';

interface AlternativeSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseMealTitle: string;
  basePortion: string;
  alternatives: { title: string; portion: string }[];
}

export function AlternativeSwapModal({
  isOpen,
  onClose,
  baseMealTitle,
  basePortion,
  alternatives,
}: AlternativeSwapModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 p-6 space-y-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
          <RefreshCw className="h-5 w-5 text-[#2FAF37]" />
          <span>Approved Indian Meal Alternatives</span>
        </div>

        <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-100 text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400">Scheduled Meal</span>
          <p className="font-bold text-[#1A2E1C] text-sm">{baseMealTitle}</p>
          <p className="text-gray-600">Portion: {basePortion}</p>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Approved Equal-Macro Swaps
          </h4>

          {alternatives.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">
              No specific swaps registered for this meal. You can substitute with similar steamed dal and sabzi.
            </p>
          ) : (
            alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 text-xs space-y-1"
              >
                <div className="flex items-center gap-2 font-bold text-[#1A2E1C]">
                  <CheckCircle2 className="h-4 w-4 text-[#2FAF37] shrink-0" />
                  <span>{alt.title}</span>
                </div>
                <p className="text-gray-600 pl-6">
                  Recommended portion: <strong className="text-gray-800">{alt.portion}</strong>
                </p>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="bg-[#075B2B] text-white hover:bg-[#075B2B]/90 text-xs px-5"
          >
            Got It
          </Button>
        </div>
      </div>
    </div>
  );
}
