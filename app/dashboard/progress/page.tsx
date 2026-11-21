'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WeightChart } from '@/components/progress/weight-chart';
import { WeightLogModal } from '@/components/progress/weight-log-modal';
import { MilestoneCard } from '@/components/progress/milestone-card';
import { PhotoUploader } from '@/components/progress/photo-uploader';
import { PhotoGallery, type ProgressPhotoItem } from '@/components/progress/photo-gallery';
import { getWeightHistory, deleteWeightEntry } from '@/features/progress/weight-actions';
import type { WeightEntry } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, Calendar, RefreshCw } from 'lucide-react';

function ProgressContent() {
  const searchParams = useSearchParams();
  const asMember = searchParams.get('asMember') || undefined;
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [photos, setPhotos] = useState<ProgressPhotoItem[]>([]);
  const [rangeDays, setRangeDays] = useState<number | undefined>(30);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    Promise.all([
      getWeightHistory(asMember, rangeDays),
      fetch(`/api/me/photos${asMember ? `?asMember=${asMember}` : ''}`).then((r) => (r.ok ? r.json() : { photos: [] })),
    ])
      .then(([res, photoData]) => {
        if (res.success) {
          setEntries(res.data);
        }
        setPhotos(photoData.photos || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading progress data:', err);
        setLoading(false);
      });
  }, [asMember, rangeDays]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Delete this weight entry?')) return;
    const res = await deleteWeightEntry(id);
    if (res.success) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const ranges = [
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
    { label: '90 Days', days: 90 },
    { label: 'All Time', days: undefined },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      {/* Header with quick CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2FAF37]">
            Sustainable Pacing
          </span>
          <h1 className="text-2xl font-extrabold text-[#1A2E1C]">Weight & Body Progress</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track gradual, healthy body weight trends and review personal milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <WeightLogModal onSuccess={loadData} />
          <PhotoUploader onUploaded={loadData} />
        </div>
      </div>

      {/* Milestone Cards */}
      <MilestoneCard entries={entries} />

      {/* Trend Chart with Date Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[#075B2B]" />
            <h2 className="text-sm font-bold text-[#1A2E1C]">Trend Visualizer</h2>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
            {ranges.map((r) => (
              <button
                key={r.label}
                onClick={() => setRangeDays(r.days)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  rangeDays === r.days
                    ? 'bg-white text-[#075B2B] shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <WeightChart entries={entries} />
      </div>

      {/* Two-Column Details: Recent Logs & Private Photo Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Weight Log History */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1A2E1C]">Weight Log History</h3>
              <p className="text-[11px] text-gray-500">All recorded dates</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="h-7 text-xs border-emerald-100"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {entries.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No entries logged yet. Click &quot;Log Today&apos;s Weight&quot; above to start.
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 pr-1">
              {[...entries].reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-2.5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <p className="font-semibold text-[#1A2E1C]">{entry.recorded_at}</p>
                      {entry.notes && (
                        <p className="text-[10px] text-gray-400 truncate max-w-[180px]">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-[#075B2B]">
                      {entry.weight_kg} kg
                    </span>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-gray-300 hover:text-red-600 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Private Progress Photos */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1A2E1C]">Private Progress Photos</h3>
              <p className="text-[11px] text-gray-500">Confidential &amp; optional visual records</p>
            </div>
          </div>

          <PhotoGallery photos={photos} onPhotoDeleted={loadData} />
        </div>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl p-6 text-center text-xs text-gray-500">
          Loading progress tracker...
        </div>
      }
    >
      <ProgressContent />
    </Suspense>
  );
}
