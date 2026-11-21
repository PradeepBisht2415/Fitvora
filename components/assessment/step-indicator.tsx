import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  stepNames?: string[];
  onStepClick?: (step: number) => void;
}

const DEFAULT_STEPS = [
  'About You',
  'Body & Goal',
  'Daily Routine',
  'Food & Taste',
  'Wellness',
  'Review & Submit',
];

export function StepIndicator({
  currentStep,
  totalSteps = 6,
  stepNames = DEFAULT_STEPS,
  onStepClick,
}: StepIndicatorProps) {
  const progressPercent = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="w-full space-y-4">
      {/* Mobile Step Badge and Progress Bar */}
      <div className="flex items-center justify-between text-xs font-bold text-forest-green">
        <span>
          Step {currentStep} of {totalSteps}: {stepNames[currentStep - 1]}
        </span>
        <span className="text-muted-text">{progressPercent}% Completed</span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-pale-green">
        <div
          className="h-full rounded-full bg-fresh-green transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Desktop Step Numbers */}
      <div className="hidden sm:flex items-center justify-between pt-2">
        {stepNames.map((name, index) => {
          const stepNumber = index + 1;
          const isDone = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isClickable = onStepClick && stepNumber < currentStep;

          return (
            <button
              key={name}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(stepNumber)}
              className={cn(
                'flex flex-col items-center gap-1.5 text-center transition-all focus:outline-none',
                isClickable && 'cursor-pointer hover:opacity-80'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  isDone
                    ? 'bg-fresh-green text-white shadow-sm'
                    : isCurrent
                    ? 'border-2 border-forest-green bg-forest-green text-white shadow'
                    : 'border border-border-soft bg-white text-muted-text'
                )}
              >
                {isDone ? <Check className="h-4 w-4 stroke-[2.5]" /> : stepNumber}
              </div>
              <span
                className={cn(
                  'text-[11px] font-semibold tracking-tight',
                  isCurrent
                    ? 'text-forest-green font-bold'
                    : isDone
                    ? 'text-dark-text'
                    : 'text-muted-text/70'
                )}
              >
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
