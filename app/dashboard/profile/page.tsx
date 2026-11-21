import React, { Suspense } from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { getEffectiveDashboardUser } from '@/lib/auth/get-effective-user';
import { ProfileForm } from '@/components/dashboard/profile-form';
import { PreferencesView } from '@/components/dashboard/preferences-view';
import { ReminderToggle } from '@/components/dashboard/reminder-toggle';
import { DpdpActions } from '@/components/dashboard/dpdp-actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import type { Assessment } from '@/types/database.types';

export const instant = false;

async function ProfilePageContent({
  searchParams,
}: {
  searchParams?: Promise<{ asMember?: string }>;
}) {
  try {
    const resolvedParams = searchParams ? await searchParams : {};
    const {
      authenticatedUser,
      effectiveUserId,
      clientProfile,
    } = await getEffectiveDashboardUser(resolvedParams.asMember);

    if (!authenticatedUser || !effectiveUserId) {
      return (
        <EmptyState
          icon={Shield}
          title="Sign In Required"
          description="Please log in to manage your profile and privacy settings."
          action={{ label: 'Sign In', href: '/login' }}
        />
      );
    }

    let adminSupabase;
    try {
      adminSupabase = createAdminClient();
    } catch {
      return (
        <EmptyState
          icon={Shield}
          title="Service Unavailable"
          description="Database connection is not configured yet. Please check your environment variables."
          action={{ label: 'Return Home', href: '/' }}
        />
      );
    }

  const profile =
    clientProfile ||
    (
      await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', effectiveUserId)
        .maybeSingle()
    ).data;

  const { data: assessment } = await adminSupabase
    .from('assessments')
    .select('*')
    .eq('user_id', effectiveUserId)
    .maybeSingle();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <Link
          href={resolvedParams.asMember ? `/dashboard?asMember=${resolvedParams.asMember}` : '/dashboard'}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A2E1C]">
            Profile & Dietary Preferences
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your personal details, review your intake habits, and control your privacy
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Editable Profile Form */}
        <div className="lg:col-span-6 space-y-6">
          <ProfileForm
            initialData={{
              firstName: profile?.first_name || '',
              lastName: profile?.last_name || null,
              email: profile?.email || authenticatedUser.email || '',
              phone: profile?.phone || null,
              timezone: profile?.timezone || 'Asia/Kolkata',
            }}
          />

          {/* Meal Schedule Reminder Opt-In */}
          <ReminderToggle />

          {/* DPDP Act Privacy & Data Rights Card */}
          <Card className="bg-white border-gray-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-[#075B2B]">
                <Shield className="h-4 w-4" />
                <span>DPDP Act 2023 Compliance</span>
              </div>
              <CardTitle className="text-base font-bold text-[#1A2E1C]">
                Privacy & Data Rights
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                You maintain complete ownership and control over your health and dietary data
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <DpdpActions />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dietary Baseline & Screening */}
        <div className="lg:col-span-6 space-y-6">
          <PreferencesView assessment={assessment as Assessment | null} />
        </div>
      </div>
    </div>
  );
  } catch (err) {
    console.error('Error rendering ProfilePageContent:', err);
    return (
      <EmptyState
        icon={Shield}
        title="Profile Temporarily Unavailable"
        description="We encountered an issue loading your profile. Please try refreshing or signing in again."
        action={{ label: 'Sign In Again', href: '/login' }}
      />
    );
  }
}

export default async function ProfilePage(props: {
  searchParams?: Promise<{ asMember?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#075B2B]" />
          <p className="text-xs text-gray-500 font-medium">Loading your profile...</p>
        </div>
      }
    >
      <ProfilePageContent searchParams={props.searchParams} />
    </Suspense>
  );
}
