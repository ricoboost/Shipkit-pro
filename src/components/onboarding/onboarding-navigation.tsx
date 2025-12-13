'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  canProceed: boolean;
  isLastStep: boolean;
  isOptionalStep: boolean;
  onSkip?: () => void;
}

export function OnboardingNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  canProceed,
  isLastStep,
  isOptionalStep,
  onSkip,
}: OnboardingNavigationProps) {
  const t = useTranslations('onboarding');

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={onPrev}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('navigation.back')}</span>
        </Button>

        {/* Step indicators (mobile) */}
        <div className="flex items-center gap-1.5 lg:hidden">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div
              key={step}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                step === currentStep && 'w-6 bg-primary',
                step < currentStep && 'bg-green-500',
                step > currentStep && 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Step counter (desktop) */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t('navigation.step')}</span>
          <span className="font-medium text-foreground">{currentStep}</span>
          <span>{t('navigation.of')}</span>
          <span className="font-medium text-foreground">{totalSteps}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Skip button for optional steps */}
          {isOptionalStep && onSkip && (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <span className="hidden sm:inline">{t('navigation.skip')}</span>
              <SkipForward className="w-4 h-4" />
            </Button>
          )}

          {/* Next/Continue button */}
          {!isLastStep && (
            <Button
              onClick={onNext}
              disabled={!canProceed}
              className="gap-2"
            >
              <span>{t('navigation.continue')}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
