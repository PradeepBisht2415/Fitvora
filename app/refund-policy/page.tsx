import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

export function generateMetadata() {
  return {
    title: 'Cancellation & Refund Policy — Fitvora',
    description:
      'Transparent cancellation and refund terms for Fitvora subscriptions. Cancel anytime with zero lock-in.',
  };
}

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warm-cream">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-border-soft shadow-sm">
          <div className="space-y-2 border-b border-border-soft pb-6">
            <h1 className="text-3xl font-extrabold text-forest-green">
              Cancellation & Refund Policy
            </h1>
            <p className="text-xs text-muted-text">
              Last Updated: 21 November 2026 • Version: 1.0
            </p>
          </div>

          <div className="space-y-6 text-xs text-dark-text leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest-green flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-fresh-green" />
                1. One-Click Cancellation Anytime
              </h2>
              <p>
                We believe subscriptions should earn your loyalty each month without trap doors.
                You can cancel your subscription at any time by navigating to your <strong>Member Dashboard → Subscription</strong> and clicking &ldquo;Cancel Subscription.&rdquo;
              </p>
              <p className="text-muted-text">
                Upon cancellation, automatic future renewals will immediately cease. You will retain full access to your personalized meal plan, dashboard, and support until the end of your current paid 30-day billing cycle.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest-green flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-forest-green" />
                2. Non-Delivery Money-Back Guarantee
              </h2>
              <p>
                We take fulfillment seriously. If, following successful payment confirmation, our team fails to publish your customized 7-day Indian meal plan within <strong>72 hours</strong>, you are entitled to a <strong>100% full refund</strong> with no questions asked.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest-green flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-fresh-green" />
                3. Routine Monthly Subscriptions
              </h2>
              <p>
                Because Fitvora plans are individualized human-reviewed service deliverables rather than generic automated templates, subscription payments are non-refundable once your personalized diet plan has been customized and published for that billing cycle.
              </p>
              <p className="text-muted-text">
                If you encounter exceptional personal circumstances, please contact our support desk at <strong className="text-forest-green">support@fitvora.com</strong> and we will review your request compassionately.
              </p>
            </section>

            <section className="space-y-2 border-t border-border-soft pt-4">
              <h2 className="text-base font-bold text-forest-green">
                4. Refund Processing Timelines
              </h2>
              <p className="text-muted-text">
                Approved refunds are processed via our payment gateway partner (Razorpay) and credited back to your original payment method (UPI, Netbanking, or Debit/Credit Card) within <strong>5 to 7 business days</strong> as per banking network standards.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
