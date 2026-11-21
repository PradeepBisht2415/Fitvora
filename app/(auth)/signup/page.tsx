'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/db/supabase-browser';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { BrandCharacter } from '@/components/ui/brand-character';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { OtpInput } from '@/components/auth/otp-input';
import { Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/assessment';

  // Step: 'info' (enter name & email) -> 'otp' (verify 6-digit code)
  const [step, setStep] = useState<'info' | 'otp'>('info');

  // Step 1 Form state
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Step 2 OTP state
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Notifications
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const interval = setInterval(() => {
      setResendCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCountdown]);

  // Auto-verify when 6 digits are typed
  useEffect(() => {
    if (otpCode.length === 6 && step === 'otp' && !loading) {
      handleVerifyOtp();
    }
  }, [otpCode]);

  // Step 1: Send 6-Digit OTP to Email
  const handleInitiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!termsAgreed) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    if (password && password.length < 8) {
      setError('If setting a password, it must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          data: {
            first_name: firstName.trim(),
            role: 'member',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (otpError) {
        if (otpError.message.toLowerCase().includes('rate limit')) {
          setError(
            'Email rate limit reached. Please wait a minute or sign in at /login.'
          );
        } else {
          setError(otpError.message);
        }
        setLoading(false);
        return;
      }

      // Transition to OTP verification directly with email remembered
      setStep('otp');
      setResendCountdown(30);
      setSuccessMessage(`We sent a 6-digit verification code to ${email.trim()}`);
      setOtpCode('');
    } catch (err) {
      console.error('Signup initiate error:', err);
      setError('Failed to send verification code. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-Digit OTP and Complete Registration
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.length < 6) {
      setError('Please enter the full 6-digit code received on your email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: 'email',
      });

      if (verifyError) {
        setError(verifyError.message || 'Invalid or expired OTP code. Please check your inbox and try again.');
        setLoading(false);
        return;
      }

      if (data.user) {
        // If user set an optional password, save it
        if (password) {
          try {
            await supabase.auth.updateUser({ password });
          } catch (passErr) {
            console.warn('Password update warning:', passErr);
          }
        }

        // Upsert user profile
        await supabase.from('profiles').upsert({
          id: data.user.id,
          first_name: firstName.trim(),
          email: email.trim(),
          role: 'member',
          timezone: 'Asia/Kolkata',
        });

        // Forward to the assessment or destination
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      console.error('Signup verify error:', err);
      setError('Failed to verify OTP code. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF7]">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex justify-center mb-3">
              <BrandCharacter variant="celebration" className="w-20 h-20 mx-auto rounded-full" priority />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A2E1C]">
              Create Your Fitvora Account
            </h1>
            <p className="mt-2 text-sm text-[#1A2E1C]/70">
              Join to access your personalized Indian home-food meal schedule
            </p>
          </div>

          <Card className="border-emerald-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#075B2B] uppercase tracking-wide">
                <ShieldCheck className="h-4 w-4 text-[#075B2B]" />
                <span>{step === 'info' ? 'Step 1: Your Details' : 'Step 2: Enter 6-Digit OTP'}</span>
              </div>
              <CardTitle className="text-lg text-[#1A2E1C] mt-1">
                {step === 'info' ? 'Direct Member Registration' : 'Verify Your Email'}
              </CardTitle>
              <CardDescription>
                {step === 'info'
                  ? 'Enter your name and email to receive your instant login code'
                  : `Enter the 6-digit code sent to ${email}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* ----------------- STEP 1: INFO FORM ----------------- */}
              {step === 'info' ? (
                <form onSubmit={handleInitiateSignup} className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#1A2E1C]">
                      First Name
                    </label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <User className="h-4 w-4 text-emerald-700/60" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Aarav"
                        className="block w-full rounded-lg border border-emerald-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#075B2B] focus:outline-none focus:ring-1 focus:ring-[#075B2B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#1A2E1C]">
                      Email Address
                    </label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-4 w-4 text-emerald-700/60" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="block w-full rounded-lg border border-emerald-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#075B2B] focus:outline-none focus:ring-1 focus:ring-[#075B2B]"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500">
                      We will send your 6-digit verification code to this address.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-[#1A2E1C]">
                        Password <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                      </label>
                    </div>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-4 w-4 text-emerald-700/60" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Optional password for traditional login"
                        className="block w-full rounded-lg border border-emerald-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#075B2B] focus:outline-none focus:ring-1 focus:ring-[#075B2B]"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      id="termsAgreed"
                      name="termsAgreed"
                      type="checkbox"
                      required
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="h-4 w-4 rounded border-emerald-300 text-[#075B2B] focus:ring-[#075B2B] mt-0.5"
                    />
                    <label htmlFor="termsAgreed" className="text-xs text-[#1A2E1C]/80 leading-snug">
                      I agree to Fitvora&apos;s{' '}
                      <Link href="/terms" className="text-[#075B2B] underline" target="_blank">
                        Terms of Service
                      </Link>{' '}
                      and acknowledge the{' '}
                      <Link href="/privacy" className="text-[#075B2B] underline" target="_blank">
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#075B2B] text-white hover:bg-[#075B2B]/90 font-bold py-2.5 shadow-2xs"
                  >
                    {loading ? 'Sending 6-Digit OTP...' : 'Send 6-Digit OTP Code'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              ) : (
                /* ----------------- STEP 2: DIRECT OTP VERIFY ----------------- */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="text-xs text-gray-500">Enter the 6-digit code sent to:</div>
                    <div className="font-bold text-sm text-[#1A2E1C] flex items-center justify-center gap-2">
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('info');
                          setOtpCode('');
                          setError(null);
                        }}
                        className="text-xs font-semibold text-[#075B2B] hover:underline"
                      >
                        (Edit details)
                      </button>
                    </div>
                  </div>

                  {/* 6-Digit Input */}
                  <div className="py-2">
                    <OtpInput
                      value={otpCode}
                      onChange={setOtpCode}
                      length={6}
                      disabled={loading}
                      autoFocus={true}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="w-full bg-[#075B2B] text-white hover:bg-[#075B2B]/90 font-bold py-2.5 shadow-2xs"
                  >
                    {loading ? 'Verifying...' : 'Verify & Complete Sign Up'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>Didn&apos;t receive the code?</span>
                    {resendCountdown > 0 ? (
                      <span className="font-medium text-gray-400">
                        Resend in {resendCountdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleInitiateSignup(e)}
                        disabled={loading}
                        className="font-bold text-[#075B2B] hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                        <span>Resend Code</span>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-2 border-t border-emerald-50 bg-[#FFFDF7]/60 p-4 text-center text-xs text-[#1A2E1C]/70">
              <p>
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-[#075B2B] hover:underline"
                >
                  Sign In with OTP or Password
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075B2B]"></div>
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
