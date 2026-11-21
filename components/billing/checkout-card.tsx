'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RazorpayButton } from './razorpay-button';
import type { PlanTier } from '@/types/billing.types';
import { Check, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface CheckoutCardProps {
  planId: PlanTier;
  onPlanChange: (plan: PlanTier) => void;
}

export function CheckoutCard({ planId, onPlanChange }: CheckoutCardProps) {
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [consentError, setConsentError] = useState(false);

  const isPremium = planId === 'premium';
  const priceDisplay = isPremium ? '₹999' : '₹499';
  const planTitle = isPremium ? 'Premium Wellness Plan' : 'Normal Wellness Plan';

  const normalFeatures = [
    'Customized 7-day Indian home food plan',
    'Exact portions in household measures (katori, roti, grams)',
    'Smart meal swap alternatives for every meal',
    'Personalized hydration & routine scheduling',
    'Monthly plan update & dietary adjustments',
  ];

  const premiumFeatures = [
    'Identical high standard of customized diet planning',
    'Priority queue for plan delivery & revisions (< 24 hours)',
    'Weekly structured check-in form & adherence review',
    'Direct founder priority messaging for questions',
    'Monthly plan update & dietary adjustments',
  ];

  const activeFeatures = isPremium ? premiumFeatures : normalFeatures;

  const handleConsentCheckbox = (checked: boolean) => {
    setConsentAgreed(checked);
    if (checked) {
      setConsentError(false);
    }
  };

  return (
    <Card className="border-emerald-200 shadow-md overflow-hidden bg-white">
      {/* Tier Selector Tabs */}
      <div className="grid grid-cols-2 border-b border-emerald-100 bg-[#EAF8E7]/40 p-1.5">
        <button
          type="button"
          onClick={() => onPlanChange('normal')}
          className={`flex flex-col items-center justify-center rounded-lg py-2.5 px-3 text-center transition-all ${
            !isPremium
              ? 'bg-white shadow-xs text-[#075B2B] font-bold border border-emerald-200'
              : 'text-[#1A2E1C]/70 hover:text-[#075B2B] font-medium'
          }`}
        >
          <span className="text-sm">Normal Plan</span>
          <span className="text-xs font-semibold text-emerald-800">₹499 / month</span>
        </button>

        <button
          type="button"
          onClick={() => onPlanChange('premium')}
          className={`relative flex flex-col items-center justify-center rounded-lg py-2.5 px-3 text-center transition-all ${
            isPremium
              ? 'bg-white shadow-xs text-[#075B2B] font-bold border border-emerald-200'
              : 'text-[#1A2E1C]/70 hover:text-[#075B2B] font-medium'
          }`}
        >
          <span className="absolute -top-2 right-2 rounded-full bg-[#075B2B] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
            Priority
          </span>
          <span className="text-sm">Premium Plan</span>
          <span className="text-xs font-semibold text-emerald-800">₹999 / month</span>
        </button>
      </div>

      <CardHeader className="pb-3 pt-5 px-6">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50">
            {isPremium ? 'Priority Tier' : 'Standard Tier'}
          </Badge>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-[#1A2E1C]">{priceDisplay}</span>
            <span className="text-xs text-gray-500 font-medium"> / month</span>
          </div>
        </div>

        <CardTitle className="text-xl font-bold text-[#1A2E1C] mt-2">
          {planTitle}
        </CardTitle>
        <CardDescription className="text-xs text-[#1A2E1C]/70">
          Sustainable Indian home food • Zero extreme restrictions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-6">
        {/* Quality Parity Disclaimer */}
        <div className="rounded-lg bg-emerald-50/80 border border-emerald-200/80 p-3 text-xs text-[#1A2E1C]">
          <div className="flex items-center gap-1.5 font-semibold text-[#075B2B]">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>Equal Quality Guarantee</span>
          </div>
          <p className="mt-1 text-[#1A2E1C]/80 leading-relaxed">
            Both Normal and Premium plans receive the <strong>identical high standard</strong> of customized Indian diet planning. Premium adds weekly check-ins and priority turnaround.
          </p>
        </div>

        {/* Feature List */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5">
            What&apos;s Included Every Month
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-[#1A2E1C]">
            {activeFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#2FAF37] mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Order Summary Breakdown */}
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3.5 space-y-1.5 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Subscription Interval</span>
            <span className="font-medium text-gray-800">Monthly Recurring</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (GST)</span>
            <span className="font-medium text-gray-800">Inclusive</span>
          </div>
          <div className="border-t border-gray-200 my-1 pt-1.5 flex justify-between font-bold text-sm text-[#1A2E1C]">
            <span>Total Due Today</span>
            <span>{priceDisplay}</span>
          </div>
        </div>

        {/* Mandatory Legal & Refund Consent */}
        <div className="space-y-2 pt-1">
          <div className={`flex items-start gap-2.5 rounded-lg p-3 text-xs transition-colors border ${
            consentError
              ? 'bg-red-50 border-red-300 text-red-900'
              : 'bg-emerald-50/40 border-emerald-200/60 text-[#1A2E1C]/85'
          }`}>
            <input
              id="billingConsent"
              name="billingConsent"
              type="checkbox"
              checked={consentAgreed}
              onChange={(e) => handleConsentCheckbox(e.target.checked)}
              className="h-4 w-4 rounded border-emerald-300 text-[#075B2B] focus:ring-[#075B2B] mt-0.5 shrink-0"
            />
            <label htmlFor="billingConsent" className="leading-snug cursor-pointer">
              I understand this is a monthly recurring wellness subscription. I have read and agree to the{' '}
              <Link href="/terms" target="_blank" className="font-semibold text-[#075B2B] underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/refund-policy" target="_blank" className="font-semibold text-[#075B2B] underline">
                Refund Policy
              </Link>
              , and acknowledge that diets are individualized home food schedules, not clinical cures.
            </label>
          </div>

          {consentError && (
            <p className="text-[11px] font-medium text-red-600 flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              Please check the agreement box before proceeding to payment.
            </p>
          )}
        </div>

        {/* Razorpay Checkout Trigger */}
        <RazorpayButton
          planId={planId}
          disabled={!consentAgreed}
          onConsentError={() => setConsentError(true)}
        />
      </CardContent>

      <CardFooter className="flex flex-col gap-1 border-t border-emerald-50 bg-[#FFFDF7]/60 p-4 text-center text-xs text-gray-500">
        <span className="flex items-center justify-center gap-1 text-emerald-800 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#2FAF37]" />
          Cancel anytime easily directly from your member dashboard
        </span>
        <p className="text-[11px]">
          Need help? Contact <a href="mailto:support@fitvora.com" className="underline text-emerald-800">support@fitvora.com</a>
        </p>
      </CardFooter>
    </Card>
  );
}
