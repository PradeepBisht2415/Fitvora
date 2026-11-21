'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AdminNav } from '@/components/admin/admin-nav';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  ClipboardList,
  History,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Eye,
  FileText,
} from 'lucide-react';
import { WordUploadModal } from '@/components/admin/plan-builder/word-upload-modal';
import { AssessmentDownloadButton } from '@/components/admin/assessment-download-button';
import type { MembershipStatus } from '@/types/database.types';

interface MemberDetailsData {
  profile: {
    id: string;
    first_name: string;
    last_name: string | null;
    email: string;
    phone: string | null;
    role: string;
    created_at: string;
  };
  membership: {
    lifecycle_status: MembershipStatus;
    joined_at: string | null;
  } | null;
  subscription: {
    plan_id: string;
    status: string;
    provider_subscription_id: string | null;
    current_period_end: string | null;
  } | null;
  assessment: {
    id: string;
    status: string;
    target_direction: string;
    age: number;
    height_cm: number;
    weight_kg: number;
    food_preferences: {
      diet_type?: string;
      allergies?: string[];
      dislikes?: string[];
      regional?: string;
    };
    health_screening: {
      conditions?: string[];
      is_pregnant_or_nursing?: boolean;
    };
  } | null;
  auditLogs: {
    id: string;
    action: string;
    created_at: string;
    metadata: Record<string, unknown>;
  }[];
}

