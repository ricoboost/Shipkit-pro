'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Shield,
  CreditCard,
  Bot,
  Users,
  Palette,
  FileCode,
  Database,
  Globe,
  Rocket,
  Settings,
  BookOpen,
  LayoutDashboard,
  Code2,
  ShieldCheck,
  ListTodo,
  TestTube,
  GitBranch,
  AlertTriangle,
  Container,
  Search,
  Mail,
  BarChart3,
} from 'lucide-react';
import { BentoCard } from './bento-card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export function BentoGrid() {
  const t = useTranslations('home.bento');

  // Simple 4-column equal grid
  const features = [
    {
      key: 'auth',
      icon: Shield,
      gradient: 'from-green-500/10 to-emerald-500/5',
      highlights: ['auth.h1', 'auth.h2', 'auth.h3'],
    },
    {
      key: 'payments',
      icon: CreditCard,
      gradient: 'from-purple-500/10 to-violet-500/5',
      highlights: ['payments.h1', 'payments.h2', 'payments.h3'],
    },
    {
      key: 'ai',
      icon: Bot,
      gradient: 'from-blue-500/10 to-cyan-500/5',
      highlights: ['ai.h1', 'ai.h2'],
    },
    {
      key: 'database',
      icon: Database,
      gradient: 'from-teal-500/10 to-cyan-500/5',
      highlights: ['database.h1', 'database.h2'],
    },
    {
      key: 'teams',
      icon: Users,
      gradient: 'from-orange-500/10 to-amber-500/5',
      highlights: ['teams.h1', 'teams.h2'],
    },
    {
      key: 'i18n',
      icon: Globe,
      gradient: 'from-indigo-500/10 to-blue-500/5',
      highlights: ['i18n.h1', 'i18n.h2'],
    },
    {
      key: 'theming',
      icon: Palette,
      gradient: 'from-pink-500/10 to-rose-500/5',
      highlights: ['theming.h1', 'theming.h2'],
    },
    {
      key: 'security',
      icon: ShieldCheck,
      gradient: 'from-red-500/10 to-rose-500/5',
      highlights: ['security.h1', 'security.h2'],
    },
    {
      key: 'api',
      icon: Code2,
      gradient: 'from-slate-500/10 to-gray-500/5',
      highlights: ['api.h1', 'api.h2'],
    },
    {
      key: 'testing',
      icon: TestTube,
      gradient: 'from-yellow-500/10 to-amber-500/5',
      highlights: ['testing.h1', 'testing.h2'],
    },
    {
      key: 'cicd',
      icon: GitBranch,
      gradient: 'from-cyan-500/10 to-sky-500/5',
      highlights: ['cicd.h1', 'cicd.h2'],
    },
    {
      key: 'monitoring',
      icon: AlertTriangle,
      gradient: 'from-orange-500/10 to-red-500/5',
      highlights: ['monitoring.h1', 'monitoring.h2'],
    },
    {
      key: 'docker',
      icon: Container,
      gradient: 'from-blue-500/10 to-indigo-500/5',
      highlights: ['docker.h1', 'docker.h2'],
    },
    {
      key: 'seo',
      icon: Search,
      gradient: 'from-green-500/10 to-lime-500/5',
      highlights: ['seo.h1', 'seo.h2'],
    },
    {
      key: 'email',
      icon: Mail,
      gradient: 'from-violet-500/10 to-purple-500/5',
      highlights: ['email.h1', 'email.h2'],
    },
    {
      key: 'analytics',
      icon: BarChart3,
      gradient: 'from-emerald-500/10 to-teal-500/5',
      highlights: ['analytics.h1', 'analytics.h2'],
    },
  ];

  const quickActions = [
    {
      key: 'dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      gradient: 'from-primary/10 to-primary/5',
    },
    {
      key: 'docs',
      icon: BookOpen,
      href: '/docs',
      gradient: 'from-blue-500/10 to-blue-500/5',
    },
    {
      key: 'settings',
      icon: Settings,
      href: '/admin/settings',
      gradient: 'from-gray-500/10 to-gray-500/5',
    },
    {
      key: 'adminPanel',
      icon: ShieldCheck,
      href: '/admin',
      gradient: 'from-red-500/10 to-red-500/5',
    },
    {
      key: 'themeBuilder',
      icon: Palette,
      href: '/admin/theme',
      gradient: 'from-pink-500/10 to-rose-500/5',
    },
    {
      key: 'waitlistBuilder',
      icon: ListTodo,
      href: '/admin/waitlist/editor',
      gradient: 'from-violet-500/10 to-violet-500/5',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      {/* Quick Actions Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          {t('quickActions.title')}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <BentoCard
              key={action.key}
              title={t(`quickActions.${action.key}.title`)}
              description={t(`quickActions.${action.key}.description`)}
              icon={action.icon}
              href={action.href}
              gradient={action.gradient}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-primary" />
          {t('features.title')}
        </h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {features.map((feature) => (
            <BentoCard
              key={feature.key}
              title={t(`features.${feature.key}.title`)}
              description={t(`features.${feature.key}.description`)}
              icon={feature.icon}
              gradient={feature.gradient}
              highlights={feature.highlights.map((h) => t(`features.${h}`))}
            />
          ))}
        </div>
      </div>

      {/* Getting Started Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-8"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{t('gettingStarted.title')}</h3>
            <p className="text-muted-foreground">
              {t('gettingStarted.description')}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              {t('gettingStarted.viewDocs')}
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <Code2 className="w-4 h-4" />
              {t('gettingStarted.viewSource')}
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
