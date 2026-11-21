'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/db/supabase-browser';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { BrandCharacter } from '@/components/ui/brand-character';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

function ResetPasswordContent() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  // Check if arriving from a recovery link
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsUpdateMode(true);
      }
    });
  }, [supabase]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess('Password reset link sent! Please check your email inbox.');
      }
    } catch (err) {
      console.error('Password reset request error:', err);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess('Password updated successfully! You can now log in with your new password.');
      }
    } catch (err) {
      console.error('Password update error:', err);
      setError('Failed to update password. Please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF7]">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex justify-center mb-3">
              <BrandCharacter variant="coach" className="w-20 h-20 mx-auto rounded-full" priority />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A2E1C]">
              {isUpdateMode ? 'Set New Password' : 'Reset Your Password'}
            </h1>
            <p className="mt-2 text-sm text-[#1A2E1C]/70">
              {isUpdateMode
                ? 'Enter your new secure password below'
                : 'We will send a secure password recovery link to your email'}
            </p>
          </div>

          <Card className="border-emerald-100 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#1A2E1C]">
                {isUpdateMode ? 'New Credentials' : 'Password Recovery'}
              </CardTitle>
              <CardDescription>
                {isUpdateMode
                  ? 'Minimum 8 characters with a mix of letters and numbers'
                  : 'Enter the email address tied to your Fitvora account'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              {isUpdateMode ? (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-[#1A2E1C]"
                    >
                      New Password
                    </label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-4 w-4 text-emerald-700/60" />
                      </div>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                      Confirm New Password
                    </label>
                    <div className="relative mt-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lock className="h-4 w-4 text-emerald-700/60" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {loading ? 'Updating Password...' : 'Save New Password'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRequestReset} className="space-y-4">
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

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#075B2B] text-white hover:bg-[#075B2B]/90 font-medium py-2.5"
                  >
                    {loading ? 'Sending Recovery Link...' : 'Send Recovery Link'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-2 border-t border-emerald-50 bg-[#FFFDF7]/60 p-4 text-center text-xs text-[#1A2E1C]/70">
              <p>
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-[#075B2B] hover:underline"
                >
                  Back to Sign In
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075B2B]"></div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
