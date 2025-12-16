'use client';

/**
 * Environment Check Step
 * Auto-detects configuration status and guides users through fixing issues
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Database,
  Shield,
  CreditCard,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWizard } from '../wizard-context';
import { WizardNavigation } from '../wizard-navigation';
import { fadeInVariants, staggerContainer } from '../constants';

interface EnvStatus {
  database: { configured: boolean; provider?: string };
  auth: { configured: boolean };
  payments: { configured: boolean; provider?: string };
  ai: { configured: boolean; provider?: string };
}

interface CheckResult {
  valid: boolean;
  missing: string[];
  configured: string[];
  optional: string[];
}

const envTemplate = `# Required
DATABASE_URL="postgresql://user:password@host:5432/dbname"
AUTH_SECRET="your-secret-key-min-32-chars"

# Optional - Payments (choose one)
# STRIPE_SECRET_KEY="sk_..."
# LEMONSQUEEZY_API_KEY="..."

# Optional - AI (choose one)
# OPENROUTER_API_KEY="..."
# OPENAI_API_KEY="sk-..."`;

export function EnvCheckStep() {
  const { nextStep, markComplete } = useWizard();
  const [isChecking, setIsChecking] = useState(true);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [envStatus, setEnvStatus] = useState<EnvStatus>({
    database: { configured: false },
    auth: { configured: false },
    payments: { configured: false },
    ai: { configured: false },
  });
  const [copied, setCopied] = useState(false);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);

  const checkEnvironment = useCallback(async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/setup/check-env');
      const data = await response.json();
      setCheckResult(data);

      // Determine status for each category
      const configured = data.configured || [];
      setEnvStatus({
        database: {
          configured: configured.includes('DATABASE_URL'),
          provider: configured.includes('DATABASE_URL') ? 'PostgreSQL' : undefined,
        },
        auth: {
          configured: configured.includes('AUTH_SECRET'),
        },
        payments: {
          configured: configured.some((v: string) =>
            ['STRIPE_SECRET_KEY', 'LEMONSQUEEZY_API_KEY', 'POLAR_ACCESS_TOKEN'].includes(v)
          ),
          provider: configured.includes('STRIPE_SECRET_KEY')
            ? 'Stripe'
            : configured.includes('LEMONSQUEEZY_API_KEY')
              ? 'LemonSqueezy'
              : configured.includes('POLAR_ACCESS_TOKEN')
                ? 'Polar'
                : undefined,
        },
        ai: {
          configured: configured.some((v: string) =>
            ['OPENROUTER_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY'].includes(v)
          ),
          provider: configured.includes('OPENROUTER_API_KEY')
            ? 'OpenRouter'
            : configured.includes('OPENAI_API_KEY')
              ? 'OpenAI'
              : configured.includes('ANTHROPIC_API_KEY')
                ? 'Anthropic'
                : undefined,
        },
      });
    } catch (error) {
      console.error('Failed to check environment:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkEnvironment();
  }, [checkEnvironment]);

  const handleCopyTemplate = async () => {
    await navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateAuthSecret = () => {
    // Generate a random 32-byte base64 string
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const secret = btoa(String.fromCharCode(...array));
    setGeneratedSecret(secret);
    navigator.clipboard.writeText(`AUTH_SECRET="${secret}"`);
  };

  const canProceed = envStatus.database.configured && envStatus.auth.configured;

  const handleNext = () => {
    if (canProceed) {
      markComplete('environment', {
        database: envStatus.database,
        auth: envStatus.auth,
        payments: envStatus.payments,
        ai: envStatus.ai,
      });
      nextStep();
    }
  };

  const statusItems = [
    {
      id: 'database',
      label: 'Database',
      icon: Database,
      status: envStatus.database,
      required: true,
      help: 'Add DATABASE_URL to your .env.local file',
      link: 'https://supabase.com/dashboard',
      linkText: 'Get Supabase URL',
    },
    {
      id: 'auth',
      label: 'Auth Secret',
      icon: Shield,
      status: envStatus.auth,
      required: true,
      help: 'Pre-generated for NextAuth. Switch to Supabase Auth or BetterAuth by updating AUTH_SECRET.',
      configuredHelp: 'Using NextAuth by default. Switch to Supabase Auth or BetterAuth by changing AUTH_SECRET.',
      action: {
        label: 'Generate New Secret',
        onClick: generateAuthSecret,
      },
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      status: envStatus.payments,
      required: false,
      help: 'Optional - Add Stripe or LemonSqueezy key',
      link: 'https://stripe.com/docs/keys',
      linkText: 'Get Stripe Keys',
    },
    {
      id: 'ai',
      label: 'AI Provider',
      icon: Bot,
      status: envStatus.ai,
      required: false,
      help: 'Optional - Add OpenRouter or OpenAI key',
      link: 'https://openrouter.ai/keys',
      linkText: 'Get OpenRouter Key',
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-6 lg:p-12 overflow-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={fadeInVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Step 2 of 4</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4">
              Check your environment
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Let&apos;s verify your configuration. Required items must be set up to continue.
            </p>
          </motion.div>

          {/* Status Cards */}
          <motion.div variants={fadeInVariants} className="space-y-3 mb-8">
            {statusItems.map((item) => {
              const isConfigured = item.status.configured;
              const StatusIcon = isConfigured
                ? CheckCircle2
                : item.required
                  ? XCircle
                  : AlertCircle;
              const statusColor = isConfigured
                ? 'text-green-500'
                : item.required
                  ? 'text-red-500'
                  : 'text-yellow-500';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    isConfigured
                      ? 'border-green-500/30 bg-green-500/5'
                      : item.required
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-yellow-500/30 bg-yellow-500/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isConfigured
                          ? 'bg-green-500/20'
                          : item.required
                            ? 'bg-red-500/20'
                            : 'bg-yellow-500/20'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${statusColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{item.label}</span>
                        {!item.required && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            Optional
                          </span>
                        )}
                        <StatusIcon className={`h-4 w-4 ml-auto ${statusColor}`} />
                      </div>
                      {isConfigured ? (
                        <div className="space-y-2">
                          <p className="text-sm text-green-600">
                            {item.status.provider
                              ? `Connected via ${item.status.provider}`
                              : 'Configured'}
                          </p>
                          {'configuredHelp' in item && item.configuredHelp && (
                            <p className="text-xs text-muted-foreground">{item.configuredHelp}</p>
                          )}
                          {item.action && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={item.action.onClick}
                              className="text-xs h-7"
                            >
                              {item.action.label}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">{item.help}</p>
                          <div className="flex flex-wrap gap-2">
                            {item.action && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={item.action.onClick}
                                className="text-xs h-7"
                              >
                                {item.action.label}
                              </Button>
                            )}
                            {item.link && (
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                                className="text-xs h-7"
                              >
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {item.linkText}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Generated Secret Display */}
          {generatedSecret && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30"
            >
              <p className="text-sm font-medium text-green-600 mb-2">
                Secret generated and copied! Add this to your .env.local:
              </p>
              <code className="text-xs bg-black/10 px-2 py-1 rounded break-all">
                AUTH_SECRET=&quot;{generatedSecret}&quot;
              </code>
            </motion.div>
          )}

          {/* Environment Template */}
          <motion.div variants={fadeInVariants} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">
                Environment Template
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyTemplate}
                className="gap-2 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy Template
                  </>
                )}
              </Button>
            </div>
            <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 text-xs overflow-x-auto">
              {envTemplate}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Add these to <code className="bg-muted px-1 rounded">.env.local</code> in your
              project root, then click Re-check.
            </p>
          </motion.div>

          {/* Re-check Button */}
          <motion.div variants={fadeInVariants}>
            <Button
              variant="outline"
              onClick={checkEnvironment}
              disabled={isChecking}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Re-check Environment'}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <WizardNavigation
        nextDisabled={!canProceed}
        onNext={handleNext}
        nextLabel={canProceed ? 'Continue' : 'Complete Required Steps'}
      />
    </div>
  );
}
