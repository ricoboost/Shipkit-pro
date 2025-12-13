'use client';

import { LogoCloud } from '@/components/marketing/logos/logo-cloud';
import { LogoMarquee } from '@/components/marketing/logos/logo-marquee';
import { LogoShowcase } from '@/components/marketing/logos/logo-showcase';

// Use placeholder SVGs for demo
const demoLogos = [
  { name: "Company 1", src: "https://placehold.co/140x40/1a1a1a/ffffff?text=Logo+1" },
  { name: "Company 2", src: "https://placehold.co/140x40/2563eb/ffffff?text=Logo+2" },
  { name: "Company 3", src: "https://placehold.co/140x40/059669/ffffff?text=Logo+3" },
  { name: "Company 4", src: "https://placehold.co/140x40/dc2626/ffffff?text=Logo+4" },
  { name: "Company 5", src: "https://placehold.co/140x40/7c3aed/ffffff?text=Logo+5" },
  { name: "Company 6", src: "https://placehold.co/140x40/ea580c/ffffff?text=Logo+6" },
];

export function LogoCloudPreview() {
  return (
    <LogoCloud
      title="Trusted by Industry Leaders"
      subtitle="Join thousands of companies"
      logos={demoLogos}
      columns={6}
      variant="default"
    />
  );
}

export function LogoCloudGrayscalePreview() {
  return (
    <LogoCloud
      title="Powering the best teams"
      logos={demoLogos}
      columns={6}
      variant="grayscale"
    />
  );
}

export function LogoMarqueePreview() {
  return (
    <LogoMarquee
      title="Powering teams at"
      logos={[...demoLogos, ...demoLogos]}
      speed="normal"
      direction="left"
      pauseOnHover
    />
  );
}

export function LogoShowcasePreview() {
  return (
    <LogoShowcase
      subtitle="Integrations"
      title="Works With Your Stack"
      description="Seamlessly integrate with your favorite tools."
      logos={[
        { name: "Next.js", src: "https://placehold.co/120x40/000000/ffffff?text=Next.js", description: "React framework", featured: true },
        { name: "Vercel", src: "https://placehold.co/120x40/000000/ffffff?text=Vercel", description: "Deployment" },
        { name: "Stripe", src: "https://placehold.co/120x40/635bff/ffffff?text=Stripe", description: "Payments" },
        { name: "Prisma", src: "https://placehold.co/120x40/2d3748/ffffff?text=Prisma", description: "Database ORM" },
        { name: "Tailwind", src: "https://placehold.co/120x40/06b6d4/ffffff?text=Tailwind", description: "CSS" },
      ]}
    />
  );
}
