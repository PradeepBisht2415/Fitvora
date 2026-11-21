'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyClaimToken, claimAssessmentAccount } from '@/features/auth/claim-action';
import { createClient } from '@/lib/db/supabase-browser';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { BrandCharacter } from '@/components/ui/brand-character';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Lock, Mail, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

function ClaimContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [verifying, setVerifying] = useState(() => !!token);
  const [tokenError, setTokenError] = useState<string | null>(() =>
    !token ? 'No invitation token provided. Please use the link sent to your email.' : null
  );
  const [claimData, setClaimData] = useState<{
    firstName?: string;
    email?: string;
    targetDirection?: string;
  }>({});

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    verifyClaimToken(token).then((res) => {
      if (!isMounted) return;
      setVerifying(false);
      if (!res.valid) {
        setTokenError(res.error || 'Invalid or expired invitation token.');
      } else {
        setClaimData({
          firstName: res.firstName,
          email: res.email,
          targetDirection: res.targetDirection,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (!termsAgreed) {
      setFormError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setSubmitting(true);

    try {
      const claimResult = await claimAssessmentAccount({
        token,
        password,
      });

      if (!claimResult.success) {
        setFormError(claimResult.error || 'Failed to claim account.');
        setSubmitting(false);
        return;
      }

      // Automatically sign in the user
      if (claimData.email) {
        await supabase.auth.signInWithPassword({
          email: claimData.email,
          password,
        });
      }

      // Redirect to checkout with plan selection
      router.push('/checkout?plan=normal');
      router.refresh();
    } catch (err) {
      console.error('Account claim submit error:', err);
      setFormError('An unexpected error occurred. Please try logging in directly.');
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FFFDF7]">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="inline-flex justify-center">
              <BrandCharacter variant="coach" className="w-20 h-20 mx-auto rounded-full" />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075B2B] mx-auto"></div>
            <p className="text-sm font-medium text-[#1A2E1C]/80">
              Verifying your Fitvora invitation...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FFFDF7]">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6">
          <Card className="w-full max-w-md border-red-200 shadow-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl text-[#1A2E1C]">Invitation Issue</CardTitle>
              <CardDescription className="text-red-700/90 text-sm mt-1">
                {tokenError}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-[#1A2E1C]/80">
              <p>
                If you already created your account, you can sign in directly. If your assessment is still pending review, you will receive an email once the founder reviews it.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Link href="/login" className="w-full">
                <Button className="w-full bg-[#075B2B] text-white hover:bg-[#075B2B]/90">
                  Go to Member Sign In
                </Button>
              </Link>
              <Link href="/assessment" className="w-full">
                <Button variant="outline" className="w-full border-emerald-200 text-[#075B2B]">
                  Take New Assessment
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const goalText =
    claimData.targetDirection === 'lose_weight'
      ? 'Weight Loss with Indian Home Meals'
      : claimData.targetDirection === 'gain_weight'
      ? 'Healthy Weight Gain & Muscle Nourishment'
      : 'Healthy Living & Weight Maintenance';

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF7]">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex justify-center mb-3">
              <BrandCharacter variant="celebration" className="w-20 h-20 mx-auto rounded-full" priority />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A2E1C]">
              Welcome, {claimData.firstName}!
            </h1>
            <p className="mt-2 text-sm text-[#1A2E1C]/70">
              Your intake assessment has been approved by the founder. Complete your account to view your tailored Indian home-food plan.
            </p>
          </div>

          <Card className="border-emerald-200 shadow-sm">
            <CardHeader className="pb-3 bg-emerald-50/50 rounded-t-xl border-b border-emerald-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#075B2B]">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified Assessment Claim</span>
              </div>
              <CardTitle className="text-base font-semibold text-[#1A2E1C] mt-1">
                Goal: {goalText}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {formError && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#1A2E1C]"
                  >
                    Verified Email
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-emerald-700/60" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      disabled
                      value={claimData.email || ''}
                      className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Locked to the email used in your approved assessment.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#1A2E1C]"
                  >
                    Create Password (min. 8 characters)
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-emerald-700/60" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full rounded-lg border border-emerald-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#075B2B] focus:outline-none focus:ring-1 focus:ring-[#075B2B]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-[#1A2E1C]"
                  >
                    Confirm Password
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-emerald-700/60" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full rounded-lg border border-emerald-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#075B2B] focus:outline-none focus:ring-1 focus:ring-[#075B2B]"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    id="termsAgreed"
                    name="termsAgreed"
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="h-4 w-4 rounded border-emerald-300 text-[#075B2B] focus:ring-[#075B2B] mt-0.5"
                  />
                  <label htmlFor="termsAgreed" className="text-xs text-[#1A2E1C]/80 leading-snug">
                    I agree to Fitvora&apos;s{' '}
                    <Link href="/terms" className="text-[#075B2B] underline" target="_blank">
                      Terms of Service
                    </Link>{' '}
                    and acknowledge the DPDP-compliant{' '}
                    <Link href="/privacy" className="text-[#075B2B] underline" target="_blank">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#075B2B] text-white hover:bg-[#075B2B]/90 font-medium py-2.5"
                >
                  {submitting ? 'Claiming Account...' : 'Claim Account & Continue'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-emerald-50 bg-[#FFFDF7]/60 p-4 text-xs text-[#1A2E1C]/70">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-[#2FAF37]" />
                Zero crash diets • Realistic Indian ghar ka khana
              </span>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075B2B]"></div>
        </div>
      }
    >
      <ClaimContent />
    </Suspense>
  );
}
