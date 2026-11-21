'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { CancelDialog } from './cancel-dialog';
import { UpgradeModal } from './upgrade-modal';
import type { Subscription } from '@/types/database.types';
import { Calendar, CreditCard, Sparkles, Check, AlertCircle } from 'lucide-react';

interface SubscriptionDetailsCardProps {
  subscription: Subscription;
  onRefresh?: () => void;
}

export function SubscriptionDetailsCard({ subscription, onRefresh }: SubscriptionDetailsCardProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const isPremium = subscription.plan_id === 'premium';
  const planName = isPremium ? 'Premium Wellness Plan' : 'Normal Wellness Plan';
  const planPrice = isPremium ? '₹999 / month' : '₹499 / month';

  const renewalDate = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'End of current cycle';

  const isCancelled = subscription.status === 'cancelled' || subscription.cancel_at_period_end;
  const isActive = subscription.status === 'active' && !isCancelled;

  const features = isPremium
    ? [
        'Customized 7-day Indian home food plan',
        'Exact portions & household measures (katori, roti)',
        'Smart meal swap alternatives',
        'Priority queue for diet plan updates (< 24 hours)',
        'Weekly structured check-in form & adherence review',
        'Direct priority messaging',
      ]
    : [
        'Customized 7-day Indian home food plan',
        'Exact portions & household measures (katori, roti)',
        'Smart meal swap alternatives',
        'General wellness & hydration guidance',
        'Monthly plan renewal & dietary adjustments',
      ];

  return (
    <>
      <Card className="border-emerald-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="bg-[#EAF8E7]/40 border-b border-emerald-100 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold text-[#1A2E1C]">{planName}</CardTitle>
                <StatusBadge status={subscription.status} />
              </div>
              <CardDescription className="text-xs text-[#1A2E1C]/70 mt-1">
                Personalized Indian home-food weight management
              </CardDescription>
            </div>

            <div className="text-right">
              <span className="text-2xl font-extrabold text-[#075B2B]">{planPrice}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-5">
          {/* Status Alert Banner */}
          {isCancelled ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-amber-950">Subscription Scheduled for Cancellation</p>
                <p className="mt-1 leading-relaxed">
                  Your subscription will not renew. You retain complete access to your meal schedule, portion guidance, and dashboard until <strong>{renewalDate}</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs text-emerald-950 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[#2FAF37] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-emerald-900">Active Membership</p>
                <p className="mt-1 leading-relaxed">
                  Your recurring plan is active. Next scheduled renewal date: <strong>{renewalDate}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Billing & Subscription Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <Calendar className="h-4 w-4 text-emerald-700" />
                <span>Next Renewal / End Date</span>
              </div>
              <p className="text-sm font-bold text-[#1A2E1C]">{renewalDate}</p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <CreditCard className="h-4 w-4 text-emerald-700" />
                <span>Payment Gateway</span>
              </div>
              <p className="text-sm font-bold text-[#1A2E1C]">Razorpay Recurring (Auto-Debit)</p>
            </div>
          </div>

          {/* Included Features */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Active Tier Entitlements
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-[#1A2E1C]">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="h-4 w-4 shrink-0 text-[#2FAF37] mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-50 bg-[#FFFDF7]/60 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/refund-policy" className="underline hover:text-[#075B2B]">
              Refund Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="underline hover:text-[#075B2B]">
              Terms of Service
            </Link>
            <span>•</span>
            <a href="mailto:support@fitvora.com" className="underline hover:text-[#075B2B]">
              Billing Support
            </a>
          </div>

          <div className="flex items-center gap-3">
            {!isPremium && isActive && (
              <UpgradeModal
                onSuccess={() => onRefresh?.()}
                triggerButton={
                  <Button variant="outline" size="sm" className="border-emerald-300 text-[#075B2B] hover:bg-emerald-50">
                    Upgrade to Premium (₹999)
                  </Button>
                }
              />
            )}

            {isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCancelModalOpen(true)}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <CancelDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onSuccess={() => onRefresh?.()}
        subscriptionId={subscription.id}
        periodEnd={subscription.current_period_end}
      />
    </>
  );
}
