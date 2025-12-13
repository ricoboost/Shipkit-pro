'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { StepStatus } from './onboarding-wizard';

interface OnboardingStep {
  id: number;
  key: string;
  icon: LucideIcon;
  required: boolean;
  title: string;
  description: string;
  status: StepStatus;
}

interface OnboardingSidebarProps {
  steps: OnboardingStep[];
  currentStep: number;
  visitedSteps: number[];
  onStepClick: (step: number) => void;
  progress: number;
}

export function OnboardingSidebar({
  steps,
  currentStep,
  visitedSteps,
  onStepClick,
  progress,
}: OnboardingSidebarProps) {
  const t = useTranslations('onboarding');

  return (
    <aside className="hidden lg:flex flex-col w-80 xl:w-96 bg-muted/50 dark:bg-muted/20 border-r border-border">
      {/* Logo/Brand section */}
      <div className="p-6 xl:p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="font-semibold text-lg">ShipKit</h1>
            <p className="text-sm text-muted-foreground">{t('sidebar.setup')}</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 xl:px-8 mb-6">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' as const }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {Math.round(progress)}% {t('sidebar.complete')}
        </p>
      </div>

      {/* Step navigation */}
      <nav className="flex-1 px-4 xl:px-6">
        <ul className="space-y-1">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = step.status.valid;
            const isVisited = visitedSteps.includes(step.id);
            const hasError = step.status.error;
            const Icon = step.icon;

            // Can click if visited OR if all previous required steps are complete
            const canClick = isVisited || steps.slice(0, index).every(s => !s.required || s.status.valid);

            return (
              <li key={step.id}>
                <button
                  onClick={() => canClick && onStepClick(step.id)}
                  disabled={!canClick}
                  className={cn(
                    'w-full flex items-start gap-4 p-3 rounded-lg text-left transition-all duration-200',
                    isActive && 'bg-background shadow-sm',
                    !isActive && canClick && 'hover:bg-background/50 cursor-pointer',
                    !canClick && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {/* Step indicator with connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
                        isActive && !isCompleted && 'bg-primary text-primary-foreground',
                        isCompleted && 'bg-green-500/20 text-green-600 dark:text-green-400',
                        hasError && !isCompleted && 'bg-destructive/20 text-destructive',
                        !isActive && !isCompleted && !hasError && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : hasError ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    {/* Connector line */}
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'w-0.5 h-8 mt-2 rounded-full transition-all duration-200',
                          isCompleted ? 'bg-green-500/40' : 'bg-muted'
                        )}
                      />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pt-1.5">
                    <div className="flex items-center gap-2">
                      <h3
                        className={cn(
                          'font-medium text-sm',
                          isActive && 'text-foreground',
                          isCompleted && 'text-green-600 dark:text-green-400',
                          !isActive && !isCompleted && 'text-muted-foreground'
                        )}
                      >
                        {step.title}
                      </h3>
                      {!step.required && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {t('sidebar.optional')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Stats footer */}
      <div className="p-6 xl:p-8 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t('sidebar.step')} {currentStep} {t('sidebar.of')} {steps.length}
          </span>
          <span className="font-medium text-green-600 dark:text-green-400">
            {steps.filter(s => s.status.valid).length} {t('sidebar.completed')}
          </span>
        </div>
      </div>
    </aside>
  );
}
