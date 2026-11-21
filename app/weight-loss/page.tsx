import Link from 'next/link';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Button } from '@/components/ui/button';
import { BrandCharacter } from '@/components/ui/brand-character';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight, Check, Flame, Heart, Sparkles } from 'lucide-react';

export function generateMetadata() {
  return {
    title: 'Sustainable Weight Loss with Indian Home Food',
    description:
      'Healthy, steady weight loss using familiar Indian home-cooked meals without crash diets, extreme starvation, or synthetic fat burners.',
  };
}

export default function WeightLossPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warm-cream">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-fresh-green">
              Weight Loss Pathway
            </span>
            <h1 className="text-4xl font-extrabold text-forest-green sm:text-5xl">
              Sustainable Weight Loss with Ghar Ka Khana
            </h1>
            <p className="text-base text-muted-text leading-relaxed">
              No starvation. No unpalatable meal replacements. Achieve a steady, healthy
              caloric deficit with warm, comforting Indian home-cooked meals.
            </p>
          </div>

          {/* Hero Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center rounded-3xl border border-border-soft bg-white p-6 sm:p-10 shadow-sm">
            <div className="md:col-span-5 flex justify-center">
              <BrandCharacter
                variant="weight-loss"
                className="w-full max-w-sm rounded-2xl"
              />
            </div>
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-pale-green px-3 py-1 text-xs font-bold text-forest-green">
                <Flame className="h-4 w-4 text-fresh-green" />
                <span>Calorie Density & Satiety Engineering</span>
              </div>
              <h2 className="text-2xl font-bold text-forest-green">
                Eat Real Portions, Stay Full, Drop Inches
              </h2>
              <p className="text-sm text-muted-text leading-relaxed">
                By optimizing the oil, fiber, and protein ratios in everyday Indian dishes—like
                dal tadka, bhindi sabzi, phulkas, and fresh kachumber—you remain energized throughout
                the day without agonizing sugar crashes or late-night binge cravings.
              </p>
              <div className="pt-2">
                <Link href="/assessment">
                  <Button variant="fresh" size="lg" className="font-bold shadow-sm">
                    Start Weight Loss Assessment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Key Principles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="border-border-soft">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pale-green text-forest-green mb-2">
                  <Heart className="h-5 w-5 text-forest-green" />
                </div>
                <CardTitle className="text-lg text-forest-green">Safe 0.5–1 kg/Week Pace</CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed text-muted-text">
                Extreme rapid weight loss almost always results in muscle loss and rebound weight gain.
                Our team structures gradual, lasting progress that preserves your lean metabolic rate.
              </CardContent>
            </Card>

            <Card className="border-border-soft">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pale-green text-forest-green mb-2">
                  <Sparkles className="h-5 w-5 text-fresh-green" />
                </div>
                <CardTitle className="text-lg text-forest-green">Adapt to Family Dinners</CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed text-muted-text">
                Your family cooks together. We show you how to measure your portions and adjust plate ratios
                so you never need to prepare a separate dinner after a long workday.
              </CardContent>
            </Card>

            <Card className="border-border-soft">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pale-green text-forest-green mb-2">
                  <Check className="h-5 w-5 text-fresh-green" />
                </div>
                <CardTitle className="text-lg text-forest-green">Chai & Evening Snacks</CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed text-muted-text">
                Indian 5 PM chai is a cultural ritual. Instead of banning it, we replace deep-fried pakoras
                with satisfying roasted chana, makhana, or sprouted chaat that fits your macros.
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
