'use client';

/**
 * Auth Step
 * Configure authentication provider
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useWizard } from '../wizard-context';
import { WizardNavigation } from '../wizard-navigation';
import { ProviderCard } from '../components/provider-card';
import { CopyableCode } from '../components/copyable-code';
import { TipBlock } from '../components/tip-block';
import { AIPromptBlock } from '../components/ai-prompt-block';
import { AUTH_PROVIDERS, fadeInVariants, staggerContainer } from '../constants';

const ENV_TEMPLATES: Record<string, { key: string; value: string }[]> = {
  supabase: [
    { key: 'AUTH_PROVIDER', value: '"supabase"' },
    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: '"your-project-url"' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: '"your-anon-key"' },
  ],
  nextauth: [
    { key: 'AUTH_PROVIDER', value: '"nextauth"' },
    { key: 'AUTH_SECRET', value: '"generate-with-openssl-rand-base64-32"' },
    { key: 'NEXTAUTH_URL', value: '"http://localhost:3000"' },
  ],
  betterauth: [
    { key: 'AUTH_PROVIDER', value: '"betterauth"' },
    { key: 'BETTER_AUTH_SECRET', value: '"your-secret-here"' },
    { key: 'BETTER_AUTH_URL', value: '"http://localhost:3000"' },
  ],
};

export function AuthStep() {
  const { state, updateStepData, markComplete, nextStep } = useWizard();
  const [selected, setSelected] = useState<string | null>(
    state.stepData.auth?.provider || null
  );

  const handleSelect = (providerId: string) => {
    setSelected(providerId);
    updateStepData('auth', { provider: providerId });
  };

  const handleContinue = () => {
    if (selected) {
      markComplete('auth', { provider: selected });
      nextStep();
    }
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
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Step 3 of 6</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Setup authentication
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Choose how users will sign in to your application. All options
              support social logins (Google, GitHub, etc.)
            </p>
          </motion.div>

          {/* Supabase hint if database is Supabase */}
          {state.stepData.database?.provider === 'supabase' && (
            <motion.div variants={fadeInVariants} className="mb-6">
              <TipBlock variant="info">
                <strong>Tip:</strong> Since you&apos;re using Supabase for your
                database, Supabase Auth is recommended for seamless integration.
              </TipBlock>
            </motion.div>
          )}

          {/* Provider Cards */}
          <motion.div variants={fadeInVariants} className="grid gap-4 mb-8">
            {AUTH_PROVIDERS.map((provider) => (
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

          {/* NextAuth tip */}
          {selected === 'nextauth' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TipBlock variant="tip">
                Generate a secure secret by running:{' '}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                  openssl rand -base64 32
                </code>
              </TipBlock>
            </motion.div>
          )}

          {/* AI Prompt */}
          <motion.div variants={fadeInVariants} className="mt-6">
            <AIPromptBlock stepId="auth" />
          </motion.div>
        </motion.div>
      </div>

      <WizardNavigation
        onNext={handleContinue}
        nextDisabled={!selected}
        nextLabel={!selected ? 'Select a provider' : 'Continue'}
      />
    </div>
  );
}
