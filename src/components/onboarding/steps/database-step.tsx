'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Database,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Terminal,
  AlertTriangle,
  ExternalLink,
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

interface DatabaseStepProps {
  onValidChange: (valid: boolean, data?: Record<string, unknown>) => void;
  status: StepStatus;
}

interface DbCheckData {
  connected: boolean;
  error?: string;
  provider?: string;
  troubleshooting?: string[];
  [key: string]: unknown;
}

export function DatabaseStep({ onValidChange, status }: DatabaseStepProps) {
  const t = useTranslations('onboarding.database');
  const [checking, setChecking] = useState(false);
  const [dbData, setDbData] = useState<DbCheckData | null>(
    (status.data as unknown as DbCheckData | null) ?? null
  );

  useEffect(() => {
    if (!dbData) {
      checkDb();
    }
  }, []);

  const checkDb = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/setup/check-db');
      const data: DbCheckData = await res.json();
      setDbData(data);
      onValidChange(data.connected, data);
    } catch (error) {
      console.error('Failed to check db:', error);
      setDbData({ connected: false, error: 'Failed to check database connection' });
      onValidChange(false);
    } finally {
      setChecking(false);
    }
  };

  const providerInfo: Record<string, { name: string; color: string; docs: string }> = {
    supabase: { name: 'Supabase', color: 'bg-emerald-500', docs: 'https://supabase.com/docs' },
    neon: { name: 'Neon', color: 'bg-cyan-500', docs: 'https://neon.tech/docs' },
    planetscale: { name: 'PlanetScale', color: 'bg-orange-500', docs: 'https://planetscale.com/docs' },
    postgresql: { name: 'PostgreSQL', color: 'bg-blue-500', docs: 'https://www.postgresql.org/docs/' },
    mysql: { name: 'MySQL', color: 'bg-blue-600', docs: 'https://dev.mysql.com/doc/' },
    unknown: { name: 'Database', color: 'bg-gray-500', docs: '' },
  };

  const provider = dbData?.provider ? providerInfo[dbData.provider] || providerInfo.unknown : null;

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
          <Database className="w-3 h-3" />
          {t('badge')}
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('description')}
        </p>
      </motion.div>

      {/* Connection status card */}
      <motion.div variants={itemVariants}>
        <Card className={dbData?.connected ? 'border-green-500/50 bg-green-500/5' : ''}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {checking ? (
                <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
              ) : dbData?.connected ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-destructive" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">
                    {checking
                      ? t('status.checking')
                      : dbData?.connected
                        ? t('status.connected')
                        : t('status.notConnected')}
                  </h3>
                  {provider && dbData?.connected && (
                    <Badge variant="outline" className="gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${provider.color}`} />
                      {provider.name}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {checking
                    ? t('status.checkingDesc')
                    : dbData?.connected
                      ? t('status.connectedDesc')
                      : t('status.notConnectedDesc')}
                </p>

                {/* Error message */}
                {dbData?.error && !dbData.connected && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-mono">{dbData.error}</p>
                  </div>
                )}

                {/* Troubleshooting tips */}
                {dbData?.troubleshooting && dbData.troubleshooting.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                      {t('troubleshooting.title')}:
                    </p>
                    <ul className="space-y-1.5">
                      {dbData.troubleshooting.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                onClick={checkDb}
                disabled={checking}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                {t('testConnection')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Prisma migration info */}
      {dbData?.connected && (
        <motion.div variants={itemVariants}>
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Terminal className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{t('migration.title')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('migration.description')}
                  </p>
                  <div className="mt-3 bg-background rounded-lg p-3 font-mono text-sm">
                    <span className="text-muted-foreground">$</span>{' '}
                    <span className="text-primary">npx prisma db push</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Provider docs link */}
      {provider && provider.docs && (
        <motion.div variants={itemVariants}>
          <a
            href={provider.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg ${provider.color} flex items-center justify-center`}>
              <Database className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{provider.name} {t('docs')}</p>
              <p className="text-sm text-muted-foreground">{t('docsDesc')}</p>
            </div>
            <ExternalLink className="w-5 h-5 text-muted-foreground" />
          </a>
        </motion.div>
      )}

      {/* Success info */}
      {dbData?.connected && (
        <motion.div variants={itemVariants}>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                {t('success.title')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('success.description')}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
