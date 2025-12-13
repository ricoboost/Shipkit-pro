/**
 * Pricing Configuration
 *
 * SECURITY: Centralized pricing configuration
 * - Price IDs are stored server-side, not exposed to client
 * - All checkout requests must use plan names, not raw price IDs
 * - Prices are validated against this configuration
 */

export interface PlanConfig {
  name: string;
  description: string;
  monthlyPrice: number;  // in cents
  yearlyPrice: number;   // in cents
  features: string[];
  stripePriceIds?: {
    monthly: string;
    yearly: string;
  };
  lemonsqueezyVariantIds?: {
    monthly: string;
    yearly: string;
  };
  polarPriceIds?: {
    monthly: string;
    yearly: string;
  };
}

export interface PricingConfig {
  plans: Record<string, PlanConfig>;
  creditPackages: {
    id: string;
    name: string;
    credits: number;
    price: number; // in cents
    stripePriceId?: string;
    lemonsqueezyVariantId?: string;
    polarPriceId?: string;
  }[];
}

/**
 * IMPORTANT: Update these with your actual Stripe/LemonSqueezy/Polar price IDs
 * These are example values - replace with real IDs from your payment provider dashboard
 */
export const pricingConfig: PricingConfig = {
  plans: {
    starter: {
      name: 'Starter',
      description: 'Perfect for individuals and small projects',
      monthlyPrice: 2900, // $29
      yearlyPrice: 29000, // $290/year (2 months free)
      features: [
        '1,000 API calls/month',
        'Basic analytics',
        'Email support',
        '1 team member',
      ],
      stripePriceIds: {
        monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || 'price_starter_monthly',
        yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || 'price_starter_yearly',
      },
    },
    pro: {
      name: 'Pro',
      description: 'For growing teams and businesses',
      monthlyPrice: 7900, // $79
      yearlyPrice: 79000, // $790/year
      features: [
        '10,000 API calls/month',
        'Advanced analytics',
        'Priority support',
        'Up to 5 team members',
        'Custom integrations',
      ],
      stripePriceIds: {
        monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
        yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
      },
    },
    enterprise: {
      name: 'Enterprise',
      description: 'For large organizations with custom needs',
      monthlyPrice: 19900, // $199
      yearlyPrice: 199000, // $1990/year
      features: [
        'Unlimited API calls',
        'Enterprise analytics',
        'Dedicated support',
        'Unlimited team members',
        'Custom SLA',
        'On-premise option',
      ],
      stripePriceIds: {
        monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly',
        yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || 'price_enterprise_yearly',
      },
    },
  },
  creditPackages: [
    {
      id: 'credits_100',
      name: '100 Credits',
      credits: 100,
      price: 999, // $9.99
      stripePriceId: process.env.STRIPE_CREDITS_100_PRICE_ID,
    },
    {
      id: 'credits_500',
      name: '500 Credits',
      credits: 500,
      price: 3999, // $39.99
      stripePriceId: process.env.STRIPE_CREDITS_500_PRICE_ID,
    },
    {
      id: 'credits_1000',
      name: '1000 Credits',
      credits: 1000,
      price: 6999, // $69.99
      stripePriceId: process.env.STRIPE_CREDITS_1000_PRICE_ID,
    },
  ],
};

/**
 * Get the price ID for a plan based on the current payment provider
 */
export function getPlanPriceId(
  planName: string,
  interval: 'monthly' | 'yearly',
  provider: 'stripe' | 'lemonsqueezy' | 'polar' = 'stripe'
): string | null {
  const plan = pricingConfig.plans[planName.toLowerCase()];
  if (!plan) return null;

  switch (provider) {
    case 'stripe':
      return plan.stripePriceIds?.[interval] || null;
    case 'lemonsqueezy':
      return plan.lemonsqueezyVariantIds?.[interval] || null;
    case 'polar':
      return plan.polarPriceIds?.[interval] || null;
    default:
      return null;
  }
}

/**
 * SECURITY: Validate that a price ID is legitimate
 * Prevents attackers from injecting arbitrary price IDs
 */
export function isValidPriceId(priceId: string, provider: 'stripe' | 'lemonsqueezy' | 'polar' = 'stripe'): boolean {
  // Collect all valid price IDs for the provider
  const validPriceIds = new Set<string>();

  // Add plan price IDs
  for (const plan of Object.values(pricingConfig.plans)) {
    switch (provider) {
      case 'stripe':
        if (plan.stripePriceIds?.monthly) validPriceIds.add(plan.stripePriceIds.monthly);
        if (plan.stripePriceIds?.yearly) validPriceIds.add(plan.stripePriceIds.yearly);
        break;
      case 'lemonsqueezy':
        if (plan.lemonsqueezyVariantIds?.monthly) validPriceIds.add(plan.lemonsqueezyVariantIds.monthly);
        if (plan.lemonsqueezyVariantIds?.yearly) validPriceIds.add(plan.lemonsqueezyVariantIds.yearly);
        break;
      case 'polar':
        if (plan.polarPriceIds?.monthly) validPriceIds.add(plan.polarPriceIds.monthly);
        if (plan.polarPriceIds?.yearly) validPriceIds.add(plan.polarPriceIds.yearly);
        break;
    }
  }

  // Add credit package price IDs
  for (const pkg of pricingConfig.creditPackages) {
    switch (provider) {
      case 'stripe':
        if (pkg.stripePriceId) validPriceIds.add(pkg.stripePriceId);
        break;
      case 'lemonsqueezy':
        if (pkg.lemonsqueezyVariantId) validPriceIds.add(pkg.lemonsqueezyVariantId);
        break;
      case 'polar':
        if (pkg.polarPriceId) validPriceIds.add(pkg.polarPriceId);
        break;
    }
  }

  return validPriceIds.has(priceId);
}

/**
 * Get plan configuration (safe to expose to client)
 */
export function getPublicPricingConfig() {
  return {
    plans: Object.entries(pricingConfig.plans).map(([id, plan]) => ({
      id,
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      features: plan.features,
    })),
    creditPackages: pricingConfig.creditPackages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      credits: pkg.credits,
      price: pkg.price,
    })),
  };
}
