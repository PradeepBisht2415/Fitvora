'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { AdminNav } from '@/components/admin/admin-nav';
import { MetricsSummary, type AdminMetrics } from '@/components/admin/metrics-summary';
import { ActionNeededList, type ActionItem } from '@/components/admin/action-needed-list';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, LayoutDashboard } from 'lucide-react';

function AdminDashboardContent() {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    pendingAssessments: 0,
    activeNormalMembers: 0,
    activePremiumMembers: 0,
    totalActiveMembers: 0,
    openSupportTickets: 0,
    premiumOpenTickets: 0,
    pendingCheckIns: 0,
    plansNeedingPublication: 0,
  });
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isZeroState, setIsZeroState] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(() => {
    fetch('/api/admin/metrics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setMetrics(data.metrics);
          setActionItems(data.actionItems || []);
          setIsZeroState(Boolean(data.isZeroState));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load admin metrics:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <AdminNav />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
        {/* Header with Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2FAF37]">
                Operations Dashboard
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1A2E1C]">Mission Control</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live service metrics, triage pipelines, member health, and team action queues.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a href="/api/admin/export/members-csv" download>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-gray-200 text-xs text-gray-700 hover:bg-gray-50"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export Member CSV
              </Button>
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMetrics}
              className="h-8 border-gray-200 text-xs"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Live Metrics Summary */}
        <MetricsSummary metrics={metrics} />

        {/* Immediate Actions or Truthful Zero-Member Launch State */}
        <ActionNeededList actionItems={actionItems} isZeroState={isZeroState} />
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF7] p-12 text-center text-xs text-gray-400">
          <div className="flex items-center justify-center gap-2">
            <LayoutDashboard className="h-4 w-4 animate-spin text-[#075B2B]" />
            <span>Loading admin mission control...</span>
          </div>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
