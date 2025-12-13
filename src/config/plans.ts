/**
 * Pricing Plans Configuration
 */

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

export interface Plan {
  id: 'free' | 'starter' | 'pro' | 'enterprise';
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  credits: number; // Monthly credits
  features: PlanFeature[];
  popular?: boolean;
  cta: string;

  // Provider-specific price IDs (filled from env)
  stripePriceId?: {
    monthly: string;
    yearly: string;
  };
  lemonsqueezyVariantId?: {
    monthly: string;
    yearly: string;
  };
  polarPriceId?: {
    monthly: string;
    yearly: string;
  };
}

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out ShipKit',
    price: {
      monthly: 0,
      yearly: 0,
    },
    credits: 100,
    cta: 'Get Started',
    features: [
      { name: 'Basic authentication', included: true },
      { name: 'Up to 100 credits/month', included: true },
      { name: 'Community support', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'Team members', included: false },
      { name: 'Priority support', included: false },
      { name: 'Custom branding', included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals and small projects',
    price: {
      monthly: 1900, // $19
      yearly: 15900, // $159 (2 months free)
    },
    credits: 1000,
    cta: 'Start Free Trial',
    popular: true,
    features: [
      { name: 'Everything in Free', included: true },
      { name: 'Up to 1,000 credits/month', included: true },
      { name: 'Email support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Team members', included: true, limit: 'Up to 3' },
      { name: 'Priority support', included: false },
      { name: 'Custom branding', included: false },
    ],
    stripePriceId: {
      monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '',
      yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || '',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams and businesses',
    price: {
      monthly: 4900, // $49
      yearly: 41900, // $419 (2 months free)
    },
    credits: 5000,
    cta: 'Start Free Trial',
    features: [
      { name: 'Everything in Starter', included: true },
      { name: 'Up to 5,000 credits/month', included: true },
      { name: 'Priority support', included: true },
      { name: 'Custom analytics', included: true },
      { name: 'Team members', included: true, limit: 'Up to 10' },
      { name: 'Custom branding', included: true },
      { name: 'API access', included: true },
    ],
    stripePriceId: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    price: {
      monthly: 0, // Custom
      yearly: 0,
    },
    credits: -1, // Unlimited
    cta: 'Contact Sales',
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Unlimited credits', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Unlimited team members', included: true },
      { name: 'SLA guarantee', included: true },
      { name: 'On-premise deployment', included: true },
    ],
  },
];

export function getPlanById(id: string): Plan | undefined {
  return plans.find((plan) => plan.id === id);
}

export function getPlanFeatureLimit(planId: string, feature: string): string | undefined {
  const plan = getPlanById(planId);
  const feat = plan?.features.find((f) => f.name === feature);
  return feat?.limit;
}
