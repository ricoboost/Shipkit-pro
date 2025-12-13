'use client';

import { ProblemAgitate } from '@/components/marketing/problem/problem-agitate';
import { ProblemSolution } from '@/components/marketing/problem/problem-solution';
import { ProblemStats } from '@/components/marketing/problem/problem-stats';
import { samplePainPoints, sampleTransformations } from './sample-data';
import { Clock, DollarSign, AlertTriangle } from 'lucide-react';

export function ProblemAgitatePreview() {
  return (
    <ProblemAgitate
      subtitle="Sound Familiar?"
      title="These Problems Are Costing You"
      description="Every day without a solution means more wasted time and money."
      painPoints={samplePainPoints.map((point, index) => ({
        ...point,
        icon: [
          <Clock key={0} className="h-6 w-6" />,
          <DollarSign key={1} className="h-6 w-6" />,
          <AlertTriangle key={2} className="h-6 w-6" />
        ][index]
      }))}
      colorScheme="destructive"
    />
  );
}

export function ProblemSolutionPreview() {
  return (
    <ProblemSolution
      subtitle="The Transformation"
      title="From Frustration to Flow"
      description="See how our solution changes everything."
      solutionName="ShipKit"
      beforeTitle="Before"
      afterTitle="After"
      items={sampleTransformations}
    />
  );
}

export function ProblemStatsPreview() {
  return (
    <ProblemStats
      subtitle="The Hard Truth"
      title="Time Lost to Manual Setup"
      description="These numbers represent real costs to your business."
      stats={[
        {
          value: "40+",
          label: "Hours Wasted",
          description: "Average setup time for a new SaaS project"
        },
        {
          value: "$5,000",
          label: "Lost Revenue",
          description: "Opportunity cost of delayed launches"
        },
        {
          value: "73%",
          label: "Burnout Rate",
          description: "Developers frustrated with boilerplate"
        },
        {
          value: "3x",
          label: "More Bugs",
          description: "In hastily assembled codebases"
        }
      ]}
      layout="grid"
      colorScheme="destructive"
    />
  );
}
