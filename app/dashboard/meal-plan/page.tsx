import React, { Suspense } from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { getEffectiveDashboardUser } from '@/lib/auth/get-effective-user';
import { WeeklyPlanTabs } from '@/components/dashboard/weekly-plan-tabs';
import { GroceryOverview } from '@/components/dashboard/grocery-overview';
import { PlanPendingCard } from '@/components/dashboard/plan-pending-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  CreditCard,
  ArrowLeft,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { DietPlanMeal } from '@/types/database.types';
import { formatGuidanceBullets } from '@/lib/parsers/word-diet-parser';

async function MealPlanContent({
  searchParams,
}: {
  searchParams?: Promise<{ asMember?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const {
    authenticatedUser,
    effectiveUserId,
    isImpersonating,
  } = await getEffectiveDashboardUser(resolvedParams.asMember);

  if (!authenticatedUser || !effectiveUserId) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Sign In Required"
        description="Please sign in to view your 7-day Indian meal schedule."
        action={{ label: 'Sign In', href: '/login' }}
      />
    );
  }

  const adminSupabase = createAdminClient();

  // Check subscription
  const { data: subscription } = await adminSupabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', effectiveUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const isSubscribed = subscription && subscription.status === 'active';
  const isPremium = subscription?.plan_id === 'premium';

  if (!isSubscribed) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Subscription Required"
        description={
          isImpersonating
            ? 'This client does not currently have an active membership subscription.'
            : 'Choose a monthly plan to unlock your full 7-day personalized Indian meal plan.'
        }
        action={
          isImpersonating
            ? { label: 'Go to Member Desk', href: `/admin/members/${effectiveUserId}` }
            : { label: 'Choose a Plan', href: '/checkout' }
        }
      />
    );
  }

  // Fetch published diet plan
  const { data: publishedPlan } = await adminSupabase
    .from('diet_plans')
    .select('*')
    .eq('user_id', effectiveUserId)
    .eq('status', 'published')
    .order('version', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!publishedPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href={resolvedParams.asMember ? `/dashboard?asMember=${resolvedParams.asMember}` : '/dashboard'} className="hover:underline flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
        </div>
        <PlanPendingCard isPremium={isPremium} />
      </div>
    );
  }

  // Fetch meals
  const { data: allMeals } = await adminSupabase
    .from('diet_plan_meals')
    .select('*')
    .eq('diet_plan_id', publishedPlan.id)
    .order('order_index', { ascending: true });

  const meals = (allMeals as DietPlanMeal[]) || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A2E1C]">
              Your 7-Day Indian Home-Food Schedule
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Personalized Plan Version {publishedPlan.version} • Published on{' '}
              {publishedPlan.published_at
                ? new Date(publishedPlan.published_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Recent'}
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Interactive Tabs */}
      <WeeklyPlanTabs meals={meals} />

      {/* Guidance Notes */}
      {publishedPlan.guidance_notes && (
        <Card className="bg-white border-emerald-100 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-[#075B2B] flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-[#2FAF37]" />
              Guidance & Hydration Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[#1A2E1C]/90 leading-relaxed whitespace-pre-line space-y-2 font-normal">
            {formatGuidanceBullets(publishedPlan.guidance_notes)}
          </CardContent>
        </Card>
      )}

      {/* Weekly Grocery Checklist */}
      <GroceryOverview meals={meals} />
    </div>
  );
}

export default async function MealPlanPage(props: {
  searchParams?: Promise<{ asMember?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#075B2B]" />
          <p className="text-xs text-gray-500 font-medium">Loading your weekly meal plan...</p>
        </div>
      }
    >
      <MealPlanContent searchParams={props.searchParams} />
    </Suspense>
  );
}
