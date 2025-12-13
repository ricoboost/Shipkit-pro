'use client';

/**
 * AI Step
 * Configure AI provider (optional)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useWizard } from '../wizard-context';
import { WizardNavigation } from '../wizard-navigation';
import { ProviderCard } from '../components/provider-card';
import { CopyableCode } from '../components/copyable-code';
import { TipBlock } from '../components/tip-block';
import { AIPromptBlock } from '../components/ai-prompt-block';
import { AI_PROVIDERS, fadeInVariants, staggerContainer } from '../constants';

const ENV_TEMPLATES: Record<string, { key: string; value: string }[]> = {
  openrouter: [
    { key: 'AI_PROVIDER', value: '"openrouter"' },
    { key: 'OPENROUTER_API_KEY', value: '"sk-or-..."' },
  ],
  openai: [
    { key: 'AI_PROVIDER', value: '"openai"' },
    { key: 'OPENAI_API_KEY', value: '"sk-..."' },
  ],
  anthropic: [
    { key: 'AI_PROVIDER', value: '"anthropic"' },
    { key: 'ANTHROPIC_API_KEY', value: '"sk-ant-..."' },
  ],
};

export function AIStep() {
  const { state, updateStepData, markComplete, skipStep, nextStep } = useWizard();
  const [selected, setSelected] = useState<string | null>(
    state.stepData.ai?.provider || null
  );

  const handleSelect = (providerId: string) => {
    setSelected(providerId);
    updateStepData('ai', { provider: providerId });
  };

  const handleContinue = () => {
    if (selected) {
      markComplete('ai', { provider: selected });
    }
    nextStep();
  };

  const handleSkip = () => {
    skipStep('ai');
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
              <Bot className="h-4 w-4" />
              <span className="text-sm font-medium">Step 5 of 6 (Optional)</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Add AI features
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Power your app with AI capabilities. OpenRouter gives you access
              to 100+ models with a single API key.
            </p>
          </motion.div>

          {/* Provider Cards */}
          <motion.div variants={fadeInVariants} className="grid gap-4 mb-8">
            {AI_PROVIDERS.map((provider) => (
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

          {/* OpenRouter tip */}
          {selected === 'openrouter' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TipBlock variant="tip">
                OpenRouter gives you <strong>$1 free credit</strong> to start -
                enough for thousands of API calls! Create an account at{' '}
                <a
                  href="https://openrouter.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  openrouter.ai
                </a>
              </TipBlock>
            </motion.div>
          )}

          {/* AI Prompt */}
          <motion.div variants={fadeInVariants} className="mt-6">
            <AIPromptBlock stepId="ai" />
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
