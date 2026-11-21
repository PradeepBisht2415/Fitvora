import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export function generateMetadata() {
  return {
    title: 'Terms of Service — Fitvora Wellness',
    description:
      'Review the terms governing the use of Fitvora personalized Indian home-food wellness plans and subscriptions.',
  };
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warm-cream">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-border-soft shadow-sm">
          <div className="space-y-2 border-b border-border-soft pb-6">
            <h1 className="text-3xl font-extrabold text-forest-green">
              Fitvora Terms of Service
            </h1>
            <p className="text-xs text-muted-text">
              Last Updated: 21 November 2026 • Version: 1.0
            </p>
          </div>

          <div className="space-y-6 text-xs text-dark-text leading-relaxed">
            {/* Prominent Medical Disclaimer */}
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 space-y-2 text-amber-950">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0" />
                <span>CRITICAL MEDICAL BOUNDARY NOTICE</span>
              </div>
              <p>
                Fitvora is a <strong>general wellness and nutrition-support service</strong>, not a licensed medical clinic, hospital, diagnostic center, or emergency medical service. We provide portion and meal timing guidance based on Indian home cooking. We do not diagnose, treat, prevent, or cure any medical disease.
              </p>
              <p>
                Always seek the advice of your physician or qualified clinical practitioner before making significant changes to your diet, especially if you have chronic medical conditions, are pregnant, or take prescription medications. Never disregard professional clinical advice because of information provided by Fitvora.
              </p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest-green">
                1. Eligibility & User Accounts
              </h2>
              <p>
                You must be at least <strong>18 years of age</strong> and legally capable of entering into binding contracts under Indian law to use Fitvora. By submitting an assessment or purchasing a membership, you represent and warrant that all information provided is accurate and truthful.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest-green">
                2. Subscription Billing & Tiers
              </h2>
              <p>
                Fitvora operates on a monthly subscription model offering two tiers:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-text">
                <li><strong className="text-dark-text">Normal Plan (₹499/month):</strong> Individualized 7-day Indian meal plan, portions, timings, dashboard access, and standard support inbox.</li>
                <li><strong className="text-dark-text">Premium Plan (₹999/month):</strong> Same individualized diet plan quality, plus weekly structured check-ins, routine tuning, and priority queue support.</li>
              </ul>
              <p>
                Subscriptions automatically renew each month via our payment gateway (Razorpay) unless cancelled before the renewal date. You may cancel your subscription at any time directly through your dashboard.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest-green">
                3. No Guarantees of Results
              </h2>
              <p>
                Weight loss and weight gain are complex biological processes that depend on individual metabolism, hormonal balance, physical activity, genetic factors, and consistent adherence. While we provide thoughtful, portion-calibrated guidance, Fitvora <strong>never promises or guarantees specific weight loss or weight gain outcomes</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest-green">
                4. Intellectual Property
              </h2>
              <p>
                All meal templates, website UI, trademarks, text, brand ambassador graphics, and software code are the exclusive intellectual property of Fitvora. Your personal diet plan is licensed to you solely for your private, non-commercial personal use.
              </p>
            </section>

            <section className="space-y-2 border-t border-border-soft pt-4">
              <h2 className="text-base font-bold text-forest-green flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-fresh-green" />
                5. Governing Law & Jurisdiction
              </h2>
              <p className="text-muted-text">
                These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of India.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
