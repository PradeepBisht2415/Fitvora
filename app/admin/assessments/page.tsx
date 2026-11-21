import Link from 'next/link';
import { AdminNav } from '@/components/admin/admin-nav';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Inbox, Eye, ShieldAlert, Download, FileSpreadsheet } from 'lucide-react';
import { AssessmentDownloadButton } from '@/components/admin/assessment-download-button';
import { createAdminClient } from '@/lib/db/supabase-admin';
import type { Assessment } from '@/types/database.types';

async function getAssessments(): Promise<Assessment[]> {
  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (!hasSupabase) {
    return [];
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error || !data) {
      return [];
    }
    return data as Assessment[];
  } catch (err) {
    console.warn('Could not query assessments from Supabase:', err);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function AdminAssessmentsPage() {
  const assessments = await getAssessments();

  return (
    <div className="min-h-screen bg-warm-cream">
      <AdminNav />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
        <PageHeader
          title="Assessment Triage & Safety Review"
          description="Review incoming visitor wellness assessments, evaluate medical safety flags, and approve candidates for account creation."
          badge={
            <span className="rounded-full bg-pale-green px-3 py-1 text-xs font-bold text-forest-green border border-forest-green/20">
              P0 Launch Desk
            </span>
          }
        />

        {assessments.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No Assessments Yet"
            description="The assessment queue is completely empty. When a visitor completes the public 6-step intake wizard, their details will appear here with automated safety flags."
            action={{
              label: 'Test Public Assessment',
              href: '/assessment',
            }}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="font-bold text-[#075B2B]">{assessments.length}</span> candidates in triage queue
                <span className="hidden sm:inline text-gray-300">•</span>
                <span className="text-[11px] text-gray-500">🔒 Email & phone omitted on exported files for confidentiality</span>
              </div>
              <a
                href="/api/admin/assessments/export"
                download
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#075B2B] hover:bg-emerald-100 transition-colors shadow-2xs shrink-0"
                title="Download all assessments as a sanitized CSV spreadsheet (no email/phone)"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#075B2B]" />
                <span>Export All (Sanitized CSV)</span>
              </a>
            </div>

            {assessments.map((lead) => {
              const routine = (lead.routine_data as Record<string, unknown>) || {};
              const wellness = (lead.health_screening as Record<string, unknown>) || {};
              const conditions = (wellness['conditions'] as string[]) || [];
              const isPregnant = !!wellness['is_pregnant_or_nursing'];
              const hasED = !!wellness['eating_disorder_history'];

              const hasSafetyFlags =
                lead.age < 18 || isPregnant || hasED || (conditions.length > 0 && !conditions.includes('none_of_above'));

              return (
                <Card
                  key={lead.id}
                  className="hover:border-forest-green/40 transition-colors"
                >
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-extrabold text-base text-forest-green">
                          {lead.first_name}
                        </span>
                        <span className="text-xs text-muted-text">
                          ({lead.age} yrs • {lead.height_cm}cm / {lead.weight_kg}kg)
                        </span>
                        <StatusBadge status={lead.status} />
                        {hasSafetyFlags && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                            <ShieldAlert className="h-3 w-3" />
                            Safety Review Flagged
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-muted-text flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                          Phone:{' '}
                          {lead.phone ? (
                            <a
                              href={`tel:${lead.phone}`}
                              className="font-bold text-[#075B2B] hover:underline"
                            >
                              📞 +91 {lead.phone}
                            </a>
                          ) : (
                            <strong className="text-gray-400">N/A</strong>
                          )}
                        </span>
                        <span>
                          Email:{' '}
                          <a
                            href={`mailto:${lead.email}`}
                            className="font-semibold text-gray-700 hover:underline"
                          >
                            {lead.email}
                          </a>
                        </span>
                        <span>
                          Goal:{' '}
                          <strong className="text-dark-text capitalize">
                            {lead.target_direction.replace(/_/g, ' ')}
                          </strong>
                        </span>
                        <span>
                          Shift:{' '}
                          <strong className="text-dark-text capitalize">
                            {(routine['work_shift'] as string)?.replace(/_/g, ' ') || 'Day'}
                          </strong>
                        </span>
                        <span>
                          Submitted:{' '}
                          <strong className="text-dark-text">
                            {new Date(lead.submitted_at).toLocaleDateString()}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <AssessmentDownloadButton
                        assessmentId={lead.id}
                        clientName={lead.first_name}
                        assessmentData={lead}
                        showPrivacyBadge={false}
                      />
                      <Link href={`/admin/assessments/${lead.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 font-bold text-xs">
                          <Eye className="h-3.5 w-3.5 text-forest-green" />
                          Review Lead
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
