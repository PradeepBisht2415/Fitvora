'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, LogIn } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  const isEnvMissing =
    error?.message?.includes('Missing NEXT_PUBLIC_SUPABASE_URL') ||
    error?.message?.includes('SUPABASE_SERVICE_ROLE_KEY');

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-emerald-50 text-[#075B2B] flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6 text-[#075B2B]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#1A2E1C]">
            {isEnvMissing ? 'Setup Required' : 'Unable to Load Dashboard'}
          </h2>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            {isEnvMissing
              ? 'Supabase environment variables are missing on Vercel. Please add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to your Vercel Project Settings.'
              : error?.message || 'We encountered a momentary issue loading your member portal.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="bg-[#075B2B] hover:bg-[#05401E] text-white text-xs font-bold"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Try Again
          </Button>
          <Link href="/login">
            <Button variant="outline" className="text-xs font-semibold">
              <LogIn className="h-3.5 w-3.5 mr-1.5" />
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