function MemberDetailContent() {
  const params = useParams();
  const router = useRouter();
  const memberId = params['id'] as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MemberDetailsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Status override state
  const [newStatus, setNewStatus] = useState<MembershipStatus>('active');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState<string | null>(null);
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);

  const fetchMember = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/members/${memberId}`);
      if (!res.ok) {
        // If no direct single endpoint, fetch mock/fallback
        setError('Failed to load member details');
        return;
      }
      const json = await res.json();
      setData(json);
      if (json.membership) {
        setNewStatus(json.membership.lifecycle_status);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to fetch member information');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    let isMounted = true;

    const loadMember = async () => {
      try {
        const res = await fetch(`/api/admin/members/${memberId}`);
        if (!res.ok) {
          if (isMounted) setError('Failed to load member details');
          return;
        }
        const json = await res.json();
        if (isMounted) {
          setData(json);
          if (json.membership) {
            setNewStatus(json.membership.lifecycle_status);
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError('Unable to fetch member information');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMember();

    return () => {
      isMounted = false;
    };
  }, [memberId]);

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim() || overrideReason.length < 5) {
      setOverrideError('Mandatory reason must be at least 5 characters for compliance audit.');
      return;
    }

    setOverrideLoading(true);
    setOverrideError(null);
    setOverrideSuccess(null);

    try {
      const res = await fetch(`/api/admin/members/${memberId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reason: overrideReason.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setOverrideError(result.error || 'Failed to update member status');
      } else {
        setOverrideSuccess(`Member status updated to '${newStatus}'`);
        setOverrideReason('');
        fetchMember();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setOverrideError('Failed to execute override');
    } finally {
      setOverrideLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#075B2B]" />
        <p className="mt-2 text-xs text-gray-500">Loading member profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-sm text-red-600 mb-4">{error || 'Member not found'}</p>
        <Link href="/admin/members">
          <Button variant="outline">Back to Members Directory</Button>
        </Link>
      </div>
    );
  }

  const { profile, membership, subscription, assessment, auditLogs } = data;
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Member';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/members" className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1A2E1C]">{fullName}</h1>
              {membership && <StatusBadge status={membership.lifecycle_status} />}
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {profile.id}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard?asMember=${profile.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#075B2B] hover:bg-emerald-100 transition-colors shadow-xs"
            title="Open live client dashboard for this member"
          >
            <Eye className="h-3.5 w-3.5 text-[#2FAF37]" />
            <span>View Client Dashboard</span>
          </Link>
          <Button
            onClick={() => setIsWordModalOpen(true)}
            className="bg-[#075B2B] text-white hover:bg-[#075B2B]/90 text-xs h-8 font-bold gap-1.5 shadow-xs"
            title="Upload weekly diet PDF or Word file to generate client meal cards with exact timings"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Upload Weekly Diet (.pdf / .docx)</span>
          </Button>
          <Link href={`/admin/diet-plans/new?userId=${profile.id}`}>
            <Button variant="outline" className="border-gray-300 text-gray-700 text-xs h-8">
              Plan Editor
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Profile & Subscription Overview */}
        <div className="space-y-6 lg:col-span-1">
          {/* Contact & Registration Card */}
          <Card className="bg-white border-gray-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-sm font-bold text-[#1A2E1C] flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-700" />
                Member Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-medium text-gray-800">{profile.email}</span>
              </div>
              {profile.phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <a href={`tel:${profile.phone}`} className="font-semibold text-emerald-800 hover:underline">
                    📞 +91 {profile.phone}
                  </a>
                  <a
                    href={`https://wa.me/91${profile.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold hover:bg-emerald-200"
                  >
                    WhatsApp
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="h-3.5 w-3.5" />
                  <span>No phone recorded</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span>
                  Joined{' '}
                  {new Date(profile.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status Card */}
          <Card className="bg-white border-gray-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-sm font-bold text-[#1A2E1C] flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-700" />
                Active Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-3 text-xs text-gray-600">
              {subscription ? (
                <>
                  <div className="flex justify-between items-center">
                    <span>Plan Tier</span>
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold uppercase text-[10px]">
                      {subscription.plan_id === 'premium' ? 'Premium (₹999)' : 'Normal (₹499)'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status</span>
                    <StatusBadge status={subscription.status} />
                  </div>
                  {subscription.current_period_end && (
                    <div className="flex justify-between items-center">
                      <span>Renewal / End</span>
                      <span className="font-medium text-gray-800">
                        {new Date(subscription.current_period_end).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {subscription.provider_subscription_id && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
                        Razorpay Sub ID
                      </span>
                      <code className="text-[11px] font-mono bg-gray-50 p-1 rounded block text-gray-700 break-all">
                        {subscription.provider_subscription_id}
                      </code>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic">No subscription record found</p>
              )}
            </CardContent>
          </Card>

          {/* Manual Status Override Panel */}
          <Card className="bg-white border-amber-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-amber-100 bg-amber-50/50">
              <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                Manual Lifecycle Override
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <form onSubmit={handleOverrideSubmit} className="space-y-3 text-xs">
                {overrideError && (
                  <p className="p-2 rounded bg-red-50 text-red-700 border border-red-200">
                    {overrideError}
                  </p>
                )}
                {overrideSuccess && (
                  <p className="p-2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {overrideSuccess}
                  </p>
                )}

                <div>
                  <label htmlFor="newStatusSelect" className="block font-medium text-gray-700 mb-1">
                    Select New Status
                  </label>
                  <select
                    id="newStatusSelect"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as MembershipStatus)}
                    className="w-full rounded border border-gray-200 bg-white p-2 text-xs text-gray-800 focus:border-[#075B2B]"
                  >
                    <option value="active">active (Full paid access)</option>
                    <option value="invited">invited (Waiting to claim)</option>
                    <option value="registered">registered (Account ready)</option>
                    <option value="paused">paused (Temporary hold)</option>
                    <option value="inactive">inactive (Access ended)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="reasonTextarea" className="block font-medium text-gray-700 mb-1">
                    Mandatory Reason (Audit Log)
                  </label>
                  <textarea
                    id="reasonTextarea"
                    rows={2}
                    required
                    placeholder="e.g. Manual payment received via UPI or support adjustment..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full rounded border border-gray-200 p-2 text-xs placeholder:text-gray-400 focus:border-[#075B2B]"
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={overrideLoading}
                  className="w-full bg-[#075B2B] text-white hover:bg-[#075B2B]/90 h-8 text-xs"
                >
                  {overrideLoading ? 'Updating...' : 'Save Status Override'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Assessment Details & Audit Logs */}
        <div className="space-y-6 lg:col-span-2">
          {/* Linked Intake Assessment */}
          <Card className="bg-white border-gray-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-sm font-bold text-[#1A2E1C] flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-emerald-700" />
                  Intake Assessment Data
                </CardTitle>
                <div className="flex items-center gap-2">
                  {assessment && (
                    <>
                      <AssessmentDownloadButton
                        assessmentId={assessment.id}
                        clientName={profile.first_name}
                        assessmentData={assessment}
                        showPrivacyBadge={false}
                      />
                      <StatusBadge status={assessment.status} />
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 text-xs space-y-4">
              {assessment ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase">Goal</span>
                      <p className="font-semibold text-gray-800 capitalize">
                        {assessment.target_direction?.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase">Age</span>
                      <p className="font-semibold text-gray-800">{assessment.age} yrs</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase">Height</span>
                      <p className="font-semibold text-gray-800">{assessment.height_cm} cm</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase">Weight</span>
                      <p className="font-semibold text-gray-800">{assessment.weight_kg} kg</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-semibold text-gray-700">Food Preferences</span>
                    <div className="flex flex-wrap gap-1.5">
                      {assessment.food_preferences?.diet_type && (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
                          {assessment.food_preferences.diet_type}
                        </Badge>
                      )}
                      {assessment.food_preferences?.regional && (
                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-800">
                          {assessment.food_preferences.regional}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {assessment.health_screening?.conditions && assessment.health_screening.conditions.length > 0 && (
                    <div className="space-y-1 rounded bg-amber-50 p-2.5 border border-amber-200 text-amber-900">
                      <span className="font-semibold">Health Screening Flags:</span>
                      <p>{assessment.health_screening.conditions.join(', ')}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic">No linked assessment found for this user.</p>
              )}
            </CardContent>
          </Card>

          {/* Chronological Audit Trail */}
          <Card className="bg-white border-gray-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-sm font-bold text-[#1A2E1C] flex items-center gap-2">
                <History className="h-4 w-4 text-emerald-700" />
                Audit Trail & Event History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4 text-center">
                  Zero audit events recorded yet for this member.
                </p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between border-l-2 border-emerald-500 pl-3 py-1 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 capitalize">
                          {log.action.replace(/_/g, ' ')}
                        </p>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                            {JSON.stringify(log.metadata)}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                        {new Date(log.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <WordUploadModal
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        userId={profile.id}
        memberName={fullName}
      />
    </div>
  );
}

export default function MemberDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF7] py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#075B2B]" />
          <p className="mt-2 text-xs text-gray-500">Loading member details...</p>
        </div>
      }
    >
      <div className="min-h-screen bg-[#FFFDF7]">
        <AdminNav />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <MemberDetailContent />
        </main>
      </div>
    </Suspense>
  );
}
