import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, Clock, ShieldCheck, MapPin } from 'lucide-react';

export function generateMetadata() {
  return {
    title: 'Contact Us & Grievance Desk — Fitvora',
    description:
      'Get in touch with the Fitvora team for questions, diet clarifications, billing support, or grievance inquiries.',
  };
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warm-cream">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-fresh-green">
              Direct Communication
            </span>
            <h1 className="text-3xl font-extrabold text-forest-green sm:text-4xl">
              Contact Fitvora
            </h1>
            <p className="text-sm text-muted-text">
              We are a personalized Indian home-food wellness service. Have a question
              about our plans, your assessment, or privacy rights? Reach out directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Card 1: Support Desk */}
            <Card className="border-border-soft bg-white">
              <CardHeader className="space-y-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pale-green text-forest-green mb-2">
                  <Mail className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg text-forest-green">Member Support Desk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-dark-text leading-relaxed">
                <p>
                  For questions about your assessment, meal swaps, subscriptions, or login access:
                </p>
                <div className="bg-pale-green/40 p-3 rounded-xl border border-pale-green-dark">
                  <span className="font-bold text-forest-green block text-sm">support@fitvora.com</span>
                  <span className="text-muted-text text-[11px]">Response within 12–24 hours (Mon–Sat)</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card 2: Privacy & Grievance */}
            <Card className="border-border-soft bg-white">
              <CardHeader className="space-y-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pale-green text-forest-green mb-2">
                  <ShieldCheck className="h-5 w-5 text-fresh-green" />
                </div>
                <CardTitle className="text-lg text-forest-green">Privacy & Grievance Desk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-dark-text leading-relaxed">
                <p>
                  For statutory requests under the DPDP Act (data export, correction, or account deletion):
                </p>
                <div className="bg-pale-green/40 p-3 rounded-xl border border-pale-green-dark">
                  <span className="font-bold text-forest-green block text-sm">privacy@fitvora.com</span>
                  <span className="text-muted-text text-[11px]">DPDP Grievance Officer • Response within 48h</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Operational Details Box */}
          <div className="rounded-3xl border border-border-soft bg-white p-6 sm:p-8 space-y-4 shadow-sm text-xs text-dark-text leading-relaxed">
            <h3 className="font-bold text-base text-forest-green flex items-center gap-2">
              <Clock className="h-4 w-4 text-fresh-green" />
              Service Operating Guidelines
            </h3>
            <p className="text-muted-text">
              Fitvora is operated from India. We work standard business hours (IST) from Monday through Saturday.
              Because our personalized diet plans are carefully customized by experienced nutrition experts rather than an automated script, turnaround times for assessment evaluations and initial plan deliveries range between 12 and 24 hours.
            </p>
            <div className="flex items-center gap-2 text-muted-text pt-2 border-t border-border-soft">
              <MapPin className="h-4 w-4 text-forest-green shrink-0" />
              <span>Headquartered in India • Tailored for Indian home cooking</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
