'use client';

/**
 * Setup Wizard Context
 * Manages wizard state, navigation, and localStorage persistence
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { WIZARD_STEPS, STORAGE_KEY } from './constants';

export interface StepData {
  provider?: string;
  configured?: boolean;
  skipped?: boolean;
  data?: Record<string, unknown>;
}

export interface WizardState {
  currentStep: number;
  direction: number;
  completedSteps: string[];
  stepData: Record<string, StepData>;
  startedAt: string;
  lastUpdatedAt: string;
}

interface WizardContextType {
  state: WizardState;
  currentStepConfig: (typeof WIZARD_STEPS)[number];
  totalSteps: number;
  progress: number;
  canGoBack: boolean;
  canGoForward: boolean;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  markComplete: (stepId: string, data?: StepData) => void;
  skipStep: (stepId: string) => void;
  updateStepData: (stepId: string, data: Partial<StepData>) => void;
  resetWizard: () => void;
}

const initialState: WizardState = {
  currentStep: 0,
  direction: 0,
  completedSteps: [],
  stepData: {},
  startedAt: new Date().toISOString(),
  lastUpdatedAt: new Date().toISOString(),
};

const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}

interface WizardProviderProps {
  children: ReactNode;
}

export function WizardProvider({ children }: WizardProviderProps) {
  const [state, setState] = useState<WizardState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WizardState;
        setState(parsed);
      }
    } catch {
      // Ignore errors, use initial state
    }
    setIsHydrated(true);
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    if (isHydrated) {
      const toSave = {
        ...state,
        lastUpdatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }
  }, [state, isHydrated]);

  const currentStepConfig = WIZARD_STEPS[state.currentStep];
  const totalSteps = WIZARD_STEPS.length;
  const progress = Math.round((state.currentStep / (totalSteps - 1)) * 100);
  const canGoBack = state.currentStep > 0;
  const canGoForward = state.currentStep < totalSteps - 1;

  const goToStep = useCallback((step: number) => {
    if (step < 0 || step >= WIZARD_STEPS.length) return;
    setState((prev) => ({
      ...prev,
      direction: step > prev.currentStep ? 1 : -1,
      currentStep: step,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep >= WIZARD_STEPS.length - 1) return prev;
      return {
        ...prev,
        direction: 1,
        currentStep: prev.currentStep + 1,
      };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep <= 0) return prev;
      return {
        ...prev,
        direction: -1,
        currentStep: prev.currentStep - 1,
      };
    });
  }, []);

  const markComplete = useCallback((stepId: string, data?: StepData) => {
    setState((prev) => {
      const completedSteps = prev.completedSteps.includes(stepId)
        ? prev.completedSteps
        : [...prev.completedSteps, stepId];

      return {
        ...prev,
        completedSteps,
        stepData: {
          ...prev.stepData,
          [stepId]: {
            ...prev.stepData[stepId],
            ...data,
            configured: true,
            skipped: false,
          },
        },
      };
    });
  }, []);

  const skipStep = useCallback((stepId: string) => {
    setState((prev) => {
      const completedSteps = prev.completedSteps.includes(stepId)
        ? prev.completedSteps
        : [...prev.completedSteps, stepId];

      return {
        ...prev,
        completedSteps,
        stepData: {
          ...prev.stepData,
          [stepId]: {
            ...prev.stepData[stepId],
            skipped: true,
            configured: false,
          },
        },
      };
    });
  }, []);

  const updateStepData = useCallback(
    (stepId: string, data: Partial<StepData>) => {
      setState((prev) => ({
        ...prev,
        stepData: {
          ...prev.stepData,
          [stepId]: {
            ...prev.stepData[stepId],
            ...data,
          },
        },
      }));
    },
    []
  );

  const resetWizard = useCallback(() => {
    setState({
      ...initialState,
      startedAt: new Date().toISOString(),
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Don't render until hydrated to avoid hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return (
    <WizardContext.Provider
      value={{
        state,
        currentStepConfig,
        totalSteps,
        progress,
        canGoBack,
        canGoForward,
        goToStep,
        nextStep,
        prevStep,
        markComplete,
        skipStep,
        updateStepData,
        resetWizard,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}
