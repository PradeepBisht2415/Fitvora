'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DpdpActions() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (confirmationInput !== 'DELETE MY FITVORA ACCOUNT') {
      setError('Please type the exact phrase to confirm deletion.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/me/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: confirmationInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      setIsDeleteModalOpen(false);
      router.push('/?deleted=true');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-3 pt-4 text-xs">
        {/* Export Data */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50/70">
          <div>
            <p className="font-bold text-gray-800">Export Health Data</p>
            <p className="text-gray-500 text-[11px]">
              Download complete machine-readable JSON package of your intake, diet plans, weight logs, and consent history.
            </p>
          </div>
          <a href="/api/me/export-data" download>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 text-xs h-8 shrink-0 hover:bg-gray-100"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download JSON
            </Button>
          </a>
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-red-100 bg-red-50/40">
          <div>
            <p className="font-bold text-red-900">Request Account Deletion</p>
            <p className="text-red-700 text-[11px]">
              Permanently erase personal identity, anonymize assessment records, delete progress photos, and revoke active memberships.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs h-8 shrink-0"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Erase Account
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-red-200">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-red-950">
                  Permanent Account Erasure
                </h3>
                <p className="text-[11px] text-gray-500">
                  DPDP Act 2023 Right to be Forgotten
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              This action is permanent and cannot be undone. All your intake assessment history, published weekly meal plans, progress logs, and stored photos will be irrevocably deleted or anonymized.
            </p>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleDelete} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Type <strong className="text-red-700">DELETE MY FITVORA ACCOUNT</strong> to confirm:
                </label>
                <input
                  type="text"
                  required
                  placeholder="DELETE MY FITVORA ACCOUNT"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-[#1A2E1C] placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={loading}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || confirmationInput !== 'DELETE MY FITVORA ACCOUNT'}
                  className="bg-red-600 text-white hover:bg-red-700 text-xs font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Erasing...
                    </>
                  ) : (
                    'Permanently Erase My Data'
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
