'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/db/supabase-browser';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { BrandCharacter } from '@/components/ui/brand-character';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Lock, Mail, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

function SignupContent() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAgreed) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            role: 'member',
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Create initial profile if needed
        await supabase.from('profiles').upsert({
          id: data.user.id,
          first_name: firstName.trim(),
          email: email.trim(),
          role: 'member',
          timezone: 'Asia/Kolkata',
        });

        // Redirect to checkout or onboarding
        router.push('/checkout');
        router.refresh();
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to create account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF7]">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Recommendation Banner */}
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-[#1A2E1C]">
            <div className="flex items-center gap-2 font-semibold text-[#075B2B]">
              <Sparkles className="h-4 w-4" />
              <span>Recommended First Step: Intake Assessment</span>
            </div>
            <p className="mt-1 text-[#1A2E1C]/80">
              For personalized home-food planning, take our free 3-minute intake assessment before subscribing.
            </p>
            <div className="mt-2">
              <Link
                href="/assessment"
                className="inline-flex items-center text-xs font-semibold text-[#075B2B] hover:underline"
              >
                Take Free Assessment →
              </Link>
            </div>
          </div>

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

          <Card className="border-emerald-100 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#1A2E1C]">Direct Member Registration</CardTitle>
              <CardDescription>
                Sign up to unlock the member dashboard and choose a plan
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-[#1A2E1C]"
                  >
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
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#1A2E1C]"
                  >
                    Password (min. 8 characters)
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
                  disabled={loading}
                  className="w-full bg-[#075B2B] text-white hover:bg-[#075B2B]/90 font-medium py-2.5"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2 border-t border-emerald-50 bg-[#FFFDF7]/60 p-4 text-center text-xs text-[#1A2E1C]/70">
              <p>
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-[#075B2B] hover:underline"
                >
                  Sign In
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
