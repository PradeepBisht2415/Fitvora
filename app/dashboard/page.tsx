import React, { Suspense } from 'react';
import Link from 'next/link';
import { getAdminClient } from '@/lib/db/supabase-admin';
import { getEffectiveDashboardUser } from '@/lib/auth/get-effective-user';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { PlanSelectionCards } from '@/components/dashboard/plan-selection-cards';
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
import { formatGuidanceBullets, getIndiaTodayDate } from '@/lib/utils/diet-formatters';

export const dynamic = 'force-dynamic';

async function DashboardContent({
  searchParams,
}: {
  searchParams?: Promise<{ asMember?: string }>;
}) {
  try {
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

    const adminSupabase = getAdminClient();
    if (!adminSupabase) {
      return (
        <EmptyState
          icon={CreditCard}
          title="Service Unavailable"
          description="Database connection is not configured yet. Please ensure Supabase environment variables are added in your project settings."
          action={{ label: 'Return Home', href: '/' }}
        />
      );
    }

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

    // Also check if member has submitted an assessment
    const { data: userAssessment } = await adminSupabase
      .from('assessments')
      .select('id')
      .eq('user_id', effectiveUserId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!isSubscribed) {
      if (isImpersonating) {
        return (
          <EmptyState
            icon={CreditCard}
            title="Client Has No Active Membership Plan"
            description={`Client ${profile?.first_name || 'Member'} does not currently have an active subscription.`}
            action={{ label: 'Go to Member Desk', href: `/admin/members/${effectiveUserId}` }}
          />
        );
      }

      return (
        <PlanSelectionCards
          memberName={profile?.first_name || 'Member'}
          hasAssessment={!!userAssessment}
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
                    Your subscription is active! Please complete your brief 3-minute intake assessment so our nutrition team can review your health details and curate your customized 7-day Indian meal schedule.
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

    // Calculate 1st day start (evaluated in Indian Standard Time Asia/Kolkata)
    const todayDate = getIndiaTodayDate();

    let startDate: Date;
    if (publishedPlan.effective_start_date) {
      const parts = publishedPlan.effective_start_date.split('-').map(Number);
      startDate = new Date(parts[0]!, parts[1]! - 1, parts[2]!);
    } else {
      const applied = new Date(publishedPlan.published_at || publishedPlan.created_at);
      const appliedIst = applied.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const [ay, am, ad] = appliedIst.split('-').map(Number);
      startDate = new Date(ay!, am! - 1, ad! + 1);
    }
    startDate.setHours(0, 0, 0, 0);

    const isBeforeStart = todayDate.getTime() < startDate.getTime();
    let planDayNumber = 1;

    if (isBeforeStart) {
      // Applied date is today; 1st day starts tomorrow. Show Day 1 preview so member can prepare
      planDayNumber = 1;
    } else {
      const diffMs = todayDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      planDayNumber = (diffDays % 7) + 1; // Cycle day 1 to 7
    }

    // In 7-day schedule, Day 1..6 have day_of_week 1..6, and Day 7 has day_of_week 0
    const targetDayOfWeek = planDayNumber === 7 ? 0 : planDayNumber;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayWeekdayName = dayNames[todayDate.getDay()] || 'Today';

    const todayMeals = ((allMeals as DietPlanMeal[]) || []).filter(
      (m) => m.day_of_week === targetDayOfWeek
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
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-[#1A2E1C]">
                {isBeforeStart
                  ? `Day 1 Preview — Plan Starts Tomorrow (${startDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })})`
                  : `Today's Meals — Day ${planDayNumber} (${todayWeekdayName})`}
              </h2>
              {isBeforeStart && (
                <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  Starts Tomorrow
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isBeforeStart
                ? 'Your 7-day schedule officially begins tomorrow. Review your Day 1 meals below to prep your groceries & portions.'
                : 'Follow exact household portions (katori, roti). Swaps available for every meal.'}
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
            <p>No meals scheduled for {isBeforeStart ? 'Day 1' : todayWeekdayName}. Check your weekly schedule.</p>
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
      </div>
    );
  } catch (err) {
    console.error('Error rendering DashboardContent:', err);
    return (
      <EmptyState
        icon={CreditCard}
        title="Dashboard Temporary Issue"
        description="We encountered an issue loading your dashboard. Please try refreshing or signing in again."
        action={{ label: 'Sign In Again', href: '/login' }}
      />
    );
  }
}

export default async function DashboardPage(props: {
  searchParams?: Promise<{ asMember?: string }>;
}) {
  try {
    return await DashboardContent({ searchParams: props.searchParams });
  } catch (err) {
    console.error('Fatal error rendering DashboardPage:', err);
    return (
      <EmptyState
        icon={CreditCard}
        title="Dashboard Temporary Issue"
        description="We encountered an issue loading your dashboard. Please try refreshing or signing in again."
        action={{ label: 'Sign In Again', href: '/login' }}
      />
    );
  }
}
