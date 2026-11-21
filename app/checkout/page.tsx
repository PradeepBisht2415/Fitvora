'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { CheckoutCard } from '@/components/billing/checkout-card';
import { BrandCharacter } from '@/components/ui/brand-character';
import type { PlanTier } from '@/types/billing.types';
import { ShieldCheck, HeartHandshake } from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const initialPlan = (searchParams.get('plan') === 'premium' ? 'premium' : 'normal') as PlanTier;
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(initialPlan);

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF7]">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-2">
            <BrandCharacter variant="celebration" className="w-20 h-20 mx-auto rounded-full" priority />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E1C]">
            Start Your Fitvora Membership
          </h1>
          <p className="mt-2 text-sm text-[#1A2E1C]/75 max-w-xl mx-auto">
            Choose your monthly tier to unlock your personalized Indian home-food schedule and guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Checkout Box */}
          <div className="lg:col-span-7">
            <CheckoutCard
              planId={selectedPlan}
              onPlanChange={(plan) => setSelectedPlan(plan)}
            />
          </div>

          {/* Value Props & Assurances Sidebar */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <ShieldCheck className="h-5 w-5 text-[#2FAF37]" />
                <span>Our Fair Nutrition Commitment</span>
              </div>
              <p className="text-xs text-[#1A2E1C]/80 leading-relaxed">
                We believe everyone deserves exceptional guidance regardless of tier. That is why our Normal (₹499) and Premium (₹999) plans receive the exact same nutritional precision and personalized home-food planning.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <HeartHandshake className="h-5 w-5 text-[#2FAF37]" />
                <span>Zero Lock-in & Transparent Billing</span>
              </div>
              <ul className="text-xs text-[#1A2E1C]/80 space-y-2">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#2FAF37] font-bold">✓</span>
                  <span>Self-service 1-click cancellation anytime in member dashboard.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#2FAF37] font-bold">✓</span>
                  <span>Retain access through the end of your paid billing cycle.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#2FAF37] font-bold">✓</span>
                  <span>Clear billing disclosures with zero hidden charges.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 text-[11px] text-[#1A2E1C]/75 leading-relaxed">
              <strong>Medical Disclaimer:</strong> Fitvora provides educational nutritional planning based on wholesome Indian home food. We do not diagnose, treat, or cure medical conditions. Please consult your physician for clinical health needs.
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075B2B]"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
