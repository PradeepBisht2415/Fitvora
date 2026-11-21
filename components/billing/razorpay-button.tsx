'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import type { PlanTier } from '@/types/billing.types';

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  image?: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayButtonProps {
  planId: PlanTier;
  disabled?: boolean;
  onConsentError?: () => void;
}

export function RazorpayButton({ planId, disabled = false, onConsentError }: RazorpayButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    setErrorMessage(null);

    if (disabled) {
      onConsentError?.();
      return;
    }

    setLoading(true);

    try {
      // 1. Ensure Razorpay script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setErrorMessage('Failed to load payment gateway. Please check your internet connection and try again.');
        setLoading(false);
        return;
      }

      // 2. Initialize checkout session on server
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          router.push(`/login?redirectTo=/checkout?plan=${planId}`);
          return;
        }
        setErrorMessage(errorData.error || 'Failed to initialize checkout. Please try again.');
        setLoading(false);
        return;
      }

      const checkoutData = await res.json();

      // If instant activation or sandbox mode without live Razorpay keys
      if (checkoutData.activated) {
        router.push(checkoutData.redirectUrl || '/dashboard');
        return;
      }

      // If in sandbox mode without Razorpay script window object or mock mode
      if (!window.Razorpay) {
        // Fallback simulated sandbox checkout for environments where checkout.js is blocked
        setErrorMessage('Payment window could not be opened in current browser sandbox. Directing to dashboard.');
        setTimeout(() => {
          router.push('/dashboard/subscription?status=sandbox_mock');
        }, 1500);
        return;
      }

      // 3. Open Razorpay Checkout modal
      const options: RazorpayOptions = {
        key: checkoutData.keyId,
        subscription_id: checkoutData.subscriptionId,
        name: 'Fitvora Wellness',
        description: `${checkoutData.planName} - Personalized Indian Diet Planning`,
        image: '/images/character/hero-mascot.png',
        handler: function (response: RazorpaySuccessResponse) {
          // Success! Redirect to member portal
          router.push(
            `/dashboard/subscription?status=success&sub_id=${encodeURIComponent(
              response.razorpay_subscription_id
            )}`
          );
        },
        prefill: {
          name: checkoutData.userName,
          email: checkoutData.userEmail,
        },
        theme: {
          color: '#075B2B',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment checkout error:', err);
      setErrorMessage('An unexpected error occurred while starting checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {errorMessage && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-[#075B2B] text-white hover:bg-[#075B2B]/90 font-medium py-3 text-base shadow-sm hover:shadow"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Initializing Payment...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Proceed to Secure Payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-[11px] text-[#1A2E1C]/60">
        <Lock className="h-3 w-3 text-emerald-700" />
        <span>256-Bit SSL Encrypted • Powered by Razorpay</span>
      </div>
    </div>
  );
}
