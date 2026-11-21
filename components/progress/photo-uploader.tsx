'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, ShieldCheck, Loader2 } from 'lucide-react';

interface PhotoUploaderProps {
  onUploaded: () => void;
}

export function PhotoUploader({ onUploaded }: PhotoUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [capturedAt, setCapturedAt] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please select a JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be 5MB or smaller.');
      return;
    }

    setFileName(file.name);
    setFileType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileData) {
      setError('Please choose a photo to upload.');
      return;
    }

    if (!consentGiven) {
      setError('Consent checkbox is mandatory before uploading photos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/me/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_data: fileData,
          file_name: fileName,
          file_type: fileType,
          captured_at: capturedAt,
          consent_given: consentGiven,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setIsOpen(false);
      setFileData(null);
      setNotes('');
      setConsentGiven(false);
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="border-emerald-200 text-xs text-[#075B2B] hover:bg-emerald-50 shadow-xs flex items-center gap-1.5"
      >
        <Camera className="h-4 w-4" />
        <span>Add Progress Photo</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-[#075B2B]">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A2E1C]">Upload Progress Photo</h3>
                <p className="text-xs text-gray-500">Private & encrypted storage</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File input / Preview */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {fileData ? (
                  <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fileData}
                      alt="Preview"
                      className="h-48 w-full object-contain bg-black/5"
                    />
                    <button
                      type="button"
                      onClick={() => setFileData(null)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-[#FFFDF7] p-4 text-center hover:bg-emerald-50/50 transition-colors"
                  >
                    <Upload className="mb-2 h-8 w-8 text-[#075B2B]" />
                    <p className="text-xs font-semibold text-[#1A2E1C]">
                      Click to choose or take a photo
                    </p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      JPG, PNG, or WebP up to 5MB
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Capture Date *
                </label>
                <input
                  type="date"
                  required
                  value={capturedAt}
                  onChange={(e) => setCapturedAt(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-[#1A2E1C] focus:border-[#2FAF37] focus:outline-none focus:ring-2 focus:ring-[#2FAF37]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Front view, morning post-walk"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#2FAF37] focus:outline-none focus:ring-2 focus:ring-[#2FAF37]/20"
                />
              </div>

              {/* Informed Consent Checkbox */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#075B2B] focus:ring-[#075B2B]"
                  />
                  <div className="text-[11px] text-[#1A2E1C] leading-snug">
                    <span className="font-bold flex items-center gap-1 text-[#075B2B]">
                      <ShieldCheck className="h-3.5 w-3.5 inline" /> Confidential Privacy Consent:
                    </span>
                    I understand this photo is stored in private encrypted storage, visible only to me and my founder reviewer for evaluation. It will never be shared publicly or used as promotional material.
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !fileData || !consentGiven}
                  className="bg-[#075B2B] text-white hover:bg-[#064e24] text-xs font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Save Photo'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
