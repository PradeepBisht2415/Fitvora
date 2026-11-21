'use client';

import * as React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { BrandCharacter } from '@/components/ui/brand-character';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, Mail, ShieldCheck, Copy, Check } from 'lucide-react';

export default function AssessmentCompletePage() {
  const [token] = React.useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('fitvora_assessment_token');
    }
    return null;
  });

  const [firstName] = React.useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('fitvora_first_name');
    }
    return null;
  });

  const [copied, setCopied] = React.useState(false);

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-warm-cream">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-8 text-center sm:text-left">
          {/* Hero Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-28 sm:w-36 shrink-0">
              <BrandCharacter
                variant="coach"
                className="shadow-md border-2 border-white"
              />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-pale-green px-3 py-1 text-xs font-bold text-forest-green">
                <CheckCircle2 className="h-4 w-4 text-fresh-green" />
                <span>Assessment Submitted Successfully</span>
              </div>
              <h1 className="text-3xl font-extrabold text-forest-green">
                Thank You, {firstName || 'Future Member'}!
              </h1>
              <p className="text-sm text-muted-text leading-relaxed">
                Your health and lifestyle intake has been safely received and queued for manual review.
              </p>
            </div>
          </div>

          {/* Opaque Token Card */}
          {token && (
            <Card className="border-forest-green/20 bg-white/80 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-forest-green block">
                      Confidential Reference Token
                    </span>
                    <span className="text-xs font-mono text-muted-text break-all">
                      {token}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={copyToken}
                    className="shrink-0 font-semibold gap-1.5 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-fresh-green" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Token
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* What Happens Next Card */}
          <Card className="border-border-soft">
            <CardHeader>
              <CardTitle className="text-lg text-forest-green">
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-dark-text">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pale-green text-forest-green font-bold text-xs">
                  1
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-fresh-green" />
                    <span>Safety Review (12–24 Hours)</span>
                  </div>
                  <p className="text-xs text-muted-text leading-relaxed">
                    Our nutrition team personally screens your routine, schedule, and health flags to verify that our Indian home-food approach is suitable for your goals.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pale-green text-forest-green font-bold text-xs">
                  2
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-fresh-green" />
                    <span>Invitation & Plan Selection</span>
                  </div>
                  <p className="text-xs text-muted-text leading-relaxed">
                    Once approved, you will receive an invitation email to create your password and choose between Normal (₹499/mo) and Premium (₹999/mo).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pale-green text-forest-green font-bold text-xs">
                  3
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-fresh-green" />
                    <span>Your First 7-Day Personalized Meal Plan</span>
                  </div>
                  <p className="text-xs text-muted-text leading-relaxed">
                    Within 24 hours of joining, your custom day-by-day Indian home meal schedule with portion guidelines and alternatives will be published to your dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="default" className="w-full sm:w-auto">
                Return to Homepage
              </Button>
            </Link>
            <Link href="/plans" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Review Plans & Pricing
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
