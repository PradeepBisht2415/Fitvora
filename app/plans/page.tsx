import Link from 'next/link';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Check, Sparkles, HeartHandshake, ShieldCheck } from 'lucide-react';

export function generateMetadata() {
  return {
    title: 'Plans & Transparent Pricing — ₹499 & ₹999/month',
    description:
      'Explore Fitvora monthly plans. Normal ₹499/mo and Premium ₹999/mo. Equal diet plan quality for all members. Cancel anytime.',
  };
}

export default function PlansPage() {
  const comparisonRows = [
    {
      feature: 'Personalized 7-Day Indian Home Meal Plan',
      normal: 'Included',
      premium: 'Included — Exact same planning quality',
    },
    {
      feature: 'Portion Sizes in Standard Indian Units (katori, roti)',
      normal: 'Included',
      premium: 'Included',
    },
    {
      feature: 'Ingredient Lists & Home Meal Swap Alternatives',
      normal: 'Included',
      premium: 'Included',
    },
    {
      feature: 'Interactive Dashboard & Daily Meal Viewer',
      normal: 'Included',
      premium: 'Included',
    },
    {
      feature: 'Weight Progress Tracker with Trend Visualizer',
      normal: 'Included',
      premium: 'Included',
    },
    {
      feature: 'Support Inbox Access',
      normal: 'Standard Queue',
      premium: 'Priority Support Queue',
    },
    {
      feature: 'Weekly Structured Check-Ins & Adherence Guidance',
      normal: '—',
      premium: 'Included (Every Week)',
    },
    {
      feature: 'Personalized Routine Tuning & Portion Calibration',
      normal: '—',
      premium: 'Included',
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
              Honest Pricing
            </span>
            <h1 className="text-4xl font-extrabold text-forest-green sm:text-5xl">
              Plans Built on Respect, Not Upsells
            </h1>
            <p className="text-base text-muted-text leading-relaxed">
              We never hold back good nutrition for a higher tier. Both ₹499 and ₹999 members
              receive the exact same high standard of customized Indian diet planning.
            </p>

            <div className="inline-flex items-center gap-2 rounded-2xl bg-pale-green border border-forest-green/20 px-5 py-2.5 text-xs font-semibold text-forest-green">
              <HeartHandshake className="h-4 w-4 shrink-0 text-fresh-green" />
              <span>
                Our Invariant Pledge: Premium adds priority guidance and weekly reviews, not an inherently &ldquo;better&rdquo; diet.
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Normal Plan */}
            <Card className="border-border-soft bg-white p-2 flex flex-col justify-between shadow-sm">
              <div>
                <CardHeader className="space-y-2 p-6 pb-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-text">
                    Normal Plan
                  </div>
                  <CardTitle className="text-3xl font-black text-forest-green">
                    ₹499 <span className="text-xs font-normal text-muted-text">/ month</span>
                  </CardTitle>
                  <p className="text-xs text-muted-text leading-relaxed">
                    Designed for self-directed individuals who want an authentic, expertly curated Indian home-food meal structure.
                  </p>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 font-semibold">
                    <Check className="h-4 w-4 text-fresh-green" />
                    <span>Full 7-day personalized Indian meal plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-fresh-green" />
                    <span>Exact serving sizes & ingredient notes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-fresh-green" />
                    <span>Smart home-food alternative swaps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-fresh-green" />
                    <span>Weight tracking & trend visualization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-fresh-green" />
                    <span>Standard support inbox</span>
                  </div>
                </CardContent>
              </div>
              <CardFooter className="p-6 pt-0">
                <Link href="/assessment" className="w-full">
                  <Button variant="outline" className="w-full font-bold">
                    Start Assessment for ₹499
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-forest-green bg-white p-2 flex flex-col justify-between shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-forest-green text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-bl-xl flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Priority Guidance
              </div>
              <div>
                <CardHeader className="space-y-2 p-6 pb-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-forest-green">
                    Premium Plan
                  </div>
                  <CardTitle className="text-3xl font-black text-forest-green">
                    ₹999 <span className="text-xs font-normal text-muted-text">/ month</span>
                  </CardTitle>
                  <p className="text-xs text-muted-text leading-relaxed">
                    For members who thrive with weekly accountability, habit troubleshooting, and priority team responses.
                  </p>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 font-bold text-forest-green">
                    <Check className="h-4 w-4 text-fresh-green" />
                    <span>Same high-standard customized diet plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-fresh-green" />
                    <span>Exact serving sizes & ingredient notes</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <Check className="h-4 w-4 text-fresh-green" />
                    <span>Weekly structured check-ins & adherence feedback</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <Check className="h-4 w-4 text-fresh-green" />
                    <span>Priority support queue for rapid assistance</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <Check className="h-4 w-4 text-fresh-green" />
                    <span>Direct routine adjustments as your body adapts</span>
                  </div>
                </CardContent>
              </div>
              <CardFooter className="p-6 pt-0">
                <Link href="/assessment" className="w-full">
                  <Button variant="fresh" className="w-full font-bold shadow-sm">
                    Start Assessment for ₹999
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Full Comparison Table */}
          <div className="rounded-3xl border border-border-soft bg-white p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-xl font-bold text-forest-green text-center">
              Comprehensive Feature Comparison
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-soft text-muted-text font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Inclusion / Feature</th>
                    <th className="py-3 px-4">Normal (₹499)</th>
                    <th className="py-3 px-4 text-forest-green">Premium (₹999)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="hover:bg-pale-green/20">
                      <td className="py-3 px-4 font-semibold text-dark-text">
                        {row.feature}
                      </td>
                      <td className="py-3 px-4 text-muted-text">{row.normal}</td>
                      <td className="py-3 px-4 font-bold text-forest-green">
                        {row.premium}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trust and Policy Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-muted-text">
            <div className="rounded-2xl border border-border-soft bg-white p-4 space-y-1">
              <ShieldCheck className="h-5 w-5 text-forest-green mx-auto mb-1" />
              <strong className="block text-dark-text">Zero Lock-In</strong>
              <span>Cancel your renewal with one click from your dashboard at any time.</span>
            </div>
            <div className="rounded-2xl border border-border-soft bg-white p-4 space-y-1">
              <HeartHandshake className="h-5 w-5 text-fresh-green mx-auto mb-1" />
              <strong className="block text-dark-text">No Extreme Supplements</strong>
              <span>100% natural Indian home foods prepared in your family kitchen.</span>
            </div>
            <div className="rounded-2xl border border-border-soft bg-white p-4 space-y-1">
              <Sparkles className="h-5 w-5 text-forest-green mx-auto mb-1" />
              <strong className="block text-dark-text">All Taxes Included</strong>
              <span>Transparent INR prices with no surprise charges or hidden fees.</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
