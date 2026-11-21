import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { ShieldCheck, Lock, UserCheck, Trash2 } from 'lucide-react';

export function generateMetadata() {
  return {
    title: 'Privacy Notice & Data Rights — DPDP Act Compliant',
    description:
      'Learn how Fitvora protects and processes your health and dietary information with data minimization, encryption, and explicit user rights.',
  };
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warm-cream">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-border-soft shadow-sm">
          <div className="space-y-2 border-b border-border-soft pb-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-pale-green px-3 py-1 text-xs font-bold text-forest-green">
              <ShieldCheck className="h-4 w-4 text-fresh-green" />
              <span>Digital Personal Data Protection (DPDP) Act Compliant</span>
            </div>
            <h1 className="text-3xl font-extrabold text-forest-green">
              Fitvora Privacy Notice & Data Rights
            </h1>
            <p className="text-xs text-muted-text">
              Last Updated: 21 November 2026 • Policy Version: 1.0-2026
            </p>
          </div>

          <div className="space-y-6 text-xs text-dark-text leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest-green flex items-center gap-2">
                <Lock className="h-4 w-4 text-fresh-green" />
                1. Our Core Privacy Commitment
              </h2>
              <p>
                Fitvora respects your privacy and treats personal health data with the utmost confidentiality.
                We operate under strict data minimization principles: we only collect what is strictly necessary to
                evaluate wellness suitability and construct safe, personalized Indian home-food meal guidance.
                We never sell, rent, or monetize your health information.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest-green flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-fresh-green" />
                2. Data Categories We Collect
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-muted-text">
                <li>
                  <strong className="text-dark-text">Contact & Identification:</strong> First name, email address, age (18+), and optional mobile number.
                </li>
                <li>
                  <strong className="text-dark-text">Body Baseline & Goals:</strong> Height (cm), current weight (kg), target weight, and target timeline.
                </li>
                <li>
                  <strong className="text-dark-text">Lifestyle Routine:</strong> Sleep/wake hours, work shift type (including night/overnight shifts), and daily activity levels.
                </li>
                <li>
                  <strong className="text-dark-text">Dietary Preferences:</strong> Vegetarian/eggetarian/non-vegetarian preferences, regional Indian home cooking styles, cooking facilities, allergies, and ingredient dislikes.
                </li>
                <li>
                  <strong className="text-dark-text">Wellness Screening:</strong> Diagnosed lifestyle conditions (e.g., PCOS, thyroid, diabetes), pregnancy/nursing status, and history of disordered eating strictly used for safety review.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest-green">
                3. Purpose of Processing & Legal Basis
              </h2>
              <p>
                Under the Indian Digital Personal Data Protection Act (DPDP Act 2023), we process your data based on your explicit, informed consent for the following specific purposes:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-text">
                <li>Evaluating whether our Indian home-food wellness service is safe and suitable for your goals.</li>
                <li>Structuring personalized 7-day Indian meal plans with calibrated portions and alternatives.</li>
                <li>Facilitating secure subscription billing and customer support communications.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest-green">
                4. Third-Party Service Processors
              </h2>
              <p>
                We partner only with industry-leading managed cloud providers adhering to high security standards:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-text">
                <li><strong className="text-dark-text">Database & Authentication:</strong> Supabase (PostgreSQL with Row Level Security and encryption at rest).</li>
                <li><strong className="text-dark-text">Payment Gateway:</strong> Razorpay (PCI-DSS Level 1 compliant; we never store your credit/debit card numbers).</li>
                <li><strong className="text-dark-text">Transactional Email:</strong> Resend (secure transactional alerts without sensitive health details in email previews).</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-forest-green flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-destructive" />
                5. Your Rights: Access, Correction & Deletion
              </h2>
              <p>
                As a Data Principal under Indian law, you have absolute rights to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-text">
                <li><strong className="text-dark-text">Right to Access:</strong> Request a full, machine-readable export of all data stored in your profile.</li>
                <li><strong className="text-dark-text">Right to Correction:</strong> Request updates to inaccurate contact details or dietary preferences.</li>
                <li><strong className="text-dark-text">Right to Erasure (Complete Deletion):</strong> Request the permanent deletion of your intake assessment, account profile, support threads, and weight history.</li>
              </ul>
              <p>
                To exercise any of these rights, email us at <strong className="text-forest-green">privacy@fitvora.com</strong>. Deletion requests are processed within 7 business days, except for statutory tax transaction receipts required by Indian law.
              </p>
            </section>

            <section className="space-y-2 border-t border-border-soft pt-4">
              <h2 className="text-base font-bold text-forest-green">
                6. Grievance Officer Contact
              </h2>
              <p className="text-muted-text">
                In compliance with the DPDP Act and IT Rules, you may address privacy inquiries or grievances to:
              </p>
              <div className="bg-pale-green/40 p-4 rounded-xl border border-pale-green-dark text-xs space-y-1">
                <p><strong>Grievance Officer:</strong> Fitvora Data Protection Desk</p>
                <p><strong>Email:</strong> grievance@fitvora.com</p>
                <p><strong>Response Time:</strong> Within 48 business hours</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
