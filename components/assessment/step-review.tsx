import * as React from 'react';
import Link from 'next/link';
import {
  type AssessmentSubmissionData,
  type ConsentData,
} from '@/lib/validation/assessment-schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit3, Lock } from 'lucide-react';

interface StepReviewProps {
  formData: AssessmentSubmissionData;
  onEditStep: (stepNumber: number) => void;
  consentData: ConsentData;
  onConsentChange: (data: Partial<ConsentData>) => void;
  errors?: Record<string, string>;
}

export function StepReview({
  formData,
  onEditStep,
  consentData,
  onConsentChange,
  errors = {},
}: StepReviewProps) {
  const { about, body, routine, preferences, wellness } = formData;

  const targetLabel =
    body.target_direction === 'lose_weight'
      ? 'Weight Loss'
      : body.target_direction === 'gain_weight'
      ? 'Weight Gain'
      : 'Maintain Health';

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-forest-green">Review & Confirm</CardTitle>
        <CardDescription>
          Please review your information before submitting for assessment review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section 1: About You */}
        <div className="rounded-xl border border-border-soft p-4 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-forest-green">1. Personal Profile</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(1)}
              className="h-8 text-xs text-forest-green hover:bg-pale-green/40"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-dark-text sm:grid-cols-4">
            <div>
              <span className="text-muted-text block">Name:</span>
              <span className="font-semibold">{about.first_name}</span>
            </div>
            <div>
              <span className="text-muted-text block">Email:</span>
              <span className="font-semibold truncate block">{about.email}</span>
            </div>
            <div>
              <span className="text-muted-text block">Age:</span>
              <span className="font-semibold">{about.age} yrs</span>
            </div>
            <div>
              <span className="text-muted-text block">Mobile:</span>
              <span className="font-semibold">{about.phone ? `+91 ${about.phone}` : 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Body & Goal */}
        <div className="rounded-xl border border-border-soft p-4 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-forest-green">2. Body & Direction</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(2)}
              className="h-8 text-xs text-forest-green hover:bg-pale-green/40"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-dark-text sm:grid-cols-4">
            <div>
              <span className="text-muted-text block">Goal:</span>
              <span className="font-semibold text-fresh-green">{targetLabel}</span>
            </div>
            <div>
              <span className="text-muted-text block">Height:</span>
              <span className="font-semibold">{body.height_cm} cm</span>
            </div>
            <div>
              <span className="text-muted-text block">Weight:</span>
              <span className="font-semibold">{body.weight_kg} kg</span>
            </div>
            <div>
              <span className="text-muted-text block">Target:</span>
              <span className="font-semibold">{body.target_weight_kg ? `${body.target_weight_kg} kg` : 'Gradual progress'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Routine & Schedule */}
        <div className="rounded-xl border border-border-soft p-4 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-forest-green">3. Daily Routine</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(3)}
              className="h-8 text-xs text-forest-green hover:bg-pale-green/40"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-dark-text sm:grid-cols-3">
            <div>
              <span className="text-muted-text block">Sleep Window:</span>
              <span className="font-semibold">{routine.wake_time} to {routine.sleep_time}</span>
            </div>
            <div>
              <span className="text-muted-text block">Work Shift:</span>
              <span className="font-semibold capitalize">{routine.work_shift.replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="text-muted-text block">Meals/Day:</span>
              <span className="font-semibold capitalize">{routine.meal_frequency.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Taste & Cooking */}
        <div className="rounded-xl border border-border-soft p-4 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-forest-green">4. Taste & Allergies</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(4)}
              className="h-8 text-xs text-forest-green hover:bg-pale-green/40"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </div>
          <div className="space-y-1.5 text-xs text-dark-text">
            <div>
              <span className="text-muted-text">Diet & Region: </span>
              <span className="font-semibold capitalize">{preferences.diet_type} • {preferences.regional_preference.replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="text-muted-text">Allergies: </span>
              <span className="font-semibold">
                {preferences.allergies?.length ? preferences.allergies.join(', ') : 'None reported'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Wellness Screening */}
        <div className="rounded-xl border border-border-soft p-4 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-forest-green">5. Wellness & Safety</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(5)}
              className="h-8 text-xs text-forest-green hover:bg-pale-green/40"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </div>
          <div className="space-y-1 text-xs text-dark-text">
            <div>
              <span className="text-muted-text">Reported Conditions: </span>
              <span className="font-semibold">
                {wellness.conditions?.length ? wellness.conditions.join(', ') : 'None reported'}
              </span>
            </div>
            {wellness.is_pregnant_or_nursing && (
              <div className="text-amber-900 font-semibold">
                ⚠️ Pregnant / Nursing disclosed (flagged for safety review)
              </div>
            )}
          </div>
        </div>

        {/* Privacy & Informed Consent Box */}
        <div className="rounded-2xl bg-pale-green/60 border border-forest-green/20 p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-green">
            <Lock className="h-4 w-4" />
            <span>DPDP Consent & Privacy Terms</span>
          </div>

          <div className="space-y-3">
            <Checkbox
              id="health_consent"
              checked={consentData.health_consent_granted}
              onCheckedChange={(checked) =>
                onConsentChange({ health_consent_granted: checked })
              }
            >
              <span className="text-xs text-dark-text leading-relaxed">
                <strong>Explicit Health Data Consent:</strong> I agree to allow Fitvora to process my dietary habits, routine, and health answers strictly for personalized Indian meal plan assessment. I understand I can request access or complete deletion at any time under the DPDP Act. <span className="text-destructive">*</span>
              </span>
            </Checkbox>
            {errors['health_consent_granted'] && (
              <p className="text-xs text-destructive pl-7">
                {errors['health_consent_granted']}
              </p>
            )}

            <Checkbox
              id="terms_consent"
              checked={consentData.terms_accepted}
              onCheckedChange={(checked) =>
                onConsentChange({ terms_accepted: checked })
              }
            >
              <span className="text-xs text-dark-text leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="underline font-bold text-forest-green hover:text-fresh-green" target="_blank">
                  Terms of Service
                </Link>{' '}
                and understand that Fitvora provides general home-food wellness guidance, not medical diagnosis or treatment. <span className="text-destructive">*</span>
              </span>
            </Checkbox>
            {errors['terms_accepted'] && (
              <p className="text-xs text-destructive pl-7">{errors['terms_accepted']}</p>
            )}

            <Checkbox
              id="marketing_opt"
              checked={consentData.marketing_opt_in}
              onCheckedChange={(checked) =>
                onConsentChange({ marketing_opt_in: checked })
              }
            >
              <span className="text-xs text-muted-text leading-relaxed">
                (Optional) Send me helpful seasonal recipe ideas and nutrition tips via email.
              </span>
            </Checkbox>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
