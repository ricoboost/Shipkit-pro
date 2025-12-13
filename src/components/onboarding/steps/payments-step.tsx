'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  RefreshCw,
  SkipForward,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { StepStatus } from '../onboarding-wizard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface PaymentsStepProps {
  onValidChange: (valid: boolean, data?: Record<string, unknown>) => void;
  status: StepStatus;
  onSkip?: () => void;
}

const paymentProviders = [
  {
    id: 'stripe',
    name: 'Stripe',
    envVars: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY'],
    color: 'bg-purple-500',
    url: 'https://dashboard.stripe.com/apikeys',
    features: ['Subscriptions', 'One-time', 'Webhooks'],
  },
  {
    id: 'lemonsqueezy',
    name: 'LemonSqueezy',
    envVars: ['LEMONSQUEEZY_API_KEY'],
    color: 'bg-yellow-500',
    url: 'https://app.lemonsqueezy.com/settings/api',
    features: ['Subscriptions', 'Digital', 'Global'],
  },
  {
    id: 'polar',
    name: 'Polar',
    envVars: ['POLAR_ACCESS_TOKEN'],
    color: 'bg-blue-500',
    url: 'https://polar.sh/settings',
    features: ['Sponsorships', 'Subscriptions', 'Open Source'],
  },
];

export function PaymentsStep({ onValidChange, status, onSkip }: PaymentsStepProps) {
  const t = useTranslations('onboarding.payments');
  const [checking, setChecking] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    configuredProviders: string[];
    hasAnyProvider: boolean;
    [key: string]: unknown;
  } | null>((status.data as unknown as { configuredProviders: string[]; hasAnyProvider: boolean; [key: string]: unknown } | null) ?? null);

  useEffect(() => {
    if (!paymentData) {
      checkPayments();
    } else {
      // Payments are optional, so always valid for proceeding
      onValidChange(true, paymentData);
    }
  }, []);

  const checkPayments = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/setup/check-env');
      const envData = await res.json();

      const configuredProviders = paymentProviders
        .filter(p => p.envVars.some(v => envData.configured.includes(v)))
        .map(p => p.id);

      const data = {
        configuredProviders,
        hasAnyProvider: configuredProviders.length > 0,
      };

      setPaymentData(data);
      // Payments are optional, always valid
      onValidChange(true, data);
    } catch (error) {
      console.error('Failed to check payments:', error);
      onValidChange(true); // Still valid even on error
    } finally {
      setChecking(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-3xl"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <CreditCard className="w-3 h-3" />
            {t('badge')}
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            {t('optional')}
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('description')}
        </p>
      </motion.div>

      {/* Skip button */}
      <motion.div variants={itemVariants}>
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <SkipForward className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1">
                <h3 className="font-semibold">{t('skip.title')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('skip.description')}
                </p>
              </div>
              <Button variant="outline" onClick={onSkip} className="gap-2">
                <SkipForward className="w-4 h-4" />
                {t('skip.button')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Providers */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{t('providers.title')}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkPayments}
            disabled={checking}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
        </div>
        <div className="space-y-3">
          {paymentProviders.map((provider) => {
            const isConfigured = paymentData?.configuredProviders.includes(provider.id);
            return (
              <Card key={provider.id} className={isConfigured ? 'border-green-500/50 bg-green-500/5' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg ${provider.color} flex items-center justify-center shrink-0`}>
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{provider.name}</p>
                        {isConfigured && (
                          <Badge variant="secondary" className="gap-1 text-green-600">
                            <CheckCircle2 className="w-3 h-3" />
                            {t('providers.configured')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {provider.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      {!isConfigured && (
                        <div className="mt-3 text-sm text-muted-foreground">
                          <span>{t('providers.required')}: </span>
                          {provider.envVars.map((v, i) => (
                            <span key={v}>
                              <code className="bg-muted px-1 rounded text-xs">{v}</code>
                              {i < provider.envVars.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isConfigured ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-muted-foreground" />
                      )}
                      <a
                        href={provider.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {t('providers.getKeys')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Warning */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              {t('warning.title')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('warning.description')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Status summary */}
      {paymentData && (
        <motion.div variants={itemVariants}>
          <div className={`flex items-start gap-3 p-4 rounded-lg ${
            paymentData.hasAnyProvider
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-muted border border-border'
          }`}>
            {paymentData.hasAnyProvider ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            ) : (
              <CreditCard className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-medium ${
                paymentData.hasAnyProvider ? 'text-green-600 dark:text-green-400' : ''
              }`}>
                {paymentData.hasAnyProvider ? t('status.ready') : t('status.notConfigured')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {paymentData.hasAnyProvider
                  ? t('status.readyDesc', { count: paymentData.configuredProviders.length })
                  : t('status.notConfiguredDesc')}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
