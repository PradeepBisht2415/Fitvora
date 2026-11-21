import Link from 'next/link';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Button } from '@/components/ui/button';
import { BrandCharacter } from '@/components/ui/brand-character';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight, ClipboardCheck, UserCheck, Utensils, MessageSquareHeart } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      step: 'Step 1',
      title: 'Free Intake Assessment',
      icon: ClipboardCheck,
      desc: 'Complete our 6-step intake wizard covering your wake/sleep timings, shift schedule (including night shifts), food allergies, regional cooking preferences, and health history.',
      highlight: 'Takes 3 minutes • 100% confidential under DPDP Act',
    },
    {
      step: 'Step 2',
      title: 'Expert Safety Review',
      icon: UserCheck,
      desc: 'Our nutrition team personally reviews your intake data. We screen for red flags (pregnancy, eating disorders, complex clinical conditions) to ensure our home-food wellness service is safe for you. If suitable, you receive an invitation to join.',
      highlight: 'Typical turnaround: 12 to 24 hours',
    },
    {
      step: 'Step 3',
      title: 'Account Creation & Plan Choice',
      icon: Utensils,
      desc: 'Activate your membership by choosing either the Normal Plan (₹499/mo) or the Premium Plan (₹999/mo). Both tiers receive the exact same standard of personalized diet planning.',
      highlight: '₹499 (Normal) or ₹999 (Premium) • Monthly recurring',
    },
    {
      step: 'Step 4',
      title: 'Your Tailored 7-Day Meal Schedule',
      icon: MessageSquareHeart,
      desc: 'Access your private member dashboard with today’s meals, exact portion sizes (e.g., 2 phulkas, 1 bowl dal), home food alternatives, and prep notes that seamlessly fit into your family kitchen.',
      highlight: 'Updated weekly • Print or view on your smartphone',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-warm-cream">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-fresh-green">
              Our Methodology
            </span>
            <h1 className="text-4xl font-extrabold text-forest-green sm:text-5xl">
              How Fitvora Works
            </h1>
            <p className="text-base text-muted-text leading-relaxed">
              From your initial assessment to your customized weekly home-food plan,
              here is how we help you reach your body goals honestly and sustainably.
            </p>
          </div>

          {/* Character & Core Promise */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center rounded-3xl border border-border-soft bg-white p-6 sm:p-10 shadow-sm">
            <div className="md:col-span-5 flex justify-center">
              <BrandCharacter
                variant="nutrition-guide"
                className="w-full max-w-sm rounded-2xl"
              />
            </div>
            <div className="md:col-span-7 space-y-4">
              <h2 className="text-2xl font-bold text-forest-green">
                No Crash Diets. No Synthetic Powders.
              </h2>
              <p className="text-sm text-muted-text leading-relaxed">
                Most diet plans fail because they ask you to cook separate foreign meals like
                avocados and quinoa, or drink chemical meal replacements. Fitvora succeeds because
                we adapt to what your household actually eats: rotis, dals, sabzis, rice, and fresh salads.
              </p>
              <div className="pt-2">
                <Link href="/assessment">
                  <Button variant="fresh" size="lg" className="font-bold shadow-sm">
                    Start Your Assessment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Step by Step Breakdown */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-forest-green text-center">
              The 4-Step Member Journey
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {steps.map((st) => {
                const Icon = st.icon;
                return (
                  <Card key={st.step} className="border-border-soft bg-white">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pale-green text-forest-green">
                        <Icon className="h-6 w-6 stroke-[2]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-fresh-green block uppercase">
                          {st.step}
                        </span>
                        <CardTitle className="text-lg text-forest-green">
                          {st.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                      <p className="text-xs leading-relaxed text-muted-text">
                        {st.desc}
                      </p>
                      <div className="text-[11px] font-bold text-forest-green bg-pale-green/50 px-3 py-1.5 rounded-lg border border-pale-green-dark">
                        {st.highlight}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
