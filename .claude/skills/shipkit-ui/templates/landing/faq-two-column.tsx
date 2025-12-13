/**
 * FAQTwoColumn
 * A two-column FAQ layout without accordions.
 * Best for: Shorter FAQs, scannable content, landing pages
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface FAQItem {
  /** Question text */
  question: string;
  /** Answer text */
  answer: string;
}

interface FAQTwoColumnProps {
  /** Section title */
  title: string;
  /** Section subtitle */
  subtitle?: string;
  /** Array of FAQ items */
  items: FAQItem[];
  /** Show contact CTA */
  showContactCta?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function FAQTwoColumn({
  title,
  subtitle,
  items,
  showContactCta = true,
  className,
}: FAQTwoColumnProps) {
  // Split items into two columns
  const midpoint = Math.ceil(items.length / 2);
  const leftColumn = items.slice(0, midpoint);
  const rightColumn = items.slice(midpoint);

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

        {/* Two Column Grid */}
        <div className="mx-auto mt-12 grid max-w-5xl gap-x-12 gap-y-10 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-10">
            {leftColumn.map((item, index) => (
              <div key={index}>
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-10">
            {rightColumn.map((item, index) => (
              <div key={index}>
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        {showContactCta && (
          <div className="mx-auto mt-16 max-w-xl rounded-2xl border bg-card p-8 text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">
              Still have questions?
            </h3>
            <p className="mt-2 text-muted-foreground">
              Can't find the answer you're looking for? Our support team is here
              to help.
            </p>
            <Button className="mt-6" asChild>
              <a href="/contact">Contact Support</a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

// Default FAQ items for demonstration
export const defaultTwoColumnFAQItems: FAQItem[] = [
  {
    question: 'What is ShipKit Pro?',
    answer:
      'ShipKit Pro is an enterprise-grade Next.js boilerplate with authentication, payments, i18n, and 149+ components.',
  },
  {
    question: 'What payment providers are supported?',
    answer:
      'We support Stripe, LemonSqueezy, and Polar with our unique provider abstraction pattern.',
  },
  {
    question: 'How many projects can I use it for?',
    answer:
      'Starter includes 1 project, Pro and Enterprise include unlimited projects.',
  },
  {
    question: 'Do I get access to future updates?',
    answer:
      'Starter includes 6 months of updates. Pro and Enterprise include lifetime updates.',
  },
  {
    question: 'Is there a refund policy?',
    answer:
      'Yes, we offer a 30-day money-back guarantee, no questions asked.',
  },
  {
    question: 'What kind of support is included?',
    answer:
      'All plans include community support. Pro adds priority email, Enterprise adds custom onboarding.',
  },
];

// Example usage:
// <FAQTwoColumn
//   title="Common questions"
//   subtitle="Quick answers to help you get started"
//   items={defaultTwoColumnFAQItems}
//   showContactCta={true}
// />
