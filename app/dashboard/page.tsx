import React, { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BrandCharacter } from '@/components/ui/brand-character';
import { CreditCard, UtensilsCrossed, ArrowRight, ShieldCheck, HeartHandshake, Loader2 } from 'lucide-react';

async function DashboardContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminSupabase = createAdminClient();

  let subscription = null;
  let profile = null;

  if (user) {
    const { data: p } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = p;

    const { data: s } = await adminSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    subscription = s;
  }

  const firstName = profile?.first_name || 'Member';
  const hasActiveSub = subscription && subscription.status === 'active';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/90 to-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E1C]">
              Namaste, {firstName}!
            </h1>
            {subscription && <StatusBadge status={subscription.status} />}
          </div>
          <p className="text-sm text-[#1A2E1C]/75 max-w-lg">
            Welcome to your Fitvora wellness portal. We personalize your meals using familiar Indian ghar ka khana.
          </p>
        </div>

        <div className="shrink-0">
          <BrandCharacter variant="celebration" className="w-24 h-24 rounded-2xl" priority />
        </div>
      </div>

      {!hasActiveSub ? (
        <EmptyState
          icon={CreditCard}
          title="No Active Membership Plan"
          description="You currently do not have an active monthly subscription. Select your plan to unlock your customized 7-day Indian meal schedule and founder guidance."
          action={{
            label: 'Choose a Plan (From ₹499/mo)',
            href: '/checkout',
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-emerald-100 bg-white shadow-xs">
            <CardHeader>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#075B2B]">
                <UtensilsCrossed className="h-4 w-4" />
                <span>Personalized Meal Schedule</span>
              </div>
              <CardTitle className="text-lg text-[#1A2E1C]">7-Day Indian Home-Food Plan</CardTitle>
              <CardDescription>
                Tailored to your routine, food preferences, and portion measurements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-[#1A2E1C]/80 leading-relaxed">
                Your diet plan is prepared with familiar ingredients like dal, roti, sabzi, curd, and poha with exact household measures.
              </p>
              <Link href="/dashboard/subscription">
                <Button className="w-full bg-[#075B2B] text-white hover:bg-[#075B2B]/90 text-xs">
                  Manage Plan & Billing <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white shadow-xs">
            <CardHeader>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#075B2B]">
                <ShieldCheck className="h-4 w-4" />
                <span>Guidance Standards</span>
              </div>
              <CardTitle className="text-lg text-[#1A2E1C]">Sustainable Wellness</CardTitle>
              <CardDescription>
                Safe habits without crash diets or synthetic supplements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[#1A2E1C]/80">
              <div className="flex items-start gap-2">
                <HeartHandshake className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                <span>Identical planning quality on both Normal & Premium tiers.</span>
              </div>
              <div className="flex items-start gap-2">
                <HeartHandshake className="h-4 w-4 text-[#2FAF37] shrink-0 mt-0.5" />
                <span>Self-service 1-click subscription management anytime.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#075B2B]" />
          <p className="text-xs text-gray-500 font-medium">Loading your Fitvora dashboard...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
