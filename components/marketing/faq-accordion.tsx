'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'Will I have to cook separate food from my family?',
    a: 'No! Fitvora is specifically designed around regular Indian home kitchens. Your plan uses standard dal, roti, sabzi, curd, and rice that your household already prepares, with clear portion and timing adjustments tailored to your goal.',
  },
  {
    q: 'Do I need to buy protein powders, fat burners, or supplements?',
    a: 'Absolutely not. Fitvora relies 100% on natural, culturally familiar Indian whole foods. We do not sell, prescribe, or require any pills, powders, crash detoxes, or synthetic fat-burners.',
  },
  {
    q: 'Is Fitvora a medical clinic or hospital service?',
    a: 'No. Fitvora is a personalized lifestyle wellness and nutrition-support service. We do not diagnose or treat medical illnesses. Prospective members with high-risk conditions, pregnancy, or eating disorders are screened and referred to qualified medical practitioners.',
  },
  {
    q: 'Can this work if I do night shifts or irregular hours?',
    a: 'Yes. Our intake wizard asks for your exact sleep window and work hours. If you work a BPO or night shift crossing midnight, your meals are sequenced around your biological wakefulness rather than standard AM/PM assumptions.',
  },
  {
    q: 'What is the difference between Normal (₹499) and Premium (₹999)?',
    a: 'Both tiers receive the exact same high quality of personalized 7-day Indian meal planning. Premium adds weekly structured check-ins, routine adjustments, and priority queue support for members wanting closer guidance.',
  },
  {
    q: 'How easy is it to cancel?',
    a: 'Completely hassle-free. You can cancel your subscription with a single click from your member dashboard at any time. Your access remains active until the end of your current paid billing period.',
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-white/60 border-t border-border-soft">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-fresh-green">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-forest-green sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-text">
            Everything you need to know about our honest, home-cooked approach.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-border-soft bg-white overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-forest-green hover:text-fresh-green transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-fresh-green' : 'text-muted-text'
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs text-muted-text leading-relaxed border-t border-border-soft/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
