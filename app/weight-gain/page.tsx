import Link from 'next/link';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Button } from '@/components/ui/button';
import { BrandCharacter } from '@/components/ui/brand-character';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight, Check, Dumbbell, ShieldCheck, Zap } from 'lucide-react';

export function generateMetadata() {
  return {
    title: 'Healthy Weight Gain with Indian Home Food',
    description:
      'Gain healthy weight and build vitality with nutrient-dense Indian thalis, wholesome snacks, and balanced surplus nutrition.',
  };
}

export default function WeightGainPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warm-cream">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-fresh-green">
              Weight Gain Pathway
            </span>
            <h1 className="text-4xl font-extrabold text-forest-green sm:text-5xl">
              Nourishing Weight Gain with Indian Thalis
            </h1>
            <p className="text-base text-muted-text leading-relaxed">
              Tired of being told to just &ldquo;eat junk food&rdquo;? Build healthy body mass, strength,
              and steady vitality with delicious, calorie-dense Indian home cooking.
            </p>
          </div>

          {/* Hero Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center rounded-3xl border border-border-soft bg-white p-6 sm:p-10 shadow-sm">
            <div className="md:col-span-5 flex justify-center">
              <BrandCharacter
                variant="weight-gain"
                className="w-full max-w-sm rounded-2xl"
              />
            </div>
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-pale-green px-3 py-1 text-xs font-bold text-forest-green">
                <Dumbbell className="h-4 w-4 text-fresh-green" />
                <span>Nutrient Surplus Without Digestive Distress</span>
              </div>
              <h2 className="text-2xl font-bold text-forest-green">
                Calorie Density from Natural Staples
              </h2>
              <p className="text-sm text-muted-text leading-relaxed">
                We combine healthy fats and proteins—paneer bhurji, whole-milk curd, sprouted
                lentils, nuts, sattu, and ghee-brushed phulkas—so you consume a clean caloric surplus
                without feeling sluggish, bloated, or sick.
              </p>
              <div className="pt-2">
                <Link href="/assessment">
                  <Button variant="fresh" size="lg" className="font-bold shadow-sm">
                    Start Weight Gain Assessment
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
                  <Zap className="h-5 w-5 text-fresh-green" />
                </div>
                <CardTitle className="text-lg text-forest-green">Frequent Nutrient Boosts</CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed text-muted-text">
                If large meals make you uncomfortable, we break your daily intake into 4 or 5 compact,
                nutrient-dense meals paired with satisfying traditional mid-day shakes or lassi.
              </CardContent>
            </Card>

            <Card className="border-border-soft">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pale-green text-forest-green mb-2">
                  <Check className="h-5 w-5 text-fresh-green" />
                </div>
                <CardTitle className="text-lg text-forest-green">Clean Traditional Ingredients</CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed text-muted-text">
                No chemical weight-gainers packed with maltodextrin. We leverage roasted peanuts, til,
                besan laddoos, paneer, and eggs for clean, digestible energy.
              </CardContent>
            </Card>

            <Card className="border-border-soft">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pale-green text-forest-green mb-2">
                  <ShieldCheck className="h-5 w-5 text-forest-green" />
                </div>
                <CardTitle className="text-lg text-forest-green">Personal Metabolic Calibration</CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed text-muted-text">
                Your BMR and daily activity level determine your initial target calories. Weekly weight logs
                let us fine-tune serving sizes so gain remains steady and healthy.
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
