import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';
import { BrandCharacter } from '@/components/ui/brand-character';

interface PlanSelectionCardsProps {
  memberName?: string;
  hasAssessment?: boolean;
}

export function PlanSelectionCards({ memberName, hasAssessment = true }: PlanSelectionCardsProps) {
  const displayName = memberName || 'Member';

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#075B2B]">
            <Sparkles className="h-3.5 w-3.5 text-[#2FAF37]" />
            <span>{hasAssessment ? 'Free Assessment Received' : 'Step 2: Choose Your Plan'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E1C]">
            Namaste, {displayName}! Choose Your Plan
          </h1>
          <p className="text-xs sm:text-sm text-[#1A2E1C]/75 max-w-xl leading-relaxed">
            {hasAssessment
              ? 'Your health intake has been recorded! Select a monthly tier below to activate your membership and receive your customized 7-day Indian meal schedule.'
              : 'Choose a monthly tier below to unlock your personalized 7-day Indian home-food schedule, household portion measures, and guidance.'}
          </p>
        </div>

        <div className="shrink-0">
          <BrandCharacter variant="thali" className="w-20 h-20 rounded-2xl shadow-xs" priority />
        </div>
      </div>

      {/* Two Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Normal Plan Card */}
        <Card className="border-gray-200 bg-white shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div>
            <CardHeader className="p-6 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-gray-300 text-gray-700 bg-gray-50 text-[11px] font-bold">
                  Standard Tier
                </Badge>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-[#1A2E1C]">₹499</span>
                  <span className="text-xs text-gray-500 font-medium"> / month</span>
                </div>
              </div>

              <CardTitle className="text-xl font-bold text-[#1A2E1C]">
                Normal Wellness Plan
              </CardTitle>
              <CardDescription className="text-xs text-[#1A2E1C]/70 leading-relaxed">
                Ideal for self-directed individuals who want an expertly structured Indian home-food schedule.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-3 text-xs text-[#1A2E1C]/85">
              <div className="border-t border-gray-100 pt-3 space-y-2.5">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                  <span><strong>Full 7-day personalized Indian meal plan</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                  <span>Exact household portions (katori, roti, grams)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                  <span>Smart home-food alternative swaps for each meal</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                  <span>Matched to your work shift & wake/sleep schedule</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                  <span>Weight tracking & progress visualization</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                  <span>Standard support inbox access</span>
                </div>
              </div>
            </CardContent>
          </div>

          <CardFooter className="p-6 pt-0 border-t border-gray-50">
            <Link href="/checkout?plan=normal" className="w-full">
              <Button
                variant="outline"
                className="w-full border-[#075B2B] text-[#075B2B] hover:bg-emerald-50 font-bold text-xs h-10 shadow-xs"
              >
                Choose Normal Plan (₹499/mo)
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Premium Plan Card */}
        <Card className="border-2 border-[#075B2B] bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
          <div className="bg-[#075B2B] text-white py-1 px-3 text-[10px] font-black uppercase tracking-wider text-center flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-300" />
            <span>Recommended • Priority Guidance</span>
          </div>

          <div>
            <CardHeader className="p-6 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-100 text-[#075B2B] hover:bg-emerald-100 text-[11px] font-bold">
                  Priority Tier
                </Badge>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-[#075B2B]">₹999</span>
                  <span className="text-xs text-gray-500 font-medium"> / month</span>
                </div>
              </div>

              <CardTitle className="text-xl font-bold text-[#1A2E1C]">
                Premium Wellness Plan
              </CardTitle>
              <CardDescription className="text-xs text-[#1A2E1C]/70 leading-relaxed">
                For members who thrive with weekly accountability, habit troubleshooting, and priority support.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-3 text-xs text-[#1A2E1C]/85">
              <div className="border-t border-gray-100 pt-3 space-y-2.5">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                  <span><strong>Identical high-standard customized diet plan</strong></span>
                </div>
                <div className="flex items-start gap-2 font-semibold text-[#075B2B]">
                  <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                  <span>Priority Queue: Delivered in &lt; 24 hours</span>
                </div>
                <div className="flex items-start gap-2 font-semibold text-[#075B2B]">
                  <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                  <span>Weekly structured check-ins & adherence review</span>
                </div>
                <div className="flex items-start gap-2 font-semibold text-[#075B2B]">
                  <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                  <span>Priority support queue for rapid assistance</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                  <span>Direct routine adjustments as your body adapts</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                  <span>Exact household portions & smart food swaps</span>
                </div>
              </div>
            </CardContent>
          </div>

          <CardFooter className="p-6 pt-0 border-t border-gray-50">
            <Link href="/checkout?plan=premium" className="w-full">
              <Button
                className="w-full bg-[#075B2B] hover:bg-[#05401E] text-white font-bold text-xs h-10 shadow-sm"
              >
                Choose Premium Plan (₹999/mo)
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="rounded-xl border border-emerald-100 bg-[#EAF8E7]/40 p-4 text-xs text-[#1A2E1C]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-4 w-4 text-[#2FAF37] shrink-0" />
          <span>
            <strong>Equal Nutrition Guarantee:</strong> We never compromise meal plan quality for price. Both ₹499 and ₹999 members get equal nutritional precision.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500 shrink-0 text-[11px]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#2FAF37]" />
          <span>Cancel anytime in 1 click • Zero lock-in</span>
        </div>
      </div>
    </div>
  );
}
