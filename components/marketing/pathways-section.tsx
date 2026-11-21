import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrandCharacter } from '@/components/ui/brand-character';
import { ArrowRight, Check } from 'lucide-react';

export function PathwaysSection() {
  return (
    <section className="py-16 md:py-24 bg-white/60 border-t border-border-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-fresh-green">
            Choose Your Direction
          </span>
          <h2 className="text-3xl font-extrabold text-forest-green sm:text-4xl">
            Tailored To Your Body’s True Needs
          </h2>
          <p className="text-sm text-muted-text">
            Whether your goal is gentle fat loss or steady, healthy weight gain, we build
            around the comforting food already cooking in your kitchen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Pathway 1: Weight Loss */}
          <div className="rounded-3xl border border-border-soft bg-white p-6 sm:p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-full">
              <BrandCharacter
                variant="weight-loss"
                className="h-56 sm:h-64 rounded-2xl"
              />
            </div>
            <div className="space-y-3">
              <div className="inline-block rounded-full bg-pale-green px-3 py-1 text-xs font-bold text-forest-green">
                Weight Loss Pathway
              </div>
              <h3 className="text-2xl font-bold text-forest-green">
                Sustainable Calorie Balance, Full Stomachs
              </h3>
              <p className="text-sm text-muted-text leading-relaxed">
                No boiled chicken and plain lettuce. Enjoy dal-tadka, phulkas, seasonal sabzi,
                and evening chana snacks in calculated portions that create a steady, safe caloric deficit.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-dark-text pt-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-fresh-green shrink-0" />
                  <span>High satiety with Indian dietary fiber and plant protein</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-fresh-green shrink-0" />
                  <span>Pacing calibrated to safe 0.5–1 kg/week targets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-fresh-green shrink-0" />
                  <span>Curd-rice, khichdi, and regional comforting dinners</span>
                </li>
              </ul>
            </div>
            <div className="pt-2">
              <Link href="/weight-loss">
                <Button variant="outline" className="w-full justify-between font-bold">
                  <span>Explore Weight Loss Plan</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Pathway 2: Weight Gain */}
          <div className="rounded-3xl border border-border-soft bg-white p-6 sm:p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-full">
              <BrandCharacter
                variant="weight-gain"
                className="h-56 sm:h-64 rounded-2xl"
              />
            </div>
            <div className="space-y-3">
              <div className="inline-block rounded-full bg-pale-green px-3 py-1 text-xs font-bold text-forest-green">
                Weight Gain Pathway
              </div>
              <h3 className="text-2xl font-bold text-forest-green">
                Nutrient-Dense Indian Feasts for Steady Gain
              </h3>
              <p className="text-sm text-muted-text leading-relaxed">
                Struggling to put on weight? We help you build lean mass and energy with
                wholesome paneer, whole milk, sprouted moong, sattu, nuts, and calorie-dense thalis.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-dark-text pt-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-fresh-green shrink-0" />
                  <span>Surplus calories without bloating or sluggish digestion</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-fresh-green shrink-0" />
                  <span>Nutritious traditional snacks (roasted peanuts, laddoos)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-fresh-green shrink-0" />
                  <span>Balanced macronutrients supporting muscle and metabolism</span>
                </li>
              </ul>
            </div>
            <div className="pt-2">
              <Link href="/weight-gain">
                <Button variant="outline" className="w-full justify-between font-bold">
                  <span>Explore Weight Gain Plan</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
