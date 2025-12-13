'use client';

/**
 * Setup Wizard - Main Component
 * Full-screen wizard with sidebar and animated step transitions
 */

import { motion, AnimatePresence } from 'framer-motion';
import { WizardProvider, useWizard } from './wizard-context';
import { WizardSidebar } from './wizard-sidebar';
import { slideVariants, slideTransition } from './constants';

// Step Components
import { WelcomeStep } from './steps/welcome-step';
import { DatabaseStep } from './steps/database-step';
import { AuthStep } from './steps/auth-step';
import { PaymentsStep } from './steps/payments-step';
import { AIStep } from './steps/ai-step';
import { LaunchStep } from './steps/launch-step';

function WizardContent() {
  const { state, progress } = useWizard();

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <DatabaseStep />;
      case 2:
        return <AuthStep />;
      case 3:
        return <PaymentsStep />;
      case 4:
        return <AIStep />;
      case 5:
        return <LaunchStep />;
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar (desktop only) */}
      <WizardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Progress Bar */}
        <div className="h-1 bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="h-full bg-primary"
          />
        </div>

        {/* Content Area with Step Transitions */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait" custom={state.direction}>
            <motion.div
              key={state.currentStep}
              custom={state.direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="h-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function SetupWizard() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}
