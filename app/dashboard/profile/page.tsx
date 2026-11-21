import React, { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { ProfileForm } from '@/components/dashboard/profile-form';
import { PreferencesView } from '@/components/dashboard/preferences-view';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Shield, Download, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import type { Assessment } from '@/types/database.types';

async function ProfilePageContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <EmptyState
        icon={Shield}
        title="Sign In Required"
        description="Please log in to manage your profile and privacy settings."
        action={{ label: 'Sign In', href: '/login' }}
      />
    );
  }

  const adminSupabase = createAdminClient();

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: assessment } = await adminSupabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <Link
          href="/dashboard"
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
              email: profile?.email || user.email || '',
              phone: profile?.phone || null,
              timezone: profile?.timezone || 'Asia/Kolkata',
            }}
          />

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

            <CardContent className="space-y-3 pt-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/70">
                <div>
                  <p className="font-bold text-gray-800">Export Health Data</p>
                  <p className="text-gray-500 text-[11px]">Download all assessment records, check-ins, and diet plans in JSON format.</p>
                </div>
                <a href="mailto:privacy@fitvora.com?subject=Data%20Export%20Request">
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 text-xs h-8">
                    <Download className="mr-1 h-3.5 w-3.5" />
                    Export
                  </Button>
                </a>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/40">
                <div>
                  <p className="font-bold text-red-900">Request Account Deletion</p>
                  <p className="text-red-700 text-[11px]">Permanently remove your profile, intake health records, and cancel active subscriptions.</p>
                </div>
                <a href="mailto:privacy@fitvora.com?subject=Account%20Deletion%20Request">
                  <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 text-xs h-8">
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </a>
              </div>
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
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#075B2B]" />
          <p className="text-xs text-gray-500 font-medium">Loading your profile...</p>
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
