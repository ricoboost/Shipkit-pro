'use client';

/**
 * Payments Step
 * Configure payment provider (optional)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import { useWizard } from '../wizard-context';
import { WizardNavigation } from '../wizard-navigation';
import { ProviderCard } from '../components/provider-card';
import { CopyableCode } from '../components/copyable-code';
import { TipBlock } from '../components/tip-block';
import { AIPromptBlock } from '../components/ai-prompt-block';
import { PAYMENT_PROVIDERS, fadeInVariants, staggerContainer } from '../constants';

const ENV_TEMPLATES: Record<string, { key: string; value: string }[]> = {
  stripe: [
    { key: 'PAYMENT_PROVIDER', value: '"stripe"' },
    { key: 'STRIPE_SECRET_KEY', value: '"sk_test_..."' },
    { key: 'STRIPE_PUBLISHABLE_KEY', value: '"pk_test_..."' },
    { key: 'STRIPE_WEBHOOK_SECRET', value: '"whsec_..."' },
  ],
  lemonsqueezy: [
    { key: 'PAYMENT_PROVIDER', value: '"lemonsqueezy"' },
    { key: 'LEMONSQUEEZY_API_KEY', value: '"..."' },
    { key: 'LEMONSQUEEZY_STORE_ID', value: '"..."' },
    { key: 'LEMONSQUEEZY_WEBHOOK_SECRET', value: '"..."' },
  ],
  polar: [
    { key: 'PAYMENT_PROVIDER', value: '"polar"' },
    { key: 'POLAR_ACCESS_TOKEN', value: '"..."' },
    { key: 'POLAR_WEBHOOK_SECRET', value: '"..."' },
  ],
};

export function PaymentsStep() {
  const { state, updateStepData, markComplete, skipStep, nextStep } = useWizard();
  const [selected, setSelected] = useState<string | null>(
    state.stepData.payments?.provider || null
  );

  const handleSelect = (providerId: string) => {
    setSelected(providerId);
    updateStepData('payments', { provider: providerId });
  };

  const handleContinue = () => {
    if (selected) {
      markComplete('payments', { provider: selected });
    }
    nextStep();
  };

  const handleSkip = () => {
    skipStep('payments');
    nextStep();
  };

  const envVars = selected ? ENV_TEMPLATES[selected] : [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-8 lg:p-16 overflow-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          {/* Header */}
          <motion.div variants={fadeInVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">Step 4 of 6 (Optional)</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Accept payments
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Choose a payment provider to start accepting payments from your
              customers. You can skip this step and configure later.
            </p>
          </motion.div>

          {/* Provider Cards */}
          <motion.div variants={fadeInVariants} className="grid gap-4 mb-8">
            {PAYMENT_PROVIDERS.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isSelected={selected === provider.id}
                onSelect={() => handleSelect(provider.id)}
              />
            ))}
          </motion.div>

          {/* Environment Variables */}
          {selected && envVars.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 mb-8"
            >
              <h3 className="font-medium text-foreground">
                Add to your .env file:
              </h3>
              <div className="space-y-2">
                {envVars.map((env) => (
                  <CopyableCode
                    key={env.key}
                    code={`${env.key}=${env.value}`}
                    label={env.key}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Stripe tip */}
          {selected === 'stripe' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TipBlock variant="tip">
                Start with test mode! Use card number{' '}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  4242 4242 4242 4242
                </code>{' '}
                with any future date and CVC to test payments.
              </TipBlock>
            </motion.div>
          )}

          {/* AI Prompt */}
          <motion.div variants={fadeInVariants} className="mt-6">
            <AIPromptBlock stepId="payments" />
          </motion.div>
        </motion.div>
      </div>

      <WizardNavigation
        showSkip={true}
        onSkip={handleSkip}
        onNext={handleContinue}
      />
    </div>
  );
}
