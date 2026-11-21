import * as React from 'react';
import { type BodyGoalData } from '@/lib/validation/assessment-schema';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Heart } from 'lucide-react';

interface StepBodyProps {
  data: BodyGoalData;
  onChange: (data: Partial<BodyGoalData>) => void;
  errors?: Record<string, string>;
}

export function StepBody({ data, onChange, errors = {} }: StepBodyProps) {
  // Calculated BMI estimate for immediate helpful reference
  const heightM = (data.height_cm || 165) / 100;
  const bmi = (data.weight_kg || 65) / (heightM * heightM);

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-forest-green">Body & Wellness Goal</CardTitle>
        <CardDescription>
          Help us calculate your basal energy needs and design safe, sensible portion sizes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Goal Pathway Selector */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-dark-text">
            What is your primary wellness direction? <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                id: 'lose_weight',
                title: 'Lose Weight',
                desc: 'Healthy fat loss with filling home foods',
                icon: TrendingDown,
              },
              {
                id: 'gain_weight',
                title: 'Gain Weight',
                desc: 'Nourishing, protein-dense Indian thalis',
                icon: TrendingUp,
              },
              {
                id: 'maintain_health',
                title: 'Maintain & Energize',
                desc: 'Balanced routine and steady vitality',
                icon: Heart,
              },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = data.target_direction === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      target_direction: option.id as BodyGoalData['target_direction'],
                    })
                  }
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-forest-green bg-pale-green/60 shadow-sm ring-2 ring-forest-green/20'
                      : 'border-border-soft bg-white hover:bg-pale-green/20'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg mb-2 ${
                      isSelected ? 'bg-forest-green text-white' : 'bg-pale-green text-forest-green'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm text-forest-green">{option.title}</span>
                  <span className="text-xs text-muted-text mt-1">{option.desc}</span>
                </button>
              );
            })}
          </div>
          {errors['target_direction'] && (
            <p className="text-xs text-destructive">{errors['target_direction']}</p>
          )}
        </div>

        {/* Height & Weight Inputs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Height in cm */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-dark-text" htmlFor="height_cm">
              Height (cm) <span className="text-destructive">*</span>
            </label>
            <Input
              id="height_cm"
              type="number"
              inputMode="decimal"
              min={100}
              max={250}
              value={data.height_cm || ''}
              onChange={(e) => onChange({ height_cm: parseFloat(e.target.value) || 0 })}
              className={errors['height_cm'] ? 'border-destructive' : ''}
              placeholder="e.g. 165"
            />
            <p className="text-[11px] text-muted-text">
              {data.height_cm
                ? `Approx ${Math.floor(data.height_cm / 30.48)}' ${Math.round(
                    (data.height_cm % 30.48) / 2.54
                  )}"`
                : '1 foot = 30.48 cm'}
            </p>
            {errors['height_cm'] && (
              <p className="text-xs text-destructive">{errors['height_cm']}</p>
            )}
          </div>

          {/* Current Weight in kg */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-dark-text" htmlFor="weight_kg">
              Current Weight (kg) <span className="text-destructive">*</span>
            </label>
            <Input
              id="weight_kg"
              type="number"
              inputMode="decimal"
              step="0.5"
              min={30}
              max={300}
              value={data.weight_kg || ''}
              onChange={(e) => onChange({ weight_kg: parseFloat(e.target.value) || 0 })}
              className={errors['weight_kg'] ? 'border-destructive' : ''}
              placeholder="e.g. 70"
            />
            <p className="text-[11px] text-muted-text">
              Calculated BMI: ~{bmi ? bmi.toFixed(1) : '--'}
            </p>
            {errors['weight_kg'] && (
              <p className="text-xs text-destructive">{errors['weight_kg']}</p>
            )}
          </div>
        </div>

        {/* Target Weight & Timeline */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-dark-text" htmlFor="target_weight_kg">
              Target Weight (kg) <span className="text-xs text-muted-text font-normal">(Optional)</span>
            </label>
            <Input
              id="target_weight_kg"
              type="number"
              inputMode="decimal"
              step="0.5"
              min={30}
              max={300}
              value={data.target_weight_kg || ''}
              onChange={(e) =>
                onChange({
                  target_weight_kg: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              placeholder="e.g. 64"
            />
            {errors['target_weight_kg'] && (
              <p className="text-xs text-destructive">{errors['target_weight_kg']}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-dark-text" htmlFor="timeline_weeks">
              Intended Timeline <span className="text-xs text-muted-text font-normal">(Weeks)</span>
            </label>
            <Input
              id="timeline_weeks"
              type="number"
              min={4}
              max={52}
              value={data.timeline_weeks || ''}
              onChange={(e) =>
                onChange({
                  timeline_weeks: e.target.value ? parseInt(e.target.value, 10) : null,
                })
              }
              placeholder="e.g. 12 weeks"
            />
            <p className="text-[11px] text-muted-text">
              We recommend safe, sustainable pacing (0.5 kg to 1 kg per week).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
