import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClipboardList, ShieldCheck, UtensilsCrossed, ArrowRight } from 'lucide-react';

export function HowItWorksPreview() {
  const steps = [
    {
      step: '01',
      icon: ClipboardList,
      title: 'Complete Free Assessment',
      desc: 'Tell us your wake time, shift hours, current weight, allergies, and Indian regional food preferences without registering an account upfront.',
    },
    {
      step: '02',
      icon: ShieldCheck,
      title: 'Human Review & Triage',
      desc: 'Our nutrition team personally reviews your schedule and health flags within 12–24h to verify safety and make sure our service is a genuine fit.',
    },
    {
      step: '03',
      icon: UtensilsCrossed,
      title: 'Get Your Custom 7-Day Plan',
      desc: 'Receive your day-by-day meal schedule with exact home portions (e.g. 2 phulkas, 1 bowl dal) and swap alternatives matching your lifestyle.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-warm-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-fresh-green">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-forest-green sm:text-4xl">
            How Fitvora Works
          </h2>
          <p className="text-sm text-muted-text">
            No automated robot diets. Every single member receives a thoughtfully planned,
            human-reviewed Indian home food schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-3xl border border-border-soft bg-white p-8 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pale-green text-forest-green shadow-inner">
                    <Icon className="h-6 w-6 stroke-[2]" />
                  </div>
                  <span className="text-3xl font-black text-pale-green-dark">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-forest-green">{item.title}</h3>
                <p className="text-xs leading-relaxed text-muted-text">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-4">
          <Link href="/assessment">
            <Button variant="fresh" size="lg" className="font-bold shadow-md">
              Start Free Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
