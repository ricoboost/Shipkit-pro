import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpen, Rocket, Zap, Shield, CreditCard, Bot } from 'lucide-react';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span className="font-bold">ShipKit Docs</span>
    ),
  },
  links: [
    {
      text: 'Home',
      url: '/',
    },
    {
      text: 'Documentation',
      url: '/docs',
      active: 'nested-url',
    },
    {
      text: 'Dashboard',
      url: '/dashboard',
    },
  ],
  githubUrl: 'https://github.com/your-org/shipkit',
};
