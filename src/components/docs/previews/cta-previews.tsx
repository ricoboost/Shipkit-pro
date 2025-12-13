'use client';

import { CTASimple } from '@/components/marketing/cta/cta-simple';
import { CTASplit } from '@/components/marketing/cta/cta-split';
import { CTABanner } from '@/components/marketing/cta/cta-banner';

// CTASimple - Primary (Bold brand color)
export function CTASimplePreview() {
  return (
    <CTASimple
      title="Launch Your SaaS in Days, Not Months"
      description="Stop reinventing the wheel. Get authentication, payments, emails, and more out of the box. Join 10,000+ developers shipping faster."
      primaryCTA={{
        label: 'Start Building Free',
        href: '#',
      }}
      secondaryCTA={{
        label: 'See Live Demo',
        href: '#',
      }}
      colorScheme="primary"
      animated={false}
    />
  );
}

// CTASimple - Accent variant for comparison
export function CTASimpleAccentPreview() {
  return (
    <CTASimple
      title="Ready to 10x Your Development Speed?"
      description="Everything you need to build, launch, and scale your next SaaS. Production-ready components, battle-tested integrations."
      primaryCTA={{
        label: 'Get Instant Access',
        href: '#',
      }}
      secondaryCTA={{
        label: 'Watch 2-Min Demo',
        href: '#',
      }}
      colorScheme="accent"
      animated={false}
    />
  );
}

// CTASimple - Muted variant
export function CTASimpleMutedPreview() {
  return (
    <CTASimple
      title="Join the Waitlist"
      description="Be the first to know when we launch new features. Early access members get 50% off lifetime."
      primaryCTA={{
        label: 'Join 2,847 Others',
        href: '#',
      }}
      colorScheme="muted"
      animated={false}
    />
  );
}

// CTASplit with compelling content
export function CTASplitPreview() {
  return (
    <CTASplit
      title="Ship Your MVP This Weekend"
      description="Stop spending months on boilerplate. ShipKit gives you authentication, payments, emails, database, and 50+ components ready to customize."
      primaryCTA={{ label: 'Start Free Trial', href: '#' }}
      secondaryCTA={{ label: 'Book a Demo', href: '#' }}
      image={{
        src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
        alt: 'Team collaborating on laptop',
      }}
      imagePosition="right"
      colorScheme="primary"
      animated={false}
    />
  );
}

// CTASplit - Image on left
export function CTASplitLeftPreview() {
  return (
    <CTASplit
      title="Built by Developers, For Developers"
      description="Clean code, TypeScript-first, fully documented. No magic, no lock-in. You own every line of code."
      primaryCTA={{ label: 'View Source Code', href: '#' }}
      secondaryCTA={{ label: 'Read the Docs', href: '#' }}
      image={{
        src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
        alt: 'Code on screen',
      }}
      imagePosition="left"
      colorScheme="muted"
      animated={false}
    />
  );
}

// CTABanner - Promo style
export function CTABannerPreview() {
  return (
    <CTABanner
      text="Black Friday Deal: 50% off all plans. Use code SHIP50 at checkout."
      cta={{ label: 'Claim Offer', href: '#' }}
      colorScheme="primary"
      position="inline"
      dismissible={true}
      animated={false}
    />
  );
}

// CTABanner - Accent color
export function CTABannerAccentPreview() {
  return (
    <CTABanner
      text="New: AI-powered components just launched! Generate UI with natural language."
      cta={{ label: 'Try It Now', href: '#' }}
      colorScheme="accent"
      position="inline"
      dismissible={false}
      animated={false}
    />
  );
}

// CTABanner - Destructive/Urgent
export function CTABannerUrgentPreview() {
  return (
    <CTABanner
      text="Last chance! Early bird pricing ends in 24 hours."
      cta={{ label: 'Lock In Price', href: '#' }}
      colorScheme="destructive"
      position="inline"
      dismissible={true}
      animated={false}
    />
  );
}

// CTAFloating - Static representation for docs
export function CTAFloatingPreview() {
  return (
    <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden border">
      <div className="absolute inset-0 p-6">
        <div className="h-3 w-24 bg-slate-300 dark:bg-slate-700 rounded mb-3" />
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded mb-2" />
        <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
        <div className="h-2 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>

      <div className="absolute bottom-4 right-4 w-72 rounded-xl border bg-card p-4 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">Need Help Getting Started?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Book a free 15-min call with our team
            </p>
          </div>
          <button className="text-muted-foreground hover:text-foreground p-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button className="mt-4 w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
          Schedule Call
        </button>
      </div>

      <div className="absolute top-3 left-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Floating CTA appears after scrolling
      </div>
    </div>
  );
}
