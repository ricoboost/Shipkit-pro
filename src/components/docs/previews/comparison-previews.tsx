'use client';

import { WithWithout } from '@/components/marketing/comparison/with-without';
import { ComparisonTable } from '@/components/marketing/comparison/comparison-table';
import { sampleWithWithout, sampleCompetitors, sampleComparisonFeatures } from './sample-data';

export function WithWithoutPreview() {
  return (
    <WithWithout
      subtitle="The Difference"
      title="Transform Your Workflow"
      description="See how ShipKit changes everything about building SaaS."
      productName="ShipKit"
      withoutTitle="Without"
      withTitle="With"
      withoutItems={sampleWithWithout.withoutItems}
      withItems={sampleWithWithout.withItems}
    />
  );
}

export function ComparisonTablePreview() {
  return (
    <ComparisonTable
      subtitle="How We Compare"
      title="ShipKit vs. The Competition"
      description="See how we stack up against other solutions."
      competitors={sampleCompetitors}
      features={sampleComparisonFeatures}
    />
  );
}
