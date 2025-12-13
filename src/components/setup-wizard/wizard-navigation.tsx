'use client';

/**
 * Wizard Navigation
 * Bottom navigation bar with back/next buttons and dot indicators
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWizard } from './wizard-context';
import { WIZARD_STEPS } from './constants';

interface WizardNavigationProps {
  onSkip?: () => void;
  showSkip?: boolean;
  nextLabel?: string;
  onNext?: () => void;
  nextDisabled?: boolean;
}

export function WizardNavigation({
  onSkip,
  showSkip = false,
  nextLabel,
  onNext,
  nextDisabled = false,
}: WizardNavigationProps) {
  const { state, canGoBack, canGoForward, prevStep, nextStep, goToStep } =
    useWizard();

  const currentStepConfig = WIZARD_STEPS[state.currentStep];
  const isLastStep = state.currentStep === WIZARD_STEPS.length - 1;

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  };

  return (
    <div className="border-t bg-background p-4 lg:px-16">
      <div className="flex items-center justify-between">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={!canGoBack}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Dot Indicators */}
        <div className="flex items-center gap-2">
          {WIZARD_STEPS.map((step, index) => {
            const isCompleted = state.completedSteps.includes(step.id);
            const isCurrent = state.currentStep === index;

            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  isCurrent
                    ? 'w-8 bg-foreground'
                    : isCompleted
                      ? 'w-2 bg-green-500'
                      : 'w-2 bg-muted-foreground/30'
                )}
                aria-label={`Go to ${step.title}`}
              />
            );
          })}
        </div>

        {/* Next / Skip Buttons */}
        <div className="flex items-center gap-2">
          {showSkip && currentStepConfig.skippable && onSkip && (
            <Button variant="ghost" onClick={onSkip}>
              Skip
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={nextDisabled || (!canGoForward && !isLastStep)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {nextLabel || (isLastStep ? 'Finish' : 'Continue')}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Step Counter */}
      <div className="mt-3 text-center text-sm text-muted-foreground lg:hidden">
        Step {state.currentStep + 1} of {WIZARD_STEPS.length}
      </div>
    </div>
  );
}
