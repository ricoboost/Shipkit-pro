# Configure Payments

Set up payment processing for your ShipKit application.

## Instructions

Run the payments setup script:

```bash
npx tsx scripts/setup/setup-payments.ts
```

## Supported Payment Providers

### 1. Stripe (recommended)
Industry-standard payment processing with subscriptions.

```bash
npx tsx scripts/setup/setup-payments.ts --provider stripe
```

Required env vars:
- `STRIPE_SECRET_KEY` (sk_test_... or sk_live_...)
- `STRIPE_PUBLISHABLE_KEY` (pk_test_... or pk_live_...)
- `STRIPE_WEBHOOK_SECRET` (whsec_...)

### 2. Lemon Squeezy
All-in-one payments with tax handling (great for global sales).

```bash
npx tsx scripts/setup/setup-payments.ts --provider lemonsqueezy
```

Required env vars:
- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_STORE_ID`
- `LEMONSQUEEZY_WEBHOOK_SECRET`

### 3. Polar
Open-source friendly payments for developers.

```bash
npx tsx scripts/setup/setup-payments.ts --provider polar
```

Required env vars:
- `POLAR_ACCESS_TOKEN`
- `POLAR_ORGANIZATION_ID`
- `POLAR_WEBHOOK_SECRET`

### 4. No Payments
Skip payment setup for now.

```bash
npx tsx scripts/setup/setup-payments.ts --provider none
```

## Stripe Quick Setup

1. Create account at https://stripe.com
2. Get API keys from Developers > API keys
3. Create products and prices
4. Set up webhook:
   - Endpoint: `{APP_URL}/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.*`

### Local Development with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## What This Script Does

1. Lets you choose a payment provider
2. Updates `PAYMENTS_PROVIDER` in `.env`
3. Configures required API keys
4. Shows webhook setup instructions
