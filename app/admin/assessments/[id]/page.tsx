'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import type { Assessment } from '@/types/database.types';

function createSampleLead(id: string): Assessment {
  return {
    id,
    user_id: null,
    draft_token_hash: 'sample_hash',
    first_name: 'Priya',
    email: 'priya.sample@example.com',
    phone: '9876543210',
    age: 28,
    gender: 'female',
    height_cm: 162,
    weight_kg: 68,
    target_direction: 'lose_weight',
    target_weight_kg: 60,
    timeline_weeks: 12,
    routine_data: {
      wake_time: '06:30',
      sleep_time: '23:00',
      work_shift: 'standard_day',
      meal_frequency: '3_meals',
      activity_level: 'lightly_active',
    },
    food_preferences: {
      diet_type: 'vegetarian',
      allergies: ['peanuts'],
      dislikes: ['karela'],
      regional_preference: 'north_indian',
      cooking_access: 'cooks_at_home',
    },
    health_screening: {
      conditions: ['pcos_pcod'],
      is_pregnant_or_nursing: false,
      medications: 'None',
      eating_disorder_history: false,
    },
    consent_version: 'v1.0-2026',
    health_consent_granted: true,
    status: 'pending_review',
    submitted_at: '2026-11-21T07:00:00Z',
    updated_at: '2026-11-21T07:00:00Z',
  };
}

function AssessmentDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.['id'] as string) || 'default_id';

  const [lead, setLead] = React.useState<Assessment>(() => createSampleLead(id));
  const [decision, setDecision] = React.useState<'approved' | 'needs_info' | 'not_suitable'>('approved');
  const [notes, setNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleDecisionSubmit = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/assessments/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          safety_flags: decision === 'approved' ? [] : ['requires_founder_followup'],
          reviewer_notes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit decision');
      }

      setMessage(`Decision saved: Assessment marked as ${decision.toUpperCase()}`);
      setLead((prev) => ({ ...prev, status: decision }));

      setTimeout(() => {
        router.push('/admin/assessments');
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting decision';
      setMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const routine = (lead.routine_data as Record<string, unknown>) || {};
  const preferences = (lead.food_preferences as Record<string, unknown>) || {};
  const wellness = (lead.health_screening as Record<string, unknown>) || {};

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Admin Top Navigation */}
      <header className="border-b border-border-soft bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/admin/assessments"
            className="inline-flex items-center gap-2 text-xs font-bold text-forest-green hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Triage Queue
          </Link>
          <StatusBadge status={lead.status} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6">
        <PageHeader
          title={`Assessment Review: ${lead.first_name}`}
          description={`Submitted on ${new Date(lead.submitted_at).toLocaleDateString()} • ID: ${lead.id}`}
        />

        {message && (
          <div className="rounded-xl border border-forest-green/20 bg-pale-green p-4 text-xs font-bold text-forest-green">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Columns: Lead Details */}
          <div className="md:col-span-2 space-y-6">
            {/* 1. Body & Goal */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-forest-green">1. Body & Wellness Goal</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-text block">Direction:</span>
                  <span className="font-bold text-sm text-forest-green capitalize">
                    {lead.target_direction.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-text block">Height & Weight:</span>
                  <span className="font-bold">
                    {lead.height_cm} cm / {lead.weight_kg} kg (BMI ~{(lead.weight_kg / ((lead.height_cm / 100) ** 2)).toFixed(1)})
                  </span>
                </div>
                <div>
                  <span className="text-muted-text block">Target Weight:</span>
                  <span className="font-bold">{lead.target_weight_kg ? `${lead.target_weight_kg} kg` : 'Gradual progress'}</span>
                </div>
                <div>
                  <span className="text-muted-text block">Timeline:</span>
                  <span className="font-bold">{lead.timeline_weeks ? `${lead.timeline_weeks} weeks` : 'Flexible'}</span>
                </div>
              </CardContent>
            </Card>

            {/* 2. Daily Routine */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-forest-green">2. Daily Routine & Schedule</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-text block">Sleep Window:</span>
                  <span className="font-bold">{routine['wake_time'] as string} to {routine['sleep_time'] as string}</span>
                </div>
                <div>
                  <span className="text-muted-text block">Work Shift:</span>
                  <span className="font-bold capitalize">{(routine['work_shift'] as string)?.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="text-muted-text block">Meal Frequency:</span>
                  <span className="font-bold capitalize">{(routine['meal_frequency'] as string)?.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="text-muted-text block">Activity Level:</span>
                  <span className="font-bold capitalize">{(routine['activity_level'] as string)?.replace(/_/g, ' ')}</span>
                </div>
              </CardContent>
            </Card>

            {/* 3. Taste & Cooking */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-forest-green">3. Food & Regional Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-text block">Diet Type:</span>
                    <span className="font-bold capitalize">{preferences['diet_type'] as string}</span>
                  </div>
                  <div>
                    <span className="text-muted-text block">Regional Style:</span>
                    <span className="font-bold capitalize">{(preferences['regional_preference'] as string)?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-text block">Allergies:</span>
                  <span className="font-bold text-destructive">
                    {((preferences['allergies'] as string[]) || []).join(', ') || 'None reported'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-text block">Dislikes:</span>
                  <span className="font-bold">
                    {((preferences['dislikes'] as string[]) || []).join(', ') || 'None reported'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 4. Health Screening */}
            <Card className="border-forest-green/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-forest-green">4. Health & Medical Screening</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <span className="text-muted-text block">Reported Diagnoses:</span>
                  <span className="font-bold">
                    {((wellness['conditions'] as string[]) || []).join(', ') || 'None of the above'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-text block">Pregnant or Nursing:</span>
                  <span className="font-bold">{wellness['is_pregnant_or_nursing'] ? 'YES ⚠️' : 'No'}</span>
                </div>
                <div>
                  <span className="text-muted-text block">Eating Disorder History:</span>
                  <span className="font-bold">{wellness['eating_disorder_history'] ? 'YES ⚠️' : 'No'}</span>
                </div>
                <div>
                  <span className="text-muted-text block">Medications:</span>
                  <span className="font-bold">{(wellness['medications'] as string) || 'None reported'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Founder Review Action Box */}
          <div className="space-y-6">
            <Card className="border-forest-green shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-forest-green">Founder Decision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Radio Decisions */}
                <div className="space-y-2">
                  {[
                    {
                      id: 'approved',
                      label: 'Approve Lead',
                      desc: 'Eligible for Indian home food plan',
                      icon: CheckCircle2,
                      color: 'text-fresh-green',
                    },
                    {
                      id: 'needs_info',
                      label: 'Needs Clarification',
                      desc: 'Ask about schedule or allergies',
                      icon: AlertTriangle,
                      color: 'text-amber-600',
                    },
                    {
                      id: 'not_suitable',
                      label: 'Not Suitable / Refer Out',
                      desc: 'Clinical condition requires hospital care',
                      icon: XCircle,
                      color: 'text-destructive',
                    },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = decision === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setDecision(opt.id as 'approved' | 'needs_info' | 'not_suitable')
                        }
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-forest-green bg-pale-green/60 ring-2 ring-forest-green/20'
                            : 'border-border-soft bg-white hover:bg-pale-green/20'
                        }`}
                      >
                        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${opt.color}`} />
                        <div>
                          <div className="font-bold text-xs text-dark-text">{opt.label}</div>
                          <div className="text-[10px] text-muted-text">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Reviewer Notes */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-dark-text" htmlFor="review_notes">
                    Internal Founder Notes
                  </label>
                  <Textarea
                    id="review_notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Approved. Swap peanuts for roasted chana in breakfast templates."
                    className="text-xs"
                    rows={3}
                  />
                </div>

                <Button
                  variant="fresh"
                  onClick={handleDecisionSubmit}
                  disabled={isSubmitting}
                  className="w-full font-bold shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Record Decision'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminAssessmentDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-warm-cream p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-forest-green" />
        </div>
      }
    >
      <AssessmentDetailContent />
    </React.Suspense>
  );
}
