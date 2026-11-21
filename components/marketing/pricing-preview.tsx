import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Check, Sparkles, HeartHandshake } from 'lucide-react';

export function PricingPreview() {
  return (
    <section className="py-16 md:py-24 bg-warm-cream border-t border-border-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-fresh-green">
            Transparent Pricing
          </span>
          <h2 className="text-3xl font-extrabold text-forest-green sm:text-4xl">
            Simple, Accessible Monthly Plans
          </h2>
          <p className="text-sm text-muted-text">
            No long-term locked contracts. Monthly subscriptions with zero hidden charges.
          </p>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-pale-green/70 border border-forest-green/20 px-4 py-2 text-xs font-semibold text-forest-green">
            <HeartHandshake className="h-4 w-4 shrink-0 text-fresh-green" />
            <span>
              Both tiers receive the <strong>exact same high standard</strong> of individualized diet planning.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Tier 1: Normal Plan */}
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
                  Ideal for self-motivated members looking for an individualized Indian home food structure.
                </p>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-3">
                <ul className="space-y-2.5 text-xs text-dark-text">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-fresh-green shrink-0" />
                    <span>Individualized 7-day Indian home food meal plan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-fresh-green shrink-0" />
                    <span>Exact portion sizes, timings, and ingredient lists</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-fresh-green shrink-0" />
                    <span>Home meal alternatives & recipe substitutions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-fresh-green shrink-0" />
                    <span>Interactive dashboard & weight tracking trend chart</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-fresh-green shrink-0" />
                    <span>Standard support ticketing inbox</span>
                  </li>
                </ul>
              </CardContent>
            </div>

            <CardFooter className="p-6 pt-0">
              <Link href="/assessment" className="w-full">
                <Button variant="outline" className="w-full font-bold">
                  Start Assessment (₹499/mo)
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Tier 2: Premium Plan */}
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
                  Everything in Normal plus weekly structured accountability and founder priority queue.
                </p>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-3">
                <ul className="space-y-2.5 text-xs text-dark-text">
                  <li className="flex items-center gap-2 font-bold text-forest-green">
                    <Check className="h-4 w-4 text-fresh-green shrink-0" />
                    <span>Same premium individualized diet plan quality</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-fresh-green shrink-0" />
                    <span>Exact portion sizes, timings, and ingredient lists</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    <Check className="h-4 w-4 text-fresh-green shrink-0" />
                    <span>Weekly structured check-ins & adherence reviews</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    <Check className="h-4 w-4 text-fresh-green shrink-0" />
                    <span>Priority support queue for questions & swaps</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    <Check className="h-4 w-4 text-fresh-green shrink-0" />
                    <span>Personalized routine tuning & metabolic tweaks</span>
                  </li>
                </ul>
              </CardContent>
            </div>

            <CardFooter className="p-6 pt-0">
              <Link href="/assessment" className="w-full">
                <Button variant="fresh" className="w-full font-bold shadow-sm">
                  Start Assessment (₹999/mo)
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-text">
          Taxes included where applicable. Cancel anytime directly from your member dashboard with zero lock-in.
        </p>
      </div>
    </section>
  );
}
