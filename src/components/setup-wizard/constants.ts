/**
 * Setup Wizard Constants
 * Step definitions, animation variants, and configuration
 */

import {
  Sparkles,
  Settings,
  User,
  Rocket,
  Database,
  CreditCard,
  Bot,
  type LucideIcon,
} from 'lucide-react';

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  required: boolean;
  skippable: boolean;
  hasWarning?: boolean;
}

/**
 * New simplified 4-step onboarding flow:
 * 1. Welcome - Interactive preview of what they're building
 * 2. Environment - Auto-detect and verify configuration
 * 3. Admin - Create admin account with real-time validation
 * 4. Success - Celebration + clear next steps
 */
export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'See what you\'re building',
    icon: Sparkles,
    required: false,
    skippable: true,
  },
  {
    id: 'environment',
    title: 'Environment',
    description: 'Check your configuration',
    icon: Settings,
    required: true,
    skippable: false,
  },
  {
    id: 'admin',
    title: 'Admin Account',
    description: 'Create your login',
    icon: User,
    required: true,
    skippable: false,
  },
  {
    id: 'success',
    title: 'Ready!',
    description: 'Start building',
    icon: Rocket,
    required: true,
    skippable: false,
  },
];

// Bump version to reset old wizard state when step structure changes
export const STORAGE_KEY = 'shipkit-setup-v3';

// Animation variants for framer-motion
export const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

export const slideTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as const,
};

export const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Provider definitions
export interface Provider {
  id: string;
  name: string;
  description: string;
  features: string[];
  recommended?: boolean;
  url: string;
}

export const DATABASE_PROVIDERS: Provider[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Open source Firebase alternative with PostgreSQL',
    features: ['PostgreSQL', 'Realtime', 'Auth built-in'],
    recommended: true,
    url: 'https://supabase.com',
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Serverless Postgres with branching and autoscaling',
    features: ['Serverless', 'Branching', 'Auto-suspend'],
    recommended: false,
    url: 'https://neon.tech',
  },
  {
    id: 'custom',
    name: 'Custom PostgreSQL',
    description: 'Bring your own PostgreSQL database',
    features: ['Self-hosted', 'Full control', 'Any provider'],
    recommended: false,
    url: '',
  },
];

export const AUTH_PROVIDERS: Provider[] = [
  {
    id: 'supabase',
    name: 'Supabase Auth',
    description: 'Built-in auth if using Supabase for database',
    features: ['Social logins', 'Magic links', 'Row-level security'],
    recommended: true,
    url: 'https://supabase.com/auth',
  },
  {
    id: 'nextauth',
    name: 'NextAuth.js',
    description: 'Flexible authentication for Next.js apps',
    features: ['Self-hosted', 'Many providers', 'Full control'],
    recommended: false,
    url: 'https://authjs.dev',
  },
  {
    id: 'betterauth',
    name: 'Better Auth',
    description: 'Modern, type-safe authentication library',
    features: ['Type-safe', 'Lightweight', 'Modern'],
    recommended: false,
    url: 'https://better-auth.com',
  },
];

export const PAYMENT_PROVIDERS: Provider[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Most popular payment platform worldwide',
    features: ['Subscriptions', 'One-time', 'Invoices'],
    recommended: true,
    url: 'https://stripe.com',
  },
  {
    id: 'lemonsqueezy',
    name: 'LemonSqueezy',
    description: 'Great for digital products with EU VAT handling',
    features: ['VAT handling', 'Affiliates', 'No entity needed'],
    recommended: false,
    url: 'https://lemonsqueezy.com',
  },
  {
    id: 'polar',
    name: 'Polar',
    description: 'Built for developers and open source',
    features: ['Open source', 'GitHub native', 'Simple'],
    recommended: false,
    url: 'https://polar.sh',
  },
];

export const AI_PROVIDERS: Provider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access 100+ AI models with one API key',
    features: ['100+ models', 'Pay per use', 'Fallbacks'],
    recommended: true,
    url: 'https://openrouter.ai',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-4o, and DALL-E models',
    features: ['GPT-4', 'DALL-E', 'Whisper'],
    recommended: false,
    url: 'https://platform.openai.com',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models for coding and analysis',
    features: ['Claude 3.5', 'Long context', 'Coding'],
    recommended: false,
    url: 'https://console.anthropic.com',
  },
];
