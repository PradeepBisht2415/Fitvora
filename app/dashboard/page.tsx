import React, { Suspense } from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { getEffectiveDashboardUser } from '@/lib/auth/get-effective-user';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { GreetingBanner } from '@/components/dashboard/greeting-banner';
import { PlanPendingCard } from '@/components/dashboard/plan-pending-card';
import { MealCard } from '@/components/dashboard/meal-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  CreditCard,
  Calendar,
  Sparkles,
  Loader2,
  ClipboardList,
} from 'lucide-react';
import type { DietPlanMeal } from '@/types/database.types';
import { formatGuidanceBullets } from '@/lib/parsers/word-diet-parser';

async function DashboardContent({
  searchParams,
}: {
  searchParams?: Promise<{ asMember?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const {
    authenticatedUser,
    effectiveUserId,
    isImpersonating,
    clientProfile,
  } = await getEffectiveDashboardUser(resolvedParams.asMember);

  if (!authenticatedUser || !effectiveUserId) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Sign In Required"
        description="Please sign in to view your daily meal schedule."
        action={{ label: 'Sign In', href: '/login' }}
      />
    );
  }

  const adminSupabase = createAdminClient();

  // 1. Fetch member profile
  const profile =
    clientProfile ||
    (
      await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', effectiveUserId)
        .maybeSingle()
    ).data;

  // 2. Fetch active subscription
  const { data: subscription } = await adminSupabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', effectiveUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const isSubscribed = subscription && subscription.status === 'active';
  const isPremium = subscription?.plan_id === 'premium';
  const tierName = isPremium ? 'Premium' : 'Normal';

  if (!isSubscribed) {
    return (
      <EmptyState
        icon={CreditCard}
        title={isImpersonating ? 'Client Has No Active Membership Plan' : 'No Active Membership Plan'}
        description={
          isImpersonating
            ? `Client ${profile?.first_name || 'Member'} does not currently have an active subscription.`
            : 'Select a monthly plan to unlock your customized 7-day Indian meal schedule, exact portions, and founder guidance.'
        }
        action={
          isImpersonating
            ? { label: 'Go to Member Desk', href: `/admin/members/${effectiveUserId}` }
            : {
                label: 'Choose a Plan (From ₹499/mo)',
                href: '/checkout',
              }
        }
      />
    );
  }

  // 3. Fetch member's published diet plan
  const { data: publishedPlan } = await adminSupabase
    .from('diet_plans')
    .select('*')
    .eq('user_id', effectiveUserId)
    .eq('status', 'published')
    .order('version', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Also check if member has submitted an assessment
  const { data: userAssessment } = await adminSupabase
    .from('assessments')
    .select('id')
    .eq('user_id', effectiveUserId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!publishedPlan) {
    return (
      <div className="space-y-6">
        {!userAssessment && (
          <Card className="border-amber-300 bg-amber-50/80 p-5 rounded-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
                  <ClipboardList className="h-5 w-5 text-amber-700 shrink-0" />
                  <span>Action Required: Fill Your Health & Dietary Assessment</span>
                </div>
                <p className="text-xs text-amber-900/80 max-w-xl leading-relaxed">
                  Your subscription is active! Please complete your brief 3-minute intake assessment so our founder can review your health details and curate your customized 7-day Indian meal schedule.
                </p>
              </div>
              <Link href="/assessment">
                <Button className="bg-[#075B2B] text-white hover:bg-[#075B2B]/90 font-bold shrink-0 shadow-sm text-xs">
                  Fill Assessment Form &rarr;
                </Button>
              </Link>
            </div>
          </Card>
        )}
        <PlanPendingCard isPremium={isPremium} />
      </div>
    );
  }

  // 4. Fetch meals for this published plan
  const { data: allMeals } = await adminSupabase
    .from('diet_plan_meals')
    .select('*')
    .eq('diet_plan_id', publishedPlan.id)
    .order('order_index', { ascending: true });

  const currentDayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[currentDayOfWeek] || 'Today';

  const todayMeals = (allMeals as DietPlanMeal[] || []).filter(
    (m) => m.day_of_week === currentDayOfWeek
  );

  // Determine current/next meal by time
  const currentHourMinute = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const nextMeal = todayMeals.find((m) => m.scheduled_time >= currentHourMinute) || todayMeals[0];

  // Fetch assessment goal
  const { data: assessment } = await adminSupabase
    .from('assessments')
    .select('target_direction')
    .eq('user_id', effectiveUserId)
    .maybeSingle();

  const goalText =
    assessment?.target_direction === 'gain_weight'
      ? 'Healthy Weight Gain & Muscle Nourishment'
      : assessment?.target_direction === 'maintain_health'
      ? 'Weight Maintenance & Clean Eating'
      : 'Sustainable Weight Loss with Home Meals';

  const firstName = profile?.first_name || 'Member';

  return (
    <div className="space-y-6">
      {/* Assessment Prompt if not yet filled */}
      {!assessment && (
        <Card className="border-amber-300 bg-amber-50/80 p-5 rounded-2xl shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
                <ClipboardList className="h-5 w-5 text-amber-700 shrink-0" />
                <span>Next Step: Fill Your Health & Dietary Assessment</span>
              </div>
              <p className="text-xs text-amber-900/80 max-w-xl leading-relaxed">
                Your subscription is active! Please complete your brief 3-minute intake assessment so our engine can tailor your portions, food preferences (veg/non-veg), and regional meal alternatives.
              </p>
            </div>
            <Link href="/assessment">
              <Button className="bg-[#075B2B] text-white hover:bg-[#075B2B]/90 font-bold shrink-0 shadow-sm text-xs">
                Fill Assessment Form &rarr;
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Greeting Banner */}
      <GreetingBanner
        name={firstName}
        goal={goalText}
        tier={tierName}
        planVersion={publishedPlan.version}
      />

      {/* Today's Schedule Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-[#1A2E1C]">
            Today&apos;s Meals — {todayName}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Follow exact household portions (katori, roti). Swaps available for every meal.
          </p>
        </div>

        <Link href={resolvedParams.asMember ? `/dashboard/meal-plan?asMember=${resolvedParams.asMember}` : '/dashboard/meal-plan'}>
          <Button variant="outline" size="sm" className="border-emerald-200 text-[#075B2B] hover:bg-emerald-50 text-xs">
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            View Full 7-Day Plan
          </Button>
        </Link>
      </div>

      {/* Today's Meals List */}
      {todayMeals.length === 0 ? (
        <Card className="bg-white border-dashed border-gray-200 p-8 text-center text-xs text-gray-500">
          <p>No meals scheduled for {todayName}. Check your weekly schedule.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              isNext={nextMeal?.id === meal.id}
            />
          ))}
        </div>
      )}

      {/* Founder Guidance Notes */}
      {publishedPlan.guidance_notes && (
        <Card className="bg-white border-emerald-100 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-[#075B2B] flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-[#2FAF37]" />
              Founder Guidance & Hydration Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[#1A2E1C]/90 leading-relaxed whitespace-pre-line space-y-2 font-normal">
            {formatGuidanceBullets(publishedPlan.guidance_notes)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default async function DashboardPage(props: {
  searchParams?: Promise<{ asMember?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#075B2B]" />
          <p className="text-xs text-gray-500 font-medium">Loading your Fitvora dashboard...</p>
        </div>
      }
    >
      <DashboardContent searchParams={props.searchParams} />
    </Suspense>
  );
}
