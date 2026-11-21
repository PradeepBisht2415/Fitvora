'use client';

import React, { useState } from 'react';
import { cancelSubscriptionAction } from '@/features/billing/subscription-actions';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface CancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscriptionId: string;
  periodEnd: string | null;
}

export function CancelDialog({
  isOpen,
  onClose,
  onSuccess,
  subscriptionId,
  periodEnd,
}: CancelDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formattedDate = periodEnd
    ? new Date(periodEnd).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'the end of your current cycle';

  const handleConfirmCancel = async () => {
    setLoading(true);
    setError(null);

    const res = await cancelSubscriptionAction(subscriptionId);
    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to cancel subscription');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-[#1A2E1C]">Cancel Subscription?</h3>
        </div>

        <p className="text-sm text-[#1A2E1C]/80 leading-relaxed mb-4">
          Are you sure you want to cancel your monthly plan?
        </p>

        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3.5 text-xs text-emerald-950 mb-4 space-y-1">
          <div className="font-semibold text-[#075B2B]">Access Retention:</div>
          <p>
            Your personalized Indian diet schedule, swap options, and dashboard access will remain <strong>fully active until {formattedDate}</strong>.
          </p>
          <p className="text-emerald-800">No further recurring payments will be charged.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onClose}
            className="border-gray-200 text-gray-700"
          >
            Keep My Plan
          </Button>

          <Button
            type="button"
            disabled={loading}
            onClick={handleConfirmCancel}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Cancellation'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
