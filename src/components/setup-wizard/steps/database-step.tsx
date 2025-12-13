'use client';

/**
 * Database Step
 * Configure database connection with provider selection
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWizard } from '../wizard-context';
import { WizardNavigation } from '../wizard-navigation';
import { ProviderCard } from '../components/provider-card';
import { TipBlock } from '../components/tip-block';
import { AIPromptBlock } from '../components/ai-prompt-block';
import { DATABASE_PROVIDERS, fadeInVariants, staggerContainer } from '../constants';

export function DatabaseStep() {
  const { state, updateStepData, markComplete, skipStep, nextStep } = useWizard();
  const [selected, setSelected] = useState<string | null>(
    state.stepData.database?.provider || null
  );

  const handleSelect = (providerId: string) => {
    setSelected(providerId);
    updateStepData('database', { provider: providerId });
  };

  const handleContinue = () => {
    if (selected) {
      markComplete('database', { provider: selected });
    }
    nextStep();
  };

  const handleSkip = () => {
    skipStep('database');
    nextStep();
  };

  const selectedProvider = DATABASE_PROVIDERS.find((p) => p.id === selected);

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
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Step 2 of 6</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Choose your database
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Select a database provider to store your application data. All
              options offer generous free tiers to get started.
            </p>
          </motion.div>

          {/* Provider Cards */}
          <motion.div variants={fadeInVariants} className="grid gap-4 mb-8">
            {DATABASE_PROVIDERS.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isSelected={selected === provider.id}
                onSelect={() => handleSelect(provider.id)}
              />
            ))}
          </motion.div>

          {/* Next Steps (when selected) */}
          {selected && selectedProvider && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-muted/50 border mb-8"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-2">
                    Next steps
                  </h4>
                  <ol className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                        1
                      </span>
                      Create a free account on {selectedProvider.name}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                        2
                      </span>
                      Create a new database project
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                        3
                      </span>
                      Copy your connection URL to .env file
                    </li>
                  </ol>
                </div>
                {selectedProvider.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 shrink-0"
                    asChild
                  >
                    <a
                      href={selectedProvider.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open {selectedProvider.name}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Skip Warning */}
          <motion.div variants={fadeInVariants}>
            <TipBlock variant="warning">
              <strong>Want to skip?</strong> Without a database, you&apos;ll be
              limited to demo mode. You can always configure this later.
            </TipBlock>
          </motion.div>

          {/* AI Prompt */}
          <motion.div variants={fadeInVariants} className="mt-6">
            <AIPromptBlock stepId="database" />
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
