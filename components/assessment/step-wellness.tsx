import * as React from 'react';
import { type WellnessData } from '@/lib/validation/assessment-schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ShieldAlert } from 'lucide-react';

interface StepWellnessProps {
  data: WellnessData;
  onChange: (data: Partial<WellnessData>) => void;
  errors?: Record<string, string>;
}

const COMMON_CONDITIONS = [
  { id: 'pcos_pcod', label: 'PCOS / PCOD' },
  { id: 'thyroid', label: 'Thyroid (Hypo / Hyper)' },
  { id: 'diabetes', label: 'Diabetes / Pre-diabetes' },
  { id: 'hypertension', label: 'High Blood Pressure (BP)' },
  { id: 'cholesterol', label: 'High Cholesterol / Lipids' },
  { id: 'gut_issues', label: 'Digestive Issues (IBS / Acid Reflux)' },
  { id: 'none_of_above', label: 'None of the above' },
];

export function StepWellness({ data, onChange }: StepWellnessProps) {
  const toggleCondition = (id: string) => {
    let current = data.conditions || [];
    if (id === 'none_of_above') {
      current = current.includes('none_of_above') ? [] : ['none_of_above'];
    } else {
      current = current.filter((c) => c !== 'none_of_above');
      if (current.includes(id)) {
        current = current.filter((c) => c !== id);
      } else {
        current = [...current, id];
      }
    }
    onChange({ conditions: current });
  };

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-forest-green">Wellness & Safety Screening</CardTitle>
        <CardDescription>
          Fitvora provides healthy lifestyle nutrition. We screen for health conditions to keep your journey safe.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Safety Boundary Notice */}
        <div className="rounded-xl bg-pale-green/60 border border-forest-green/20 p-4 text-xs leading-relaxed text-forest-green flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-forest-green shrink-0 mt-0.5" />
          <div>
            <strong>Medical Boundary Notice:</strong> Fitvora is a personalized home-food wellness platform, not a medical clinic or emergency service. Disclosing a condition helps our nutrition team safely tailor your meal portions or respectfully refer you to qualified medical professionals.
          </div>
        </div>

        {/* Health Conditions */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-dark-text">
            Do you have any of the following diagnosed conditions?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {COMMON_CONDITIONS.map((cond) => {
              const isChecked = data.conditions?.includes(cond.id);
              return (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => toggleCondition(cond.id)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                    isChecked
                      ? 'border-forest-green bg-pale-green text-forest-green shadow-sm ring-1 ring-forest-green'
                      : 'border-border-soft bg-white text-dark-text hover:bg-pale-green/20'
                  }`}
                >
                  <span>{cond.label}</span>
                  {isChecked && <span className="font-bold text-forest-green">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pregnancy / Breastfeeding */}
        <div className="pt-2 border-t border-border-soft space-y-3">
          <Checkbox
            id="pregnancy_check"
            checked={data.is_pregnant_or_nursing}
            onCheckedChange={(checked) =>
              onChange({ is_pregnant_or_nursing: checked })
            }
          >
            <span className="font-semibold text-dark-text">
              I am currently pregnant or breastfeeding
            </span>
          </Checkbox>
          {data.is_pregnant_or_nursing && (
            <p className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              Note: Pregnancy and lactation require specialized clinical and obstetric nutrition. Our team will review your case to ensure our guidance does not conflict with your OB-GYN instructions.
            </p>
          )}
        </div>

        {/* Disordered Eating History */}
        <div className="space-y-2">
          <Checkbox
            id="ed_check"
            checked={data.eating_disorder_history}
            onCheckedChange={(checked) =>
              onChange({ eating_disorder_history: checked })
            }
          >
            <span className="font-semibold text-dark-text">
              I have a past history or current diagnosis of an eating disorder
            </span>
          </Checkbox>
          <p className="text-[11px] text-muted-text pl-7">
            We avoid strict calorie tracking or shame-based metrics to support a balanced relationship with food.
          </p>
        </div>

        {/* Current Medications */}
        <div className="space-y-1.5 pt-2 border-t border-border-soft">
          <label className="text-sm font-semibold text-dark-text" htmlFor="medications">
            Any medications or supplements affecting your diet?{' '}
            <span className="text-xs text-muted-text font-normal">(Optional)</span>
          </label>
          <Textarea
            id="medications"
            value={data.medications || ''}
            onChange={(e) => onChange({ medications: e.target.value })}
            placeholder="e.g. Metformin 500mg, Thyroid medication in the morning before breakfast..."
            className="text-xs"
          />
        </div>
      </CardContent>
    </Card>
  );
}
