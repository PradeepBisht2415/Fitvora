import Link from 'next/link';
import { Leaf, ShieldCheck, HeartHandshake } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-forest-green-dark bg-forest-green text-warm-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fresh-green text-white shadow-sm">
                <Leaf className="h-5 w-5 fill-white text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Fitvora
              </span>
            </div>
            <p className="text-sm leading-relaxed text-pale-green/90">
              Personalized Indian home-food weight management. Real ghar ka khana,
              sensible portions, and expert-reviewed weekly plans—no crash diets or synthetic supplements.
            </p>
            <div className="flex items-center gap-2 text-xs text-pale-green/80">
              <ShieldCheck className="h-4 w-4 text-fresh-green" />
              <span>DPDP Act compliant • Privacy by design</span>
            </div>
          </div>

          {/* Column 2: Pathways */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Paths & Process
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/how-it-works"
                  className="text-pale-green hover:text-white transition-colors"
                >
                  How Fitvora Works
                </Link>
              </li>
              <li>
                <Link
                  href="/weight-loss"
                  className="text-pale-green hover:text-white transition-colors"
                >
                  Sustainable Weight Loss
                </Link>
              </li>
              <li>
                <Link
                  href="/weight-gain"
                  className="text-pale-green hover:text-white transition-colors"
                >
                  Healthy Weight Gain
                </Link>
              </li>
              <li>
                <Link
                  href="/plans"
                  className="text-pale-green hover:text-white transition-colors"
                >
                  Plans: ₹499 & ₹999 / month
                </Link>
              </li>
              <li>
                <Link
                  href="/assessment"
                  className="text-pale-green hover:text-white transition-colors font-semibold"
                >
                  Start Assessment (No Signup)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Policies & Safety
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-pale-green hover:text-white transition-colors"
                >
                  Privacy Notice & Rights
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-pale-green hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="text-pale-green hover:text-white transition-colors"
                >
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-pale-green hover:text-white transition-colors"
                >
                  Contact & Grievance Officer
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Transparent Principles */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Our Transparent Pledge
            </h4>
            <div className="rounded-xl bg-forest-green-dark/70 p-4 border border-pale-green/20 text-xs text-pale-green/90 leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <HeartHandshake className="h-4 w-4 text-fresh-green" />
                <span>Equal Diet Planning Quality</span>
              </div>
              <p>
                Both ₹499 (Normal) and ₹999 (Premium) plans receive the same customized
                diet planning quality. Premium adds weekly structured check-ins and priority guidance.
              </p>
            </div>
          </div>
        </div>

        {/* Boundary Disclaimer & Copyright */}
        <div className="mt-12 border-t border-pale-green/20 pt-8 text-center text-xs text-pale-green/70 space-y-2">
          <p className="max-w-4xl mx-auto leading-relaxed">
            <strong>Medical Boundary Disclaimer:</strong> Fitvora provides general wellness and nutrition guidance tailored to Indian home cooking. We are not a medical diagnosis or treatment facility. Members with complex medical conditions or severe food allergies are referred to qualified clinical professionals. Results vary based on individual consistency; we never make unrealistic guarantees.
          </p>
          <p>© 2026 Fitvora. All rights reserved. Made for Indian home food wellness.</p>
        </div>
      </div>
    </footer>
  );
}
