'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  Eye,
} from 'lucide-react';
import type { PlanMealSlot } from '@/features/diet-plans/plan-builder-store';

interface WordUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  memberName?: string;
  onParsed?: (data: { meals: PlanMealSlot[]; guidanceNotes: string }) => void;
  redirectToClientDashboardOnPublish?: boolean;
}

export function WordUploadModal({
  isOpen,
  onClose,
  userId,
  memberName = 'Client',
  onParsed,
  redirectToClientDashboardOnPublish = true,
}: WordUploadModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [autoPublish, setAutoPublish] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    daysFound: string[];
    totalMealsParsed: number;
    published: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const isValidFileType = (fileName: string) => {
    const lower = fileName.toLowerCase();
    return lower.endsWith('.pdf') || lower.endsWith('.docx') || lower.endsWith('.doc');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!isValidFileType(file.name)) {
        setError('Please select a PDF (.pdf) or Microsoft Word (.docx) document.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setSuccessData(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!isValidFileType(file.name)) {
        setError('Please select a PDF (.pdf) or Microsoft Word (.docx) document.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setSuccessData(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a weekly diet plan (PDF or Word) file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', userId);
      formData.append('autoPublish', autoPublish ? 'true' : 'false');

      const res = await fetch('/api/admin/diet-plans/upload-word', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse weekly diet file.');
      }

      setSuccessData({
        daysFound: data.daysFound || [],
        totalMealsParsed: data.totalMealsParsed || 0,
        published: Boolean(data.published),
      });

      if (onParsed && data.meals) {
        onParsed({
          meals: data.meals,
          guidanceNotes: data.guidanceNotes || '',
        });
      }

      if (data.published && redirectToClientDashboardOnPublish) {
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <Card className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 bg-[#FFFDF7] p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-[#075B2B]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A2E1C]">Upload Weekly Diet Plan (PDF / Word)</h2>
              <p className="text-xs text-gray-500">
                For client: <strong className="text-[#075B2B]">{memberName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {successData ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-4 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <div>
                <h3 className="font-bold text-emerald-950 text-base">
                  {successData.published ? 'Diet Plan & Meal Timings Published!' : 'Diet Plan Parsed Successfully!'}
                </h3>
                <p className="text-xs text-emerald-800/80 mt-1">
                  Successfully converted weekly diet into {successData.totalMealsParsed} structured meal cards with exact meal times
                  across {successData.daysFound.length || 7} days.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {(successData.daysFound.length > 0 ? successData.daysFound : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map((d) => (
                  <Badge key={d} variant="outline" className="border-emerald-300 bg-white text-emerald-800 text-[10px]">
                    {d}
                  </Badge>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-center gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                  className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                >
                  Done
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    router.push(`/dashboard?asMember=${userId}`);
                  }}
                  size="sm"
                  className="bg-[#075B2B] text-white hover:bg-[#075B2B]/90 text-xs font-bold gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Client Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? 'border-[#075B2B] bg-emerald-50/50'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF8E7] text-[#075B2B] shadow-2xs">
                    <Upload className="h-6 w-6" />
                  </div>
                  {selectedFile ? (
                    <div>
                      <p className="font-bold text-sm text-[#1A2E1C]">{selectedFile.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Click to choose different file
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-xs text-[#1A2E1C]">
                        Drag & drop weekly diet PDF or Word file here, or{' '}
                        <span className="text-[#075B2B] underline">browse</span>
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Supports PDF (.pdf) and Microsoft Word (.docx) files
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Parsing Instructions & Assurance */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3.5 text-xs text-gray-600 space-y-1">
                <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#2FAF37]" />
                  <span>How it works:</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Our system reads your PDF or Word document (detecting exact meal times like 8:00 AM, 1:30 PM, 5:30 PM, 8:30 PM, 7 days Monday–Sunday, meals, portions, and swap options) and renders them in the interactive cards on the client&apos;s live dashboard.
                </p>
              </div>

              {/* Auto-publish checkbox */}
              <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={autoPublish}
                  onChange={(e) => setAutoPublish(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#075B2B] focus:ring-[#075B2B]"
                />
                <span>Automatically publish to client dashboard upon parsing</span>
              </label>

              {error && (
                <div className="rounded-xl border border-destructive/20 bg-red-50 p-3 text-xs font-semibold text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={onClose} disabled={uploading} className="text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile}
                  className="bg-[#075B2B] text-white hover:bg-[#075B2B]/90 text-xs font-bold gap-1.5 shadow-sm"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Parsing Word Document...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      {autoPublish ? 'Upload & Publish to Client' : 'Parse & Review Plan'}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
