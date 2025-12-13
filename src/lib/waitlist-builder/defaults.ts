/**
 * Default Templates for Waitlist Page Builder
 */

import { nanoid } from 'nanoid';
import type {
  WaitlistPageConfig,
  HeroSection,
  BentoSection,
  HowItWorksSection,
  FooterSection,
  SpacingConfig,
  BackgroundConfig,
  PageSection,
} from './types';

// ============== HELPER FUNCTIONS ==============

export function generateId(): string {
  return nanoid(10);
}

export const defaultSpacing: SpacingConfig = {
  paddingTop: 64,
  paddingBottom: 64,
  paddingLeft: 24,
  paddingRight: 24,
};

export const defaultBackground: BackgroundConfig = {
  type: 'color',
  color: '0 0% 100%',
};

// ============== DEFAULT SECTIONS ==============

export function createDefaultHeroSection(order: number = 0): HeroSection {
  return {
    id: generateId(),
    type: 'hero',
    order,
    visible: true,
    minHeight: 80,
    background: {
      type: 'gradient',
      gradient: {
        from: '240 5.9% 10%',
        to: '240 3.7% 15.9%',
        direction: 'to-br',
      },
    },
    spacing: {
      paddingTop: 96,
      paddingBottom: 96,
      paddingLeft: 24,
      paddingRight: 24,
    },
    content: {
      badge: {
        id: generateId(),
        type: 'text',
        content: 'Coming Soon',
        variant: 'muted',
        alignment: 'center',
        color: '0 0% 98%',
      },
      headline: {
        id: generateId(),
        type: 'text',
        content: 'Build Your Next Big Thing',
        variant: 'h1',
        alignment: 'center',
        color: '0 0% 98%',
      },
      subheadline: {
        id: generateId(),
        type: 'text',
        content:
          'Join thousands of early adopters and be the first to experience our revolutionary platform.',
        variant: 'lead',
        alignment: 'center',
        color: '240 5% 64.9%',
      },
      cta: {
        id: generateId(),
        type: 'subscribe-form',
        placeholder: 'Enter your email',
        buttonText: 'Join Waitlist',
        successMessage: "You're on the list! We'll be in touch soon.",
        source: 'waitlist',
        tags: ['early-access'],
      },
    },
  };
}

export function createDefaultBentoSection(order: number = 1): BentoSection {
  return {
    id: generateId(),
    type: 'bento',
    order,
    visible: true,
    background: defaultBackground,
    spacing: defaultSpacing,
    content: {
      title: {
        id: generateId(),
        type: 'text',
        content: 'Everything You Need',
        variant: 'h2',
        alignment: 'center',
      },
      subtitle: {
        id: generateId(),
        type: 'text',
        content: 'Powerful features to help you build faster',
        variant: 'lead',
        alignment: 'center',
        color: '240 3.8% 46.1%',
      },
      columns: 3,
      items: [
        {
          id: generateId(),
          title: 'Lightning Fast',
          description: 'Built for speed with cutting-edge technology',
          icon: 'Zap',
        },
        {
          id: generateId(),
          title: 'Secure by Default',
          description: 'Enterprise-grade security out of the box',
          icon: 'Shield',
        },
        {
          id: generateId(),
          title: 'Scale Infinitely',
          description: 'Grows with your business seamlessly',
          icon: 'TrendingUp',
        },
        {
          id: generateId(),
          title: 'Easy Integration',
          description: 'Connect with your favorite tools',
          icon: 'Plug',
        },
        {
          id: generateId(),
          title: 'Real-time Analytics',
          description: 'Insights that drive decisions',
          icon: 'BarChart3',
        },
        {
          id: generateId(),
          title: '24/7 Support',
          description: 'We are here when you need us',
          icon: 'Headphones',
        },
      ],
    },
  };
}

export function createDefaultHowItWorksSection(
  order: number = 2
): HowItWorksSection {
  return {
    id: generateId(),
    type: 'how-it-works',
    order,
    visible: true,
    background: {
      type: 'color',
      color: '240 4.8% 95.9%',
    },
    spacing: defaultSpacing,
    content: {
      title: {
        id: generateId(),
        type: 'text',
        content: 'How It Works',
        variant: 'h2',
        alignment: 'center',
      },
      subtitle: {
        id: generateId(),
        type: 'text',
        content: 'Get started in three simple steps',
        variant: 'lead',
        alignment: 'center',
        color: '240 3.8% 46.1%',
      },
      layout: 'horizontal',
      steps: [
        {
          id: generateId(),
          number: 1,
          title: 'Sign Up',
          description: 'Create your account in seconds',
          icon: 'UserPlus',
        },
        {
          id: generateId(),
          number: 2,
          title: 'Configure',
          description: 'Set up your workspace',
          icon: 'Settings',
        },
        {
          id: generateId(),
          number: 3,
          title: 'Launch',
          description: 'Go live and start growing',
          icon: 'Rocket',
        },
      ],
    },
  };
}

export function createDefaultFooterSection(order: number = 3): FooterSection {
  return {
    id: generateId(),
    type: 'footer',
    order,
    visible: true,
    background: {
      type: 'color',
      color: '240 5.9% 10%',
    },
    spacing: {
      paddingTop: 48,
      paddingBottom: 48,
      paddingLeft: 24,
      paddingRight: 24,
    },
    content: {
      copyright: '2024 YourCompany. All rights reserved.',
      links: [
        { id: generateId(), text: 'Privacy Policy', href: '/privacy' },
        { id: generateId(), text: 'Terms of Service', href: '/terms' },
        { id: generateId(), text: 'Contact', href: '/contact' },
      ],
      showSocial: true,
      socialLinks: {
        twitter: 'https://twitter.com',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
      },
    },
  };
}

// ============== DEFAULT PAGE CONFIG ==============

export function createDefaultPageConfig(): WaitlistPageConfig {
  return {
    version: 1,
    globalStyles: {
      maxWidth: 'xl',
    },
    sections: [
      createDefaultHeroSection(0),
      createDefaultBentoSection(1),
      createDefaultHowItWorksSection(2),
      createDefaultFooterSection(3),
    ],
  };
}

// ============== SECTION FACTORY ==============

export function createSection(
  type: PageSection['type'],
  order: number
): PageSection {
  switch (type) {
    case 'hero':
      return createDefaultHeroSection(order);
    case 'bento':
      return createDefaultBentoSection(order);
    case 'how-it-works':
      return createDefaultHowItWorksSection(order);
    case 'footer':
      return createDefaultFooterSection(order);
    default:
      throw new Error(`Unknown section type: ${type}`);
  }
}

// ============== SECTION TEMPLATES ==============

export const sectionTemplates = {
  hero: {
    name: 'Hero',
    description: 'Eye-catching header with headline and call-to-action',
    icon: 'Layout',
  },
  bento: {
    name: 'Features Grid',
    description: 'Showcase features in a beautiful grid layout',
    icon: 'Grid3X3',
  },
  'how-it-works': {
    name: 'How It Works',
    description: 'Step-by-step process explanation',
    icon: 'ListOrdered',
  },
  footer: {
    name: 'Footer',
    description: 'Page footer with links and social media',
    icon: 'PanelBottom',
  },
} as const;
