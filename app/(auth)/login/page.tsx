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
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Sparkles, KeyRound, RefreshCw } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const messageParam = searchParams.get('message');
  const claimedParam = searchParams.get('claimed');
  const tabParam = searchParams.get('tab');
  const emailParam = searchParams.get('email');
  const stepParam = searchParams.get('step');

  // Tabs: 'otp' | 'password'
  const [authMode, setAuthMode] = useState<'otp' | 'password'>(tabParam === 'password' ? 'password' : 'otp');

  // Form states
  const [email, setEmail] = useState(emailParam || '');
  const [password, setPassword] = useState('');

  // OTP states
  const [otpStep, setOtpStep] = useState<'email' | 'verify'>(emailParam && stepParam === 'verify' ? 'verify' : 'email');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(stepParam === 'verify' ? 30 : 0);

  // Password loading
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Status banners
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    claimedParam
      ? 'Your assessment account was claimed! Please sign in to access your dashboard.'
      : messageParam || null
  );

  const supabase = createClient();

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const interval = setInterval(() => {
      setResendCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCountdown]);

  // Auto-submit OTP when all 6 digits are typed
  useEffect(() => {
    if (otpCode.length === 6 && otpStep === 'verify' && !verifyingOtp) {
      handleVerifyOtp();
    }
  }, [otpCode]);

  // 1. Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setPasswordLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('email not confirmed')) {
          setError(
            'Email not confirmed yet. Click "6-Digit Email OTP" tab above to sign in instantly without password confirmation.'
          );
        } else {
          setError(authError.message);
        }
        setPasswordLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile?.role === 'admin' && (redirectTo === '/dashboard' || !searchParams.get('redirectTo'))) {
          router.push('/admin');
        } else {
          router.push(redirectTo);
        }
        router.refresh();
      }
    } catch (err) {
      console.error('Password login error:', err);
      setError('Unable to log in. Please check your credentials and try again.');
      setPasswordLoading(false);
    }
  };

  // 2. Send 6-Digit OTP to Email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address to receive an OTP code.');
      return;
    }

    setOtpLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (otpError) {
        if (otpError.message.toLowerCase().includes('rate limit')) {
          setError('Email rate limit reached. Please wait a minute or log in using password.');
        } else {
          setError(otpError.message);
        }
        setOtpLoading(false);
        return;
      }

      setOtpStep('verify');
      setSuccessMessage(`We sent a 6-digit verification code to ${email.trim()}`);
      setResendCountdown(30);
      setOtpCode('');
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Failed to send OTP code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // 3. Verify 6-Digit OTP Code
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of the code received on your email.');
      return;
    }

    setVerifyingOtp(true);
    setError(null);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: 'email',
      });

      if (verifyError) {
        setError(verifyError.message || 'Invalid or expired OTP code. Please check and try again.');
        setVerifyingOtp(false);
        return;
      }

      if (data.user) {
        // Ensure profile exists for the user
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profile) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email || email.trim(),
            first_name: data.user.user_metadata?.first_name || '',
            role: 'member',
            timezone: 'Asia/Kolkata',
          });
        }

        if (profile?.role === 'admin' && (redirectTo === '/dashboard' || !searchParams.get('redirectTo'))) {
          router.push('/admin');
        } else {
          router.push(redirectTo);
        }
        router.refresh();
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Failed to verify OTP code. Please try again.');
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF7]">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo / Mascot Header */}
          <div className="text-center mb-6">
            <div className="inline-flex justify-center mb-3">
              <BrandCharacter variant="salad-lemon" className="w-20 h-20 mx-auto rounded-full" priority />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A2E1C]">
              Welcome back to Fitvora
            </h1>
            <p className="mt-2 text-sm text-[#1A2E1C]/70">
              Sign in to view your customized Indian home-food plan &amp; check-ins
            </p>
          </div>

          <Card className="border-emerald-100 shadow-sm overflow-hidden">
            {/* Auth Mode Tabs */}
            <div className="grid grid-cols-2 border-b border-emerald-100 bg-emerald-50/40 text-xs font-semibold text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp');
                  setError(null);
                }}
                className={`py-3 px-4 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  authMode === 'otp'
                    ? 'border-[#075B2B] bg-white text-[#075B2B] font-bold shadow-2xs'
                    : 'border-transparent text-gray-500 hover:text-[#1A2E1C] hover:bg-emerald-50/70'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-[#075B2B]" />
                <span>6-Digit Email OTP</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setError(null);
                }}
                className={`py-3 px-4 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  authMode === 'password'
                    ? 'border-[#075B2B] bg-white text-[#075B2B] font-bold shadow-2xs'
                    : 'border-transparent text-gray-500 hover:text-[#1A2E1C] hover:bg-emerald-50/70'
                }`}
              >
                <KeyRound className="h-3.5 w-3.5 text-gray-500" />
                <span>Password</span>
              </button>
            </div>

            <CardHeader className="pb-3 pt-5">
              <CardTitle className="text-lg text-[#1A2E1C]">
                {authMode === 'otp' ? 'Instant OTP Sign In' : 'Sign In with Password'}
              </CardTitle>
              <CardDescription>
                {authMode === 'otp'
                  ? 'Password-free login with a 6-digit code sent straight to your email'
                  : 'Enter your account email and password credentials'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Alert Messages */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* ----------------- TAB 1: EMAIL OTP FLOW ----------------- */}
              {authMode === 'otp' && (
                <div>
                  {otpStep === 'email' ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label htmlFor="otp-email" className="block text-sm font-medium text-[#1A2E1C]">
                          Email Address
                        </label>
                        <div className="relative mt-1">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Mail className="h-4 w-4 text-emerald-700/60" />
                          </div>
                          <input
                            id="otp-email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="block w-full rounded-lg border border-emerald-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#075B2B] focus:outline-none focus:ring-1 focus:ring-[#075B2B]"
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-gray-500">
                          We will send a 6-digit verification code to this inbox.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={otpLoading}
                        className="w-full bg-[#075B2B] text-white hover:bg-[#075B2B]/90 font-bold py-2.5 shadow-2xs"
                      >
                        {otpLoading ? 'Sending OTP Code...' : 'Send 6-Digit OTP Code'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="text-center space-y-1">
                        <div className="text-xs text-gray-500">Enter the 6-digit code sent to:</div>
                        <div className="font-bold text-sm text-[#1A2E1C] flex items-center justify-center gap-2">
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpStep('email');
                              setOtpCode('');
                              setError(null);
                            }}
                            className="text-xs font-semibold text-[#075B2B] hover:underline"
                          >
                            (Change)
                          </button>
                        </div>
                      </div>

                      {/* 6-Digit Input Component */}
                      <div className="py-2">
                        <OtpInput
                          value={otpCode}
                          onChange={setOtpCode}
                          length={6}
                          disabled={verifyingOtp}
                          autoFocus={true}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={verifyingOtp || otpCode.length < 6}
                        className="w-full bg-[#075B2B] text-white hover:bg-[#075B2B]/90 font-bold py-2.5 shadow-2xs"
                      >
                        {verifyingOtp ? 'Verifying Code...' : 'Verify & Sign In'}
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
                            onClick={() => handleSendOtp()}
                            disabled={otpLoading}
                            className="font-bold text-[#075B2B] hover:underline flex items-center gap-1"
                          >
                            <RefreshCw className={`h-3 w-3 ${otpLoading ? 'animate-spin' : ''}`} />
                            <span>Resend Code</span>
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ----------------- TAB 2: PASSWORD LOGIN FLOW ----------------- */}
              {authMode === 'password' && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label htmlFor="pass-email" className="block text-sm font-medium text-[#1A2E1C]">
                      Email Address
                    </label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-4 w-4 text-emerald-700/60" />
                      </div>
                      <input
                        id="pass-email"
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
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-medium text-[#1A2E1C]">
                        Password
                      </label>
                      <Link
                        href="/reset-password"
                        className="text-xs font-semibold text-[#075B2B] hover:text-[#2FAF37] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-4 w-4 text-emerald-700/60" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full rounded-lg border border-emerald-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#075B2B] focus:outline-none focus:ring-1 focus:ring-[#075B2B]"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full bg-[#075B2B] text-white hover:bg-[#075B2B]/90 font-bold py-2.5 shadow-2xs"
                  >
                    {passwordLoading ? 'Signing In...' : 'Sign In with Password'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-2 border-t border-emerald-50 bg-[#FFFDF7]/60 p-4 text-center text-xs text-[#1A2E1C]/70">
              <p>
                Don&apos;t have an account yet?{' '}
                <Link href="/assessment" className="font-semibold text-[#075B2B] hover:underline">
                  Take the Assessment first
                </Link>{' '}
                or{' '}
                <Link href="/signup" className="font-semibold text-[#075B2B] hover:underline">
                  Sign Up
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075B2B]"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
