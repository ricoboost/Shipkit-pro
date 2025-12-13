'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  FileCode,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
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

interface EnvSetupStepProps {
  onValidChange: (valid: boolean, data?: Record<string, unknown>) => void;
  status: StepStatus;
}

interface EnvCheckData {
  valid: boolean;
  missing: string[];
  optional: string[];
  configured: string[];
  template: string;
  [key: string]: unknown;
}

export function EnvSetupStep({ onValidChange, status }: EnvSetupStepProps) {
  const t = useTranslations('onboarding.env');
  const [checking, setChecking] = useState(false);
  const [envData, setEnvData] = useState<EnvCheckData | null>(
    (status.data as unknown as EnvCheckData | null) ?? null
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!envData) {
      checkEnv();
    }
  }, []);

  const checkEnv = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/setup/check-env');
      const data: EnvCheckData = await res.json();
      setEnvData(data);
      onValidChange(data.valid, data);
    } catch (error) {
      console.error('Failed to check env:', error);
    } finally {
      setChecking(false);
    }
  };

  const copyTemplate = async () => {
    if (envData?.template) {
      await navigator.clipboard.writeText(envData.template);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const providers = [
    { name: 'Supabase', url: 'https://supabase.com', color: 'bg-emerald-500' },
    { name: 'Neon', url: 'https://neon.tech', color: 'bg-cyan-500' },
    { name: 'PlanetScale', url: 'https://planetscale.com', color: 'bg-orange-500' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-3xl"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-4">
        <Badge variant="secondary" className="gap-1.5">
          <FileCode className="w-3 h-3" />
          {t('badge')}
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('description')}
        </p>
      </motion.div>

      {/* Status card */}
      <motion.div variants={itemVariants}>
        <Card className={envData?.valid ? 'border-green-500/50 bg-green-500/5' : ''}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {checking ? (
                <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
              ) : envData?.valid ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">
                  {checking
                    ? t('status.checking')
                    : envData?.valid
                      ? t('status.valid')
                      : t('status.missing')}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {checking
                    ? t('status.checkingDesc')
                    : envData?.valid
                      ? t('status.validDesc')
                      : t('status.missingDesc')}
                </p>

                {/* Missing vars list */}
                {envData && !envData.valid && envData.missing.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-destructive">
                      {t('missing.title')}:
                    </p>
                    <ul className="space-y-1">
                      {envData.missing.map((varName) => (
                        <li key={varName} className="flex items-center gap-2 text-sm">
                          <XCircle className="w-4 h-4 text-destructive" />
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                            {varName}
                          </code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Configured vars */}
                {envData && envData.configured.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {t('configured.title')}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {envData.configured.map((varName) => (
                        <Badge key={varName} variant="secondary" className="gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {varName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkEnv}
                disabled={checking}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                {t('refresh')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Template section */}
      {envData && !envData.valid && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{t('template.title')}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyTemplate}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t('template.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t('template.copy')}
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {envData.template}
                </pre>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {t('template.instruction')}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Provider links */}
      <motion.div variants={itemVariants}>
        <h3 className="font-semibold mb-4">{t('providers.title')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <a
              key={provider.name}
              href={provider.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg ${provider.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{provider.name[0]}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{provider.name}</p>
                <p className="text-xs text-muted-foreground">{t('providers.getDb')}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      </motion.div>

      {/* Help info */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <FileCode className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {t('help.title')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('help.description')}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
