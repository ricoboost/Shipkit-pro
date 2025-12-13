'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Key,
  Mail,
  Lock,
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

interface AuthData {
  hasAuthSecret: boolean;
  provider: string;
  configuredOAuth: string[];
  [key: string]: unknown;
}

interface AuthStepProps {
  onValidChange: (valid: boolean, data?: Record<string, unknown>) => void;
  status: StepStatus;
}

// OAuth providers to check
const oauthProviders = [
  { id: 'google', name: 'Google', envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'], color: 'bg-red-500' },
  { id: 'github', name: 'GitHub', envVars: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'], color: 'bg-gray-800 dark:bg-gray-600' },
  { id: 'discord', name: 'Discord', envVars: ['DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET'], color: 'bg-indigo-500' },
];

export function AuthStep({ onValidChange, status }: AuthStepProps) {
  const t = useTranslations('onboarding.auth');
  const [checking, setChecking] = useState(false);
  const [authData, setAuthData] = useState<AuthData | null>(
    (status.data as unknown as AuthData | null) ?? null
  );

  useEffect(() => {
    if (!authData) {
      checkAuth();
    } else {
      // Already have data, mark as valid if auth secret exists
      onValidChange(authData.hasAuthSecret, authData);
    }
  }, []);

  const checkAuth = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/setup/check-env');
      const envData = await res.json();

      const hasAuthSecret = envData.configured.includes('AUTH_SECRET') || envData.configured.includes('NEXTAUTH_SECRET');
      const configuredOAuth = oauthProviders
        .filter(p => p.envVars.every(v => envData.configured.includes(v)))
        .map(p => p.id);

      const data = {
        hasAuthSecret,
        provider: 'nextauth', // Default provider
        configuredOAuth,
      };

      setAuthData(data);
      // Auth is valid as long as AUTH_SECRET is set (can use email/password)
      onValidChange(hasAuthSecret, data);
    } catch (error) {
      console.error('Failed to check auth:', error);
      onValidChange(false);
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
        <Badge variant="secondary" className="gap-1.5">
          <Shield className="w-3 h-3" />
          {t('badge')}
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('description')}
        </p>
      </motion.div>

      {/* Auth Secret Status */}
      <motion.div variants={itemVariants}>
        <Card className={authData?.hasAuthSecret ? 'border-green-500/50 bg-green-500/5' : ''}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {checking ? (
                <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
              ) : authData?.hasAuthSecret ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-destructive" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">
                    {checking
                      ? t('status.checking')
                      : authData?.hasAuthSecret
                        ? t('status.configured')
                        : t('status.notConfigured')}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {checking
                    ? t('status.checkingDesc')
                    : authData?.hasAuthSecret
                      ? t('status.configuredDesc')
                      : t('status.notConfiguredDesc')}
                </p>

                {!authData?.hasAuthSecret && !checking && (
                  <div className="mt-4 bg-muted rounded-lg p-3 font-mono text-sm">
                    <span className="text-muted-foreground"># Add to .env.local</span>
                    <br />
                    <span className="text-primary">AUTH_SECRET=</span>
                    <span className="text-muted-foreground">&quot;your-secret-here&quot;</span>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                onClick={checkAuth}
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

      {/* Authentication Methods */}
      <motion.div variants={itemVariants}>
        <h3 className="font-semibold mb-4">{t('methods.title')}</h3>
        <div className="space-y-3">
          {/* Email/Password - always available */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{t('methods.email.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('methods.email.desc')}</p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  {t('methods.available')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 2FA */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{t('methods.2fa.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('methods.2fa.desc')}</p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  {t('methods.builtin')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* OAuth Providers */}
      <motion.div variants={itemVariants}>
        <h3 className="font-semibold mb-4">{t('oauth.title')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {oauthProviders.map((provider) => {
            const isConfigured = authData?.configuredOAuth.includes(provider.id);
            return (
              <Card key={provider.id} className={isConfigured ? 'border-green-500/30' : 'border-dashed'}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${provider.color} flex items-center justify-center`}>
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{provider.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {isConfigured ? t('oauth.configured') : t('oauth.notConfigured')}
                      </p>
                    </div>
                    {isConfigured ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          {t('oauth.optional')}
        </p>
      </motion.div>

      {/* Info box */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {t('info.title')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('info.description')}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
