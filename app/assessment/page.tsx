'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { StepIndicator } from '@/components/assessment/step-indicator';
import { StepAbout } from '@/components/assessment/step-about';
import { StepBody } from '@/components/assessment/step-body';
import { StepRoutine } from '@/components/assessment/step-routine';
import { StepPreferences } from '@/components/assessment/step-preferences';
import { StepWellness } from '@/components/assessment/step-wellness';
import { StepReview } from '@/components/assessment/step-review';
import { Button } from '@/components/ui/button';
import {
  DEFAULT_ASSESSMENT_DATA,
  aboutYouSchema,
  bodyGoalSchema,
  routineSchema,
  preferencesSchema,
  wellnessSchema,
  consentSchema,
  type AssessmentSubmissionData,
} from '@/lib/validation/assessment-schema';
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/db/supabase-browser';

export default function AssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState<AssessmentSubmissionData>(DEFAULT_ASSESSMENT_DATA);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionError, setSubmissionError] = React.useState<string | null>(null);

  // Scroll to top on step change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Pre-fill user data if already signed in
  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setFormData((prev) => ({
          ...prev,
          about: {
            ...prev.about,
            email: data.user.email || prev.about.email,
            first_name:
              (data.user.user_metadata?.first_name as string) ||
              prev.about.first_name,
          },
        }));
      }
    });
  }, []);

  // Validation per step before proceeding
  const validateStep = (step: number): boolean => {
    setErrors({});
    let result;

    if (step === 1) {
      result = aboutYouSchema.safeParse(formData.about);
    } else if (step === 2) {
      result = bodyGoalSchema.safeParse(formData.body);
    } else if (step === 3) {
      result = routineSchema.safeParse(formData.routine);
    } else if (step === 4) {
      result = preferencesSchema.safeParse(formData.preferences);
    } else if (step === 5) {
      result = wellnessSchema.safeParse(formData.wellness);
    } else if (step === 6) {
      result = consentSchema.safeParse(formData.consent);
    }

    if (result && !result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0];
        if (path !== undefined) {
          fieldErrors[String(path)] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit assessment');
      }

      // Store opaque status token in sessionStorage for the completion view
      if (typeof window !== 'undefined' && data.token) {
        sessionStorage.setItem('fitvora_assessment_token', data.token);
        sessionStorage.setItem('fitvora_first_name', formData.about.first_name);
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        router.push('/assessment/complete');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setSubmissionError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-warm-cream">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Header & Assurance */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-fresh-green">
              <ShieldCheck className="h-4 w-4" />
              <span>Confidential • No Account Required To Begin</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-forest-green">
              Health & Lifestyle Intake Assessment
            </h1>
            <p className="text-sm text-muted-text">
              Takes ~3 minutes. Your answers are reviewed by our founder to evaluate suitability and customize your Indian home-food plan.
            </p>
          </div>

          {/* Step Progress Bar */}
          <StepIndicator
            currentStep={currentStep}
            onStepClick={(step) => setCurrentStep(step)}
          />

          {/* Submission Error Banner */}
          {submissionError && (
            <div className="rounded-xl border border-destructive/30 bg-red-50 p-4 text-xs font-semibold text-destructive">
              {submissionError}
            </div>
          )}

          {/* Current Step Form Body */}
          <div className="transition-opacity duration-200">
            {currentStep === 1 && (
              <StepAbout
                data={formData.about}
                onChange={(updates) =>
                  setFormData((prev) => ({
                    ...prev,
                    about: { ...prev.about, ...updates },
                  }))
                }
                errors={errors}
              />
            )}

            {currentStep === 2 && (
              <StepBody
                data={formData.body}
                onChange={(updates) =>
                  setFormData((prev) => ({
                    ...prev,
                    body: { ...prev.body, ...updates },
                  }))
                }
                errors={errors}
              />
            )}

            {currentStep === 3 && (
              <StepRoutine
                data={formData.routine}
                onChange={(updates) =>
                  setFormData((prev) => ({
                    ...prev,
                    routine: { ...prev.routine, ...updates },
                  }))
                }
                errors={errors}
              />
            )}

            {currentStep === 4 && (
              <StepPreferences
                data={formData.preferences}
                onChange={(updates) =>
                  setFormData((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, ...updates },
                  }))
                }
                errors={errors}
              />
            )}

            {currentStep === 5 && (
              <StepWellness
                data={formData.wellness}
                onChange={(updates) =>
                  setFormData((prev) => ({
                    ...prev,
                    wellness: { ...prev.wellness, ...updates },
                  }))
                }
                errors={errors}
              />
            )}

            {currentStep === 6 && (
              <StepReview
                formData={formData}
                onEditStep={(step) => setCurrentStep(step)}
                consentData={formData.consent}
                onConsentChange={(updates) =>
                  setFormData((prev) => ({
                    ...prev,
                    consent: { ...prev.consent, ...updates },
                  }))
                }
                errors={errors}
              />
            )}
          </div>

          {/* Wizard Controls */}
          <div className="flex items-center justify-between pt-4">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 6 ? (
              <Button
                type="button"
                variant="fresh"
                onClick={handleNext}
                className="gap-2 font-bold px-6 shadow-sm"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="fresh"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 font-bold px-8 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit for Review
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
