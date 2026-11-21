import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Inbox } from 'lucide-react';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { BrandCharacter } from '@/components/ui/brand-character';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-warm-cream">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              {/* Left Column: Value Proposition */}
              <div className="space-y-6 lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-forest-green/20 bg-pale-green px-4 py-1.5 text-xs font-bold text-forest-green">
                  <Sparkles className="h-4 w-4 text-fresh-green" />
                  <span>Real Indian Home Food • No Crash Diets</span>
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-forest-green sm:text-5xl lg:text-6xl leading-[1.15]">
                  Sustainable Weight Goals with{' '}
                  <span className="text-fresh-green underline decoration-pale-green underline-offset-4">
                    Ghar Ka Khana
                  </span>
                </h1>

                <p className="max-w-2xl text-lg leading-relaxed text-muted-text">
                  Personalized weight-loss and weight-gain meal plans built around your
                  family kitchen, regional tastes, and daily schedule. No unproven supplements,
                  no extreme calorie counting, and no starvation.
                </p>

                {/* Primary CTA Cluster */}
                <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center pt-2">
                  <Link href="/assessment">
                    <Button variant="fresh" size="lg" className="w-full sm:w-auto font-bold text-base shadow-md">
                      Start My Journey
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/how-it-works">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
                      See How It Works
                    </Button>
                  </Link>
                </div>

                {/* Trust Pills */}
                <div className="pt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs font-semibold text-dark-text/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-fresh-green shrink-0" />
                    <span>Free Assessment (No Account)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-fresh-green shrink-0" />
                    <span>Individualized Plans from ₹499/mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-forest-green shrink-0" />
                    <span>Human Reviewed by Founder</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Consistent Brand Ambassador */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-md">
                  <BrandCharacter
                    variant="hero"
                    priority={true}
                    className="shadow-xl border-4 border-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Phase 0 System & Design Token Showcase */}
        <section className="border-t border-border-soft bg-white/70 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-fresh-green">
                Phase 0 Foundation
              </span>
              <h2 className="text-3xl font-extrabold text-forest-green">
                Fitvora Design System & Architecture Verification
              </h2>
              <p className="text-sm text-muted-text">
                Verifying typography, color tokens, button variants, status indicators, and truthful zero-data empty states.
              </p>
            </div>

            {/* Color Palette Tokens */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="rounded-xl border border-border-soft p-4 bg-forest-green text-white space-y-1">
                <div className="text-xs uppercase opacity-80">Primary</div>
                <div className="font-bold text-sm">Forest Green</div>
                <div className="text-xs font-mono">#075B2B</div>
              </div>
              <div className="rounded-xl border border-border-soft p-4 bg-fresh-green text-white space-y-1">
                <div className="text-xs uppercase opacity-80">Accent / CTA</div>
                <div className="font-bold text-sm">Fresh Green</div>
                <div className="text-xs font-mono">#2FAF37</div>
              </div>
              <div className="rounded-xl border border-pale-green-dark p-4 bg-pale-green text-forest-green space-y-1">
                <div className="text-xs uppercase opacity-80">Tint / Card</div>
                <div className="font-bold text-sm">Pale Green</div>
                <div className="text-xs font-mono">#EAF8E7</div>
              </div>
              <div className="rounded-xl border border-border-soft p-4 bg-warm-cream text-dark-text space-y-1">
                <div className="text-xs uppercase opacity-80">Background</div>
                <div className="font-bold text-sm">Warm Cream</div>
                <div className="text-xs font-mono">#FFFDF7</div>
              </div>
              <div className="rounded-xl border border-border-soft p-4 bg-white text-dark-text space-y-1">
                <div className="text-xs uppercase opacity-80">Surface</div>
                <div className="font-bold text-sm">Pure White</div>
                <div className="text-xs font-mono">#FFFFFF</div>
              </div>
            </div>

            {/* Status Badges Showcase */}
            <Card>
              <CardHeader>
                <CardTitle>Lifecycle & Entitlement Status Tokens</CardTitle>
                <CardDescription>
                  Standardized status badges implemented across assessment triage, subscriptions, and diet plans.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2.5">
                <StatusBadge status="pending_review" />
                <StatusBadge status="approved" />
                <StatusBadge status="needs_info" />
                <StatusBadge status="not_suitable" />
                <StatusBadge status="active" />
                <StatusBadge status="published" />
                <StatusBadge status="draft" />
                <StatusBadge status="expired" />
                <StatusBadge status="normal" />
                <StatusBadge status="premium" />
              </CardContent>
            </Card>

            {/* Truthful Empty State Verification */}
            <Card>
              <CardHeader>
                <CardTitle>Truthful Empty State Component (No Fake Data)</CardTitle>
                <CardDescription>
                  Production launches with zero fake members or reviews. All views implement informative empty states.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={Inbox}
                  title="No Pending Assessments"
                  description="Your assessment inbox is clean. When a prospective member completes the public intake wizard, their submission will appear here for safety review."
                  action={{
                    label: 'Preview Assessment Wizard',
                    href: '/assessment',
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
