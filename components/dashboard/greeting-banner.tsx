import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BrandCharacter } from '@/components/ui/brand-character';
import { Sparkles } from 'lucide-react';

interface GreetingBannerProps {
  name: string;
  goal: string;
  tier: string;
  planVersion: number;
}

export function GreetingBanner({ name, goal, tier, planVersion }: GreetingBannerProps) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-white p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="space-y-2 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E1C]">
            Namaste, {name}!
          </h1>
          <Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
            {tier} Plan • v{planVersion}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#075B2B] font-semibold justify-center sm:justify-start">
          <Sparkles className="h-4 w-4 text-[#2FAF37]" />
          <span>Active Goal: {goal}</span>
        </div>

        <p className="text-xs text-[#1A2E1C]/75 max-w-lg leading-relaxed">
          Here is your personalized Indian home-food schedule for today with portion measures and smart meal swaps.
        </p>
      </div>

      <div className="shrink-0">
        <BrandCharacter variant="thali" className="w-24 h-24 rounded-2xl shadow-xs" priority />
      </div>
    </div>
  );
}
