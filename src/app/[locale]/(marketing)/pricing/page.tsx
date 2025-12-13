'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for side projects and indie hackers',
    monthlyPrice: 19,
    yearlyPrice: 190,
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID,
    },
    credits: 5000,
    features: [
      '5,000 AI credits/month',
      'All core features',
      'Single user',
      'Community support',
      'Basic analytics',
    ],
  },
  {
    name: 'Pro',
    description: 'For serious builders and growing projects',
    monthlyPrice: 49,
    yearlyPrice: 490,
    popular: true,
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    },
    credits: 25000,
    features: [
      '25,000 AI credits/month',
      'Everything in Starter',
      'Up to 5 team members',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
      'API access',
    ],
  },
  {
    name: 'Enterprise',
    description: 'For teams and organizations at scale',
    monthlyPrice: 149,
    yearlyPrice: 1490,
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    },
    credits: 100000,
    features: [
      '100,000 AI credits/month',
      'Everything in Pro',
      'Unlimited team members',
      'Dedicated support',
      'Custom SLA',
      'SSO & SAML',
      'Audit logs',
      'On-premise option',
    ],
  },
];

const creditPackages = [
  { id: 'credits-1k', name: '1,000 Credits', credits: 1000, price: 10 },
  { id: 'credits-5k', name: '5,000 Credits', credits: 5000, price: 40, popular: true },
  { id: 'credits-10k', name: '10,000 Credits', credits: 10000, price: 70 },
  { id: 'credits-50k', name: '50,000 Credits', credits: 50000, price: 300 },
];

export default function PricingPage(): React.JSX.Element {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="py-20">
      <div className="container">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Choose the plan that fits your needs. All plans include core features.
            Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={annual ? 'text-muted-foreground' : 'font-medium'}>
              Monthly
            </span>
            <Switch
              checked={annual}
              onCheckedChange={setAnnual}
            />
            <span className={annual ? 'font-medium' : 'text-muted-foreground'}>
              Yearly
            </span>
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mb-20 grid max-w-6xl gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? 'border-primary shadow-lg ring-1 ring-primary'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="px-4">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-5xl font-bold">
                    ${annual ? Math.floor(plan.yearlyPrice / 12) : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                  {annual && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      ${plan.yearlyPrice} billed annually
                    </p>
                  )}
                </div>
                <p className="mb-6 text-sm font-medium text-primary">
                  <Sparkles className="mr-1 inline h-4 w-4" />
                  {plan.credits.toLocaleString()} credits/month
                </p>
                <ul className="space-y-3 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Credit packages */}
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold">Need More Credits?</h2>
            <p className="text-muted-foreground">
              Purchase additional credits anytime. Credits never expire.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {creditPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={pkg.popular ? 'border-primary' : ''}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <CardDescription>
                    ${(pkg.price / pkg.credits * 1000).toFixed(2)} per 1k credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${pkg.price}</span>
                    <span className="text-muted-foreground"> one-time</span>
                  </div>
                  <Button
                    className="w-full"
                    variant={pkg.popular ? 'default' : 'outline'}
                    size="sm"
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ teaser */}
        <div className="mt-20 text-center">
          <p className="text-muted-foreground">
            Have questions?{' '}
            <Link href="/docs/faq" className="text-primary hover:underline">
              Check our FAQ
            </Link>{' '}
            or{' '}
            <Link href="/contact" className="text-primary hover:underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
