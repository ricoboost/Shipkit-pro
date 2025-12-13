'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  FileCode,
  Database,
  Shield,
  CreditCard,
  UserPlus,
} from 'lucide-react';
import { OnboardingSidebar } from './onboarding-sidebar';
import { OnboardingNavigation } from './onboarding-navigation';
import {
  EnvSetupStep,
  DatabaseStep,
  AuthStep,
  PaymentsStep,
  AdminSetupStep,
} from './steps';

export interface StepStatus {
  valid: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

export interface OnboardingState {
  env: StepStatus;
  database: StepStatus;
  auth: StepStatus;
  payments: StepStatus;
  admin: StepStatus;
}

const steps = [
  { id: 1, key: 'env', icon: FileCode, required: true },
  { id: 2, key: 'database', icon: Database, required: true },
  { id: 3, key: 'auth', icon: Shield, required: true },
  { id: 4, key: 'payments', icon: CreditCard, required: false },
  { id: 5, key: 'admin', icon: UserPlus, required: true },
] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

export function OnboardingWizard() {
  const t = useTranslations('onboarding');
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState<number[]>([1]);
  const [direction, setDirection] = useState(0);
  const [stepStatus, setStepStatus] = useState<OnboardingState>({
    env: { valid: false },
    database: { valid: false },
    auth: { valid: false },
    payments: { valid: false },
    admin: { valid: false },
  });

  // Check initial status on mount
  useEffect(() => {
    checkInitialStatus();
  }, []);

  const checkInitialStatus = async () => {
    try {
      // Check env
      const envRes = await fetch('/api/setup/check-env');
      const envData = await envRes.json();

      // Check db
      const dbRes = await fetch('/api/setup/check-db');
      const dbData = await dbRes.json();

      setStepStatus(prev => ({
        ...prev,
        env: { valid: envData.valid, data: envData },
        database: { valid: dbData.connected, error: dbData.error, data: dbData },
      }));
    } catch (error) {
      console.error('Failed to check initial status:', error);
    }
  };

  const updateStepStatus = useCallback((stepKey: keyof OnboardingState, status: StepStatus) => {
    setStepStatus(prev => ({
      ...prev,
      [stepKey]: status,
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step < 1 || step > steps.length) return;

    // For required steps, must complete previous required steps
    if (step > 1) {
      for (let i = 0; i < step - 1; i++) {
        const prevStep = steps[i];
        if (prevStep.required && !stepStatus[prevStep.key as keyof OnboardingState].valid) {
          // Can't skip required steps
          return;
        }
      }
    }

    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
    setVisitedSteps(prev => {
      if (!prev.includes(step)) {
        return [...prev, step];
      }
      return prev;
    });
  }, [currentStep, stepStatus]);

  const nextStep = useCallback(() => {
    const currentStepConfig = steps[currentStep - 1];
    const currentStatus = stepStatus[currentStepConfig.key as keyof OnboardingState];

    // For required steps, must be valid to proceed
    if (currentStepConfig.required && !currentStatus.valid) {
      return;
    }

    if (currentStep < steps.length) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, stepStatus, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const skipStep = useCallback(() => {
    const currentStepConfig = steps[currentStep - 1];

    // Can only skip non-required steps
    if (!currentStepConfig.required) {
      // Mark as skipped/valid
      updateStepStatus(currentStepConfig.key as keyof OnboardingState, { valid: true, data: { skipped: true } });
      if (currentStep < steps.length) {
        goToStep(currentStep + 1);
      }
    }
  }, [currentStep, goToStep, updateStepStatus]);

  const handleComplete = useCallback(() => {
    // Redirect to homepage after successful admin creation
    router.push('/');
    router.refresh();
  }, [router]);

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const stepsWithMeta = steps.map(step => ({
    ...step,
    title: t(`steps.${step.key}`),
    description: t(`steps.${step.key}Desc`),
    status: stepStatus[step.key as keyof OnboardingState],
  }));

  const renderStep = () => {
    const props = {
      onValidChange: (valid: boolean, data?: Record<string, unknown>) => {
        const stepKey = steps[currentStep - 1].key as keyof OnboardingState;
        updateStepStatus(stepKey, { valid, data });
      },
      status: stepStatus[steps[currentStep - 1].key as keyof OnboardingState],
    };

    switch (currentStep) {
      case 1:
        return <EnvSetupStep {...props} />;
      case 2:
        return <DatabaseStep {...props} />;
      case 3:
        return <AuthStep {...props} />;
      case 4:
        return <PaymentsStep {...props} onSkip={skipStep} />;
      case 5:
        return <AdminSetupStep {...props} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <OnboardingSidebar
        steps={stepsWithMeta}
        currentStep={currentStep}
        visitedSteps={visitedSteps}
        onStepClick={goToStep}
        progress={progress}
      />

      <div className="flex-1 flex flex-col">
        {/* Progress bar (mobile) */}
        <div className="h-1 bg-muted lg:hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' as const }}
            className="h-full bg-primary"
          />
        </div>

        {/* Step content with animation */}
        <div className="flex-1 p-6 sm:p-8 lg:p-12 xl:p-16 overflow-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' as const }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <OnboardingNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrev={prevStep}
          onNext={nextStep}
          canProceed={
            !steps[currentStep - 1].required ||
            stepStatus[steps[currentStep - 1].key as keyof OnboardingState].valid
          }
          isLastStep={currentStep === steps.length}
          isOptionalStep={!steps[currentStep - 1].required}
          onSkip={skipStep}
        />
      </div>
    </div>
  );
}
