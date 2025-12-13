'use client';

import { FAQAccordion } from '@/components/marketing/faq/faq-accordion';
import { FAQTwoColumn } from '@/components/marketing/faq/faq-two-column';
import { FAQCategorized } from '@/components/marketing/faq/faq-categorized';
import { sampleFAQs } from './sample-data';
import { Rocket, CreditCard, Settings } from 'lucide-react';

export function FAQAccordionPreview() {
  return (
    <FAQAccordion
      subtitle="FAQ"
      title="Frequently Asked Questions"
      description="Everything you need to know about our product."
      items={sampleFAQs}
      variant="default"
    />
  );
}

export function FAQAccordionBorderedPreview() {
  return (
    <FAQAccordion
      subtitle="FAQ"
      title="Frequently Asked Questions"
      items={sampleFAQs}
      variant="bordered"
    />
  );
}

export function FAQAccordionSeparatedPreview() {
  return (
    <FAQAccordion
      subtitle="FAQ"
      title="Frequently Asked Questions"
      items={sampleFAQs}
      variant="separated"
    />
  );
}

export function FAQTwoColumnPreview() {
  return (
    <FAQTwoColumn
      subtitle="Got Questions?"
      title="We're Here to Help"
      description="Find quick answers to common questions."
      items={sampleFAQs.slice(0, 4)}
    />
  );
}

export function FAQCategorizedPreview() {
  return (
    <FAQCategorized
      subtitle="Help Center"
      title="Find Answers"
      categories={[
        {
          name: "Getting Started",
          icon: <Rocket className="h-4 w-4" />,
          items: sampleFAQs.slice(0, 2)
        },
        {
          name: "Billing",
          icon: <CreditCard className="h-4 w-4" />,
          items: sampleFAQs.slice(2, 4)
        },
        {
          name: "Technical",
          icon: <Settings className="h-4 w-4" />,
          items: sampleFAQs.slice(3, 5)
        }
      ]}
    />
  );
}
