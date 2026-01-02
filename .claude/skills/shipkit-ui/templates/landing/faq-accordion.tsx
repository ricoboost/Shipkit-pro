/**
 * FAQAccordion
 * An expandable FAQ section with accordion items.
 * Best for: FAQ pages, support sections, product information
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  /** Question text */
  question: string;
  /** Answer text (supports markdown/HTML) */
  answer: string;
}

interface FAQAccordionProps {
  /** Section title */
  title: string;
  /** Section subtitle */
  subtitle?: string;
  /** Array of FAQ items */
  items: FAQItem[];
  /** Allow multiple items open at once */
  multiple?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function FAQAccordion({
  title,
  subtitle,
  items,
  multiple = false,
  className,
}: FAQAccordionProps) {
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

        {/* FAQ Accordion */}
        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion
            type={multiple ? 'multiple' : 'single'}
            collapsible={!multiple}
            className="space-y-4"
          >
            {items.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-lg border bg-card px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-medium">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Still have questions?{' '}
            <Link
              href="/contact"
              className="font-medium text-primary hover:underline"
            >
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

// Default FAQ items for demonstration
export const defaultFAQItems: FAQItem[] = [
  {
    question: 'What is ShipKit Pro?',
    answer:
      'ShipKit Pro is an enterprise-grade Next.js boilerplate that includes authentication, payments, i18n, and 149+ components. It\'s designed to help you ship your SaaS faster with production-ready code.',
  },
  {
    question: 'What payment providers are supported?',
    answer:
      'ShipKit Pro supports <strong>Stripe</strong>, <strong>LemonSqueezy</strong>, and <strong>Polar</strong>. Thanks to our unique provider abstraction pattern, you can switch between them with a single environment variable change.',
  },
  {
    question: 'How many projects can I use it for?',
    answer:
      'It depends on your license:<br/><br/>• <strong>Starter:</strong> 1 project<br/>• <strong>Pro:</strong> Unlimited projects<br/>• <strong>Enterprise:</strong> Unlimited projects + team seats',
  },
  {
    question: 'Do I get access to future updates?',
    answer:
      'Yes! Starter licenses include 6 months of updates. Pro and Enterprise licenses include <strong>lifetime updates</strong> at no additional cost.',
  },
  {
    question: 'Is there a refund policy?',
    answer:
      'Yes, we offer a <strong>30-day money-back guarantee</strong>, no questions asked. If you\'re not satisfied with ShipKit Pro, just contact us for a full refund.',
  },
  {
    question: 'What languages are supported for i18n?',
    answer:
      'ShipKit Pro includes built-in support for 7 languages: English, Spanish, French, German, Portuguese, Japanese, and Chinese. Adding more languages is straightforward with our translation system.',
  },
  {
    question: 'Can I use ShipKit Pro for client projects?',
    answer:
      'Absolutely! Pro and Enterprise licenses allow you to use ShipKit Pro for unlimited client projects. Each client project counts as one project for the Starter license.',
  },
  {
    question: 'What kind of support is included?',
    answer:
      '• <strong>Starter:</strong> Community support via Discord<br/>• <strong>Pro:</strong> Priority email support + Discord<br/>• <strong>Enterprise:</strong> Priority support (24h response) + custom onboarding call',
  },
];

// Example usage:
// <FAQAccordion
//   title="Frequently asked questions"
//   subtitle="Everything you need to know about ShipKit Pro"
//   items={defaultFAQItems}
// />
