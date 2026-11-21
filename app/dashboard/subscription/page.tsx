'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/db/supabase-browser';
import { SubscriptionDetailsCard } from '@/components/billing/subscription-details-card';
import { EmptyState } from '@/components/ui/empty-state';
import { BrandCharacter } from '@/components/ui/brand-character';
import type { Subscription } from '@/types/database.types';
import { CreditCard, CheckCircle2 } from 'lucide-react';

function SubscriptionPageContent() {
  const searchParams = useSearchParams();
  const asMember = searchParams.get('asMember');
  const statusParam = searchParams.get('status');

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(
    statusParam === 'success'
      ? 'Payment received! Your subscription is active. Welcome to Fitvora!'
      : statusParam === 'sandbox_mock'
        ? 'Sandbox mode checkout simulated successfully.'
        : null
  );

  const supabase = createClient();

  const fetchSubscription = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      let targetUserId = user.id;
      if (asMember) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role === 'admin') {
          targetUserId = asMember;
        }
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setSubscription(data);
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, asMember]);

  useEffect(() => {
    let isMounted = true;

    const loadSubscription = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (isMounted) setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (isMounted) {
          if (!error && data) {
            setSubscription(data);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load subscription:', err);
        if (isMounted) setLoading(false);
      }
    };

    loadSubscription();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075B2B] mx-auto"></div>
        <p className="text-xs text-gray-500 font-medium">Loading your subscription details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {bannerMessage && (
        <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 p-4 text-xs text-emerald-900 border border-emerald-200 shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-[#2FAF37] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{bannerMessage}</p>
            <p className="mt-0.5 text-emerald-800">
              Your member entitlements have been updated.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2E1C]">
            Subscription & Billing
          </h1>
          <p className="text-xs text-[#1A2E1C]/70 mt-1">
            Manage your monthly wellness membership, renewal dates, and payment settings
          </p>
        </div>

        <div className="hidden sm:block">
          <BrandCharacter variant="thali" className="w-16 h-16 rounded-xl" />
        </div>
      </div>

      {subscription ? (
        <SubscriptionDetailsCard
          subscription={subscription}
          onRefresh={fetchSubscription}
        />
      ) : (
        <EmptyState
          icon={CreditCard}
          title="No Active Subscription"
          description="You do not have an active subscription yet. Choose between Normal (₹499/mo) or Premium (₹999/mo) to unlock your personalized meal plan."
          action={{
            label: 'Choose a Plan',
            href: '/checkout',
          }}
        />
      )}
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075B2B] mx-auto"></div>
        </div>
      }
    >
      <SubscriptionPageContent />
    </Suspense>
  );
}
