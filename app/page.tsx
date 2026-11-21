import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { PathwaysSection } from '@/components/marketing/pathways-section';
import { HowItWorksPreview } from '@/components/marketing/how-it-works-preview';
import { PricingPreview } from '@/components/marketing/pricing-preview';
import { FaqAccordion } from '@/components/marketing/faq-accordion';
import { Button } from '@/components/ui/button';
import { BrandCharacter } from '@/components/ui/brand-character';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-warm-cream">
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero Section */}
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

        {/* 2. Pathways Section (Weight Loss vs Weight Gain) */}
        <PathwaysSection />

        {/* 3. 3-Step Process Teaser */}
        <HowItWorksPreview />

        {/* 4. Plans & Pricing Comparison */}
        <PricingPreview />

        {/* 6. FAQ Accordion */}
        <FaqAccordion />
      </main>

      <Footer />
    </div>
  );
}
