import React from 'react';
import { Card, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { BrandCharacter } from '@/components/ui/brand-character';

interface PlanPendingCardProps {
  isPremium?: boolean;
}

export function PlanPendingCard({ isPremium }: PlanPendingCardProps) {
  const turnaroundText = isPremium
    ? 'Priority Queue: Delivered within 24 hours'
    : 'Customized & Delivered within 24–48 hours';

  return (
    <Card className="border-emerald-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-[#EAF8E7]/60 border-b border-emerald-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <Clock className="h-3.5 w-3.5" />
            <span>{turnaroundText}</span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-[#1A2E1C]">
            Founder Review & Diet Customization in Progress
          </CardTitle>
          <CardDescription className="text-xs text-[#1A2E1C]/80 max-w-xl leading-relaxed">
            Thank you for subscribing! Your intake routine, portion requirements, and food preferences are currently being reviewed by our founder to build your tailored 7-day Indian meal schedule.
          </CardDescription>
        </div>

        <div className="shrink-0">
          <BrandCharacter variant="coach" className="w-24 h-24 rounded-2xl" priority />
        </div>
      </div>

      <CardContent className="p-6 space-y-4 text-xs text-[#1A2E1C]/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
            <span className="font-bold text-gray-800 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#2FAF37]" />
              1. Habit Analysis
            </span>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Matching your work shift, wake/sleep cycle, and regional preferences.
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
            <span className="font-bold text-gray-800 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#2FAF37]" />
              2. Allergen Safety
            </span>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Cross-verifying every meal slot against your disclosed dietary allergies.
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
            <span className="font-bold text-gray-800 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[#2FAF37]" />
              3. Dashboard Unlocks
            </span>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Once published, your 7-day schedule, exact portions, and swaps will appear here.
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-emerald-50 bg-[#FFFDF7]/60 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
        <span>Need to add an extra routine note?</span>
        <a href="mailto:support@fitvora.com">
          <Button variant="outline" size="sm" className="border-emerald-200 text-[#075B2B] text-xs h-8">
            <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
            Contact Founder Support
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
