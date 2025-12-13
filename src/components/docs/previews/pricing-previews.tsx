'use client';

import { PricingCards } from '@/components/marketing/pricing/pricing-cards';
import { PricingTable } from '@/components/marketing/pricing/pricing-table';
import { PricingSingle } from '@/components/marketing/pricing/pricing-single';
import { samplePricingTiers } from './sample-data';

export function PricingCardsPreview() {
  return (
    <PricingCards
      subtitle="Pricing"
      title="Choose Your Plan"
      description="Start free, scale when you're ready."
      tiers={samplePricingTiers}
      showToggle
      colorScheme="primary"
    />
  );
}

export function PricingTablePreview() {
  return (
    <PricingTable
      subtitle="Compare Plans"
      title="Feature Comparison"
      plans={samplePricingTiers.map(t => ({
        name: t.name,
        price: t.price,
        highlighted: t.highlighted,
        ctaLabel: t.ctaLabel,
        ctaHref: t.ctaHref
      }))}
      features={[
        { name: "Projects", category: "Core Features", values: ["3", "Unlimited", "Unlimited"] },
        { name: "Team members", category: "Core Features", values: ["1", "5", "Unlimited"] },
        { name: "Storage", category: "Core Features", values: ["1GB", "10GB", "100GB"] },
        { name: "Analytics", category: "Features", values: [true, true, true] },
        { name: "Custom domain", category: "Features", values: [false, true, true] },
        { name: "SSO", category: "Features", values: [false, false, true] }
      ]}
    />
  );
}

export function PricingSinglePreview() {
  return (
    <PricingSingle
      subtitle="Lifetime Access"
      title="One Price, Everything Included"
      description="Pay once, use forever. No subscriptions."
      productName="ShipKit Pro"
      productDescription="The complete SaaS starter kit"
      price={{ monthly: 199, yearly: 199 }}
      originalPrice={{ monthly: 399, yearly: 399 }}
      features={[
        "Full source code access",
        "Lifetime updates",
        "Discord community access",
        "Priority email support",
        "Commercial license"
      ]}
      ctaLabel="Get Access Now"
      ctaHref="#"
      badge="50% OFF"
    />
  );
}
