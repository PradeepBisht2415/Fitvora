'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Application error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7] p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6 text-amber-700" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#1A2E1C]">Something went wrong</h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {error?.message?.includes('Missing NEXT_PUBLIC_SUPABASE_URL') ||
            error?.message?.includes('SUPABASE_SERVICE_ROLE_KEY')
              ? 'Supabase environment variables are missing in Vercel. Please add them in your Vercel Project Settings.'
              : error?.message || 'An unexpected error occurred while loading this page.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="bg-[#075B2B] hover:bg-[#05401E] text-white text-xs font-bold"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = '/';
            }}
            className="text-xs font-semibold"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
