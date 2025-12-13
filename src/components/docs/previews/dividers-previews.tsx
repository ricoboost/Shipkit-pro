'use client';

import { SectionDivider, GradientDivider, AnimatedDivider, LineDivider } from '@/components/marketing/dividers/section-divider';

export function SectionDividerWavePreview() {
  return (
    <div className="relative">
      <div className="h-20 bg-primary/10" />
      <SectionDivider shape="wave" size="md" />
      <div className="h-20 bg-background" />
    </div>
  );
}

export function SectionDividerCurvePreview() {
  return (
    <div className="relative">
      <div className="h-20 bg-muted" />
      <SectionDivider shape="curve" size="md" />
      <div className="h-20 bg-background" />
    </div>
  );
}

export function SectionDividerAnglePreview() {
  return (
    <div className="relative">
      <div className="h-20 bg-primary/10" />
      <SectionDivider shape="angle" size="md" />
      <div className="h-20 bg-background" />
    </div>
  );
}

export function SectionDividerAllShapesPreview() {
  const shapes = ['wave', 'curve', 'angle', 'zigzag', 'triangle', 'rounded'] as const;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {shapes.map((shape) => (
        <div key={shape} className="relative rounded-lg overflow-hidden border">
          <div className="h-16 bg-primary/20" />
          <SectionDivider shape={shape} size="sm" />
          <div className="h-8 bg-background" />
          <p className="absolute bottom-2 left-2 text-xs font-medium">{shape}</p>
        </div>
      ))}
    </div>
  );
}

export function GradientDividerPreview() {
  return (
    <div className="relative">
      <div className="h-20 bg-muted/50" />
      <GradientDivider from="hsl(var(--muted)/0.5)" to="hsl(var(--background))" size="lg" />
      <div className="h-20 bg-background" />
    </div>
  );
}

export function AnimatedDividerPreview() {
  return (
    <div className="relative">
      <div className="h-20 bg-primary/10" />
      <AnimatedDivider size="md" speed="medium" />
      <div className="h-20 bg-background" />
    </div>
  );
}

export function LineDividerPreview() {
  return (
    <div className="space-y-8 py-8">
      <LineDivider size="sm" colorScheme="muted" />
      <LineDivider size="md" colorScheme="primary" />
      <LineDivider size="lg" colorScheme="accent" text="Or" />
    </div>
  );
}
