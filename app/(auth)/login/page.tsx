'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/db/supabase-browser';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { BrandCharacter } from '@/components/ui/brand-character';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const messageParam = searchParams.get('message');
  const claimedParam = searchParams.get('claimed');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    claimedParam
      ? 'Your assessment account was claimed! Please log in to complete your subscription.'
      : messageParam || null
  );

  const supabase = createClient();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check role to direct admin vs member
        const role =
          (data.user.app_metadata?.['role'] as string) ||
          (data.user.user_metadata?.['role'] as string);

        if (role === 'admin' && redirectTo === '/dashboard') {
          router.push('/admin/assessments');
        } else {
          router.push(redirectTo);
        }
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to log in. Please check your credentials and try again.');
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address to receive a login link.');
      return;
    }

    setMagicLinkLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (magicError) {
        setError(magicError.message);
      } else {
        setSuccessMessage('Magic login link sent to your email! Check your inbox.');
      }
    } catch (err) {
      console.error('Magic link error:', err);
      setError('Failed to send magic link. Please try password login.');
    } finally {
      setMagicLinkLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF7]">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex justify-center mb-3">
              <BrandCharacter variant="salad-lemon" className="w-20 h-20 mx-auto rounded-full" priority />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A2E1C]">
              Welcome back to Fitvora
            </h1>
            <p className="mt-2 text-sm text-[#1A2E1C]/70">
              Sign in to view your customized Indian home-food plan & check-ins
            </p>
          </div>

          <Card className="border-emerald-100 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#1A2E1C]">Member Sign In</CardTitle>
              <CardDescription>
                Enter your credentials or request a magic email link
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
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

              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#1A2E1C]"
                  >
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
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-[#1A2E1C]"
                    >
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
                  disabled={loading}
                  className="w-full bg-[#075B2B] text-white hover:bg-[#075B2B]/90 font-medium py-2.5"
                >
                  {loading ? 'Signing In...' : 'Sign In with Password'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-emerald-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or password-free</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={magicLinkLoading}
                onClick={handleMagicLink}
                className="w-full border-emerald-200 text-[#075B2B] hover:bg-emerald-50 py-2.5"
              >
                {magicLinkLoading ? 'Sending Link...' : 'Email Me a Magic Login Link'}
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2 border-t border-emerald-50 bg-[#FFFDF7]/60 p-4 text-center text-xs text-[#1A2E1C]/70">
              <p>
                Don&apos;t have an account yet?{' '}
                <Link
                  href="/assessment"
                  className="font-semibold text-[#075B2B] hover:underline"
                >
                  Take the Assessment first
                </Link>{' '}
                or{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-[#075B2B] hover:underline"
                >
                  Sign Up directly
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
