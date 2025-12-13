/**
 * FeaturesGrid
 * A grid of feature cards with icons and descriptions.
 * Best for: Feature showcases, benefits sections, capability overviews
 */

import { cn } from '@/lib/utils';
import {
  LucideIcon,
  Zap,
  Shield,
  Globe,
  CreditCard,
  Users,
  Code,
} from 'lucide-react';

interface Feature {
  /** Feature icon */
  icon: LucideIcon;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
}

interface FeaturesGridProps {
  /** Section title */
  title: string;
  /** Section subtitle */
  subtitle?: string;
  /** Array of features to display */
  features: Feature[];
  /** Number of columns (2, 3, or 4) */
  columns?: 2 | 3 | 4;
  /** Additional CSS classes */
  className?: string;
}

export function FeaturesGrid({
  title,
  subtitle,
  features,
  columns = 3,
  className,
}: FeaturesGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Features Grid */}
        <div
          className={cn(
            'mt-12 grid gap-8 sm:gap-10',
            gridCols[columns]
          )}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">
                {feature.description}
              </p>

              {/* Decorative gradient */}
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Default features for demonstration
export const defaultFeatures: Feature[] = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Built on Next.js 15 with React Server Components for optimal performance.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      '2FA, audit logs, and role-based access control built-in from day one.',
  },
  {
    icon: Globe,
    title: '7-Language i18n',
    description:
      'Full internationalization support with EN, ES, FR, DE, PT, JA, and ZH.',
  },
  {
    icon: CreditCard,
    title: 'Multiple Payments',
    description:
      'Stripe, LemonSqueezy, and Polar integration with one-click switching.',
  },
  {
    icon: Users,
    title: 'Multi-Tenancy',
    description:
      'Organizations, team management, and role-based permissions included.',
  },
  {
    icon: Code,
    title: 'Developer Experience',
    description:
      'TypeScript, ESLint, Prettier, and comprehensive documentation.',
  },
];

// Example usage:
// <FeaturesGrid
//   title="Everything you need to ship fast"
//   subtitle="ShipKit Pro includes all the features you need to build and scale your SaaS."
//   features={defaultFeatures}
//   columns={3}
// />
