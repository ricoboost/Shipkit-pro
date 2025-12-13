'use client';

/**
 * Wizard Sidebar
 * Dark sidebar with logo, step list, animated progress, and stats
 */

import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWizard } from './wizard-context';
import { WIZARD_STEPS } from './constants';

export function WizardSidebar() {
  const { state, goToStep, progress } = useWizard();

  return (
    <div className="hidden lg:flex lg:w-[320px] xl:w-[400px] flex-col bg-zinc-900 text-white p-8 xl:p-12">
      {/* Logo */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">ShipKit</span>
        </div>
        <p className="text-white/60 text-sm">SaaS Boilerplate</p>
      </div>

      {/* Step List */}
      <div className="flex-1">
        <div className="relative">
          {WIZARD_STEPS.map((step, index) => {
            const isCompleted = state.completedSteps.includes(step.id);
            const isCurrent = state.currentStep === index;
            const isPast = index < state.currentStep;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="relative">
                <button
                  onClick={() => goToStep(index)}
                  className={cn(
                    'w-full flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 text-left',
                    isCurrent && 'bg-white/10',
                    !isCurrent && 'hover:bg-white/5'
                  )}
                >
                  {/* Step Icon */}
                  <div className="relative">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                      }}
                      className={cn(
                        'h-12 w-12 rounded-xl flex items-center justify-center border-2 transition-colors',
                        isCompleted
                          ? 'border-green-500 bg-green-500'
                          : isCurrent
                            ? 'border-primary bg-primary'
                            : 'border-white/20 bg-transparent'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <StepIcon
                          className={cn(
                            'h-5 w-5',
                            isCurrent ? 'text-primary-foreground' : 'text-white/40'
                          )}
                        />
                      )}
                    </motion.div>

                    {/* Connector Line */}
                    {index < WIZARD_STEPS.length - 1 && (
                      <div className="absolute top-14 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-white/10">
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: isPast || isCompleted ? 1 : 0 }}
                          transition={{ duration: 0.4 }}
                          className="w-full h-full bg-green-500 origin-top"
                        />
                      </div>
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 pt-1">
                    <h3
                      className={cn(
                        'font-medium transition-colors',
                        isCurrent ? 'text-white' : 'text-white/60'
                      )}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-white/40 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </button>

                {/* Spacer for connector */}
                {index < WIZARD_STEPS.length - 1 && <div className="h-4" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-auto pt-8 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{state.currentStep + 1}</div>
            <div className="text-xs text-white/40">Current</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{WIZARD_STEPS.length}</div>
            <div className="text-xs text-white/40">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{progress}%</div>
            <div className="text-xs text-white/40">Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
}
