'use client';

import React, { useState } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  sanitizeAssessmentForExport,
  generateAssessmentDocHtml,
  generateAssessmentCsv,
  generateAssessmentText,
} from '@/lib/export/assessment-exporter';
import type { Assessment } from '@/types/database.types';

interface AssessmentDownloadButtonProps {
  assessmentId: string;
  clientName?: string;
  assessmentData?: Partial<Assessment> | Record<string, unknown> | null;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'outline' | 'default' | 'fresh' | 'secondary';
  className?: string;
  showPrivacyBadge?: boolean;
}

export function AssessmentDownloadButton({
  assessmentId,
  clientName = 'Client',
  assessmentData,
  size = 'sm',
  variant = 'outline',
  className = '',
  showPrivacyBadge = true,
}: AssessmentDownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const triggerBlobDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (format: 'doc' | 'csv' | 'txt' | 'print') => {
    setDownloading(true);
    setIsOpen(false);

    try {
      // 1. If print mode requested:
      if (format === 'print') {
        const sanitized = sanitizeAssessmentForExport(
          assessmentData || { id: assessmentId, first_name: clientName }
        );
        const html = generateAssessmentDocHtml(sanitized);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 350);
        }
        return;
      }

      const safeName = (clientName || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
      const shortId = assessmentId.slice(0, 8);

      // 2. Client-side instant download if assessmentData is provided
      if (assessmentData) {
        const sanitized = sanitizeAssessmentForExport(assessmentData);

        if (format === 'doc') {
          const content = generateAssessmentDocHtml(sanitized);
          triggerBlobDownload(
            content,
            `Fitvora_Assessment_${safeName}_${shortId}.doc`,
            'application/msword;charset=utf-8'
          );
        } else if (format === 'csv') {
          const content = generateAssessmentCsv([sanitized]);
          triggerBlobDownload(
            content,
            `Fitvora_Assessment_${safeName}_${shortId}.csv`,
            'text/csv;charset=utf-8'
          );
        } else if (format === 'txt') {
          const content = generateAssessmentText(sanitized);
          triggerBlobDownload(
            content,
            `Fitvora_Assessment_${safeName}_${shortId}.txt`,
            'text/plain;charset=utf-8'
          );
        }
        return;
      }

      // 3. Otherwise download via the API endpoint
      const res = await fetch(`/api/admin/assessments/${assessmentId}/download?format=${format}`);
      if (!res.ok) {
        throw new Error('Failed to download assessment file');
      }

      const blob = await res.blob();
      const ext = format === 'csv' ? 'csv' : format === 'txt' ? 'txt' : 'doc';
      const filename = `Fitvora_Assessment_${safeName}_${shortId}.${ext}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback direct link
      window.open(`/api/admin/assessments/${assessmentId}/download?format=${format}`, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant={variant}
          size={size}
          onClick={() => handleDownload('doc')}
          disabled={downloading}
          className="gap-1.5 font-bold text-xs bg-white hover:bg-emerald-50 text-[#075B2B] border-emerald-300 shadow-2xs"
          title="Download sanitized Assessment Word Document (.doc) — Email and phone omitted"
        >
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5 text-[#075B2B]" />
          )}
          <span>Download Form (.doc)</span>
        </Button>

        <Button
          type="button"
          variant={variant}
          size={size}
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={downloading}
          className="px-1.5 font-bold text-xs bg-white hover:bg-emerald-50 text-[#075B2B] border-emerald-300 shadow-2xs"
          title="More download options"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </div>

      {showPrivacyBadge && (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
          <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
          <span>Email & Phone omitted in downloaded files</span>
        </div>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 z-50 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
              Download Assessment File
            </div>

            <button
              type="button"
              onClick={() => handleDownload('doc')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-gray-700 hover:bg-emerald-50 hover:text-[#075B2B]"
            >
              <FileText className="h-4 w-4 text-emerald-700" />
              <div>
                <div className="font-bold">Word Document (.doc)</div>
                <div className="text-[10px] text-gray-400">Formatted for Word / Docs</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDownload('csv')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-gray-700 hover:bg-emerald-50 hover:text-[#075B2B]"
            >
              <FileSpreadsheet className="h-4 w-4 text-blue-700" />
              <div>
                <div className="font-bold">Spreadsheet (.csv)</div>
                <div className="text-[10px] text-gray-400">Excel / Google Sheets</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDownload('print')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-gray-700 hover:bg-emerald-50 hover:text-[#075B2B]"
            >
              <Printer className="h-4 w-4 text-gray-700" />
              <div>
                <div className="font-bold">Print / Save as PDF</div>
                <div className="text-[10px] text-gray-400">Print-ready sanitized view</div>
              </div>
            </button>

            <div className="border-t border-gray-100 mt-1 pt-1.5 px-3 pb-1">
              <span className="text-[10px] text-emerald-800 font-medium flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-600" />
                Email & contact no. redacted
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
