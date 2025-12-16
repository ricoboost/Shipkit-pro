'use client';

/**
 * Setup Wizard - Main Component
 * Full-screen wizard with sidebar and animated step transitions
 *
 * New 4-step flow:
 * 1. Welcome - Interactive preview of what they're building
 * 2. Environment - Auto-detect and verify configuration
 * 3. Admin - Create admin account with real-time validation
 * 4. Success - Celebration + clear next steps
 */

import { motion, AnimatePresence } from 'framer-motion';
import { WizardProvider, useWizard } from './wizard-context';
import { WizardSidebar } from './wizard-sidebar';
import { slideVariants, slideTransition } from './constants';

// New Step Components (4 steps)
import { WelcomeStep } from './steps/welcome-step';
import { EnvCheckStep } from './steps/env-check-step';
import { AdminStep } from './steps/admin-step';
import { SuccessStep } from './steps/success-step';

function WizardContent() {
  const { state, progress } = useWizard();

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <EnvCheckStep />;
      case 2:
        return <AdminStep />;
      case 3:
        return <SuccessStep />;
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
