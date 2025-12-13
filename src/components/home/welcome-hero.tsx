'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSiteSettings } from '@/contexts/site-settings-context';

interface WelcomeHeroProps {
  userName?: string;
}

export function WelcomeHero({ userName }: WelcomeHeroProps) {
  const t = useTranslations('home.welcome');
  const { siteName } = useSiteSettings();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-12"
    >
      <Badge variant="secondary" className="mb-4 gap-1.5">
        <Sparkles className="w-3 h-3" />
        {t('badge')}
      </Badge>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
        {userName ? (
          t('titleWithName', { name: userName })
        ) : (
          <>
            {t('titlePrefix')} <span className="text-primary">{siteName}</span>
          </>
        )}
      </h1>

      <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
        {t('description')}
      </p>
    </motion.div>
  );
}
