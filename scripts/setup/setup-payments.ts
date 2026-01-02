#!/usr/bin/env tsx
/**
 * Payments Setup Script
 *
 * Configures payment processing for your ShipKit application.
 *
 * Usage: npx tsx scripts/setup/setup-payments.ts
 * With args: npx tsx scripts/setup/setup-payments.ts --provider stripe
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

type PaymentProvider = 'stripe' | 'lemonsqueezy' | 'polar' | 'none';

interface PaymentConfig {
  name: string;
  description: string;
  envVars: { key: string; description: string; required: boolean }[];
  setupInstructions: string[];
  webhookPath: string;
}

const paymentProviders: Record<PaymentProvider, PaymentConfig> = {
  stripe: {
    name: 'Stripe',
    description: 'Industry-standard payment processing with subscriptions',
    envVars: [
      { key: 'STRIPE_SECRET_KEY', description: 'Secret key (sk_test_... or sk_live_...)', required: true },
      { key: 'STRIPE_PUBLISHABLE_KEY', description: 'Publishable key (pk_test_... or pk_live_...)', required: true },
      { key: 'STRIPE_WEBHOOK_SECRET', description: 'Webhook signing secret (whsec_...)', required: true },
      { key: 'STRIPE_PRICE_ID_BASIC', description: 'Basic plan price ID', required: false },
      { key: 'STRIPE_PRICE_ID_PRO', description: 'Pro plan price ID', required: false },
      { key: 'STRIPE_PRICE_ID_ENTERPRISE', description: 'Enterprise plan price ID', required: false },
    ],
    setupInstructions: [
      '1. Create account at https://stripe.com',
      '2. Get API keys from Developers > API keys',
      '3. Create products/prices in Products section',
      '4. Set up webhook at Developers > Webhooks',
      '5. Webhook endpoint: {APP_URL}/api/webhooks/stripe',
      '6. Events to listen: checkout.session.completed, customer.subscription.*',
    ],
    webhookPath: '/api/webhooks/stripe',
  },
  lemonsqueezy: {
    name: 'Lemon Squeezy',
    description: 'All-in-one payments with tax handling (great for global sales)',
    envVars: [
      { key: 'LEMONSQUEEZY_API_KEY', description: 'API key from Settings > API', required: true },
      { key: 'LEMONSQUEEZY_STORE_ID', description: 'Your store ID', required: true },
      { key: 'LEMONSQUEEZY_WEBHOOK_SECRET', description: 'Webhook signing secret', required: true },
    ],
    setupInstructions: [
      '1. Create account at https://lemonsqueezy.com',
      '2. Get API key from Settings > API',
      '3. Create products and variants',
      '4. Set up webhook in Settings > Webhooks',
      '5. Webhook endpoint: {APP_URL}/api/webhooks/lemonsqueezy',
    ],
    webhookPath: '/api/webhooks/lemonsqueezy',
  },
  polar: {
    name: 'Polar',
    description: 'Open-source friendly payments for developers',
    envVars: [
      { key: 'POLAR_ACCESS_TOKEN', description: 'Personal access token', required: true },
      { key: 'POLAR_ORGANIZATION_ID', description: 'Your organization ID', required: true },
      { key: 'POLAR_WEBHOOK_SECRET', description: 'Webhook signing secret', required: true },
    ],
    setupInstructions: [
      '1. Create account at https://polar.sh',
      '2. Create organization and get access token',
      '3. Create products/benefits',
      '4. Set up webhook in Settings > Webhooks',
      '5. Webhook endpoint: {APP_URL}/api/webhooks/polar',
    ],
    webhookPath: '/api/webhooks/polar',
  },
  none: {
    name: 'No Payments',
    description: 'Skip payment setup (free app or add payments later)',
    envVars: [],
    setupInstructions: [
      'No payment configuration needed.',
      'You can run this script again to add payments later.',
    ],
    webhookPath: '',
  },
};

async function main() {
  console.log('\n=� ShipKit Payments Setup\n');
  console.log('Configure payment processing for your application.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  // Parse command line arguments
  const args = process.argv.slice(2);
  let selectedProvider: PaymentProvider | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--provider' && args[i + 1]) {
      const provider = args[i + 1] as PaymentProvider;
      if (paymentProviders[provider]) {
        selectedProvider = provider;
      }
      i++;
    }
  }

  // Interactive selection if not provided
  if (!selectedProvider) {
    console.log('Available payment providers:\n');

    const providerList = Object.entries(paymentProviders);
    providerList.forEach(([, config], index) => {
      console.log(`  ${index + 1}. ${config.name}`);
      console.log(`     ${config.description}\n`);
    });

    const choice = await question('Select provider (1-4): ');
    const index = parseInt(choice) - 1;

    if (index >= 0 && index < providerList.length) {
      selectedProvider = providerList[index][0] as PaymentProvider;
    } else {
      console.error('\nL Invalid selection');
      rl.close();
      process.exit(1);
    }
  }

  const config = paymentProviders[selectedProvider];
  console.log(`\n Selected: ${config.name}\n`);

  if (selectedProvider === 'none') {
    console.log('Skipping payment setup.\n');
    rl.close();
    return;
  }

  // Update .env with PAYMENTS_PROVIDER
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');

    // Update or add PAYMENTS_PROVIDER
    if (envContent.includes('PAYMENTS_PROVIDER=')) {
      envContent = envContent.replace(
        /PAYMENTS_PROVIDER=.*/,
        `PAYMENTS_PROVIDER="${selectedProvider}"`
      );
    } else {
      envContent += `\n# Payment Provider\nPAYMENTS_PROVIDER="${selectedProvider}"\n`;
    }
  } else {
    envContent = `# Payment Provider\nPAYMENTS_PROVIDER="${selectedProvider}"\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('=� Updated .env with PAYMENTS_PROVIDER\n');

  // Show setup instructions
  console.log('=� Setup Instructions:\n');
  config.setupInstructions.forEach((instruction) => {
    console.log(`  ${instruction}`);
  });

  // Check and configure env vars
  console.log('\n=� Environment Variables:\n');

  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  for (const envVar of config.envVars) {
    const isSet = envContent.includes(`${envVar.key}=`) &&
      !envContent.includes(`${envVar.key}=""`) &&
      !envContent.includes(`${envVar.key}=\n`);

    if (isSet) {
      console.log(`   ${envVar.key}`);
    } else {
      const status = envVar.required ? '(required)' : '(optional)';
      console.log(`  L ${envVar.key} ${status}`);
      if (envVar.required) {
        missingRequired.push(envVar.key);
      } else {
        missingOptional.push(envVar.key);
      }
    }
  }

  // Configure missing variables
  if (missingRequired.length > 0) {
    console.log('\n');
    const configure = await question('Configure required variables now? (Y/n): ');

    if (configure.toLowerCase() !== 'n') {
      console.log('');

      for (const varName of missingRequired) {
        const envVar = config.envVars.find((v) => v.key === varName);
        const prompt = `${varName} (${envVar?.description}): `;

        const value = await question(prompt);

        if (value) {
          if (envContent.includes(`${varName}=`)) {
            envContent = envContent.replace(
              new RegExp(`${varName}=.*`),
              `${varName}="${value}"`
            );
          } else {
            envContent += `${varName}="${value}"\n`;
          }
        }
      }

      fs.writeFileSync(envPath, envContent);
      console.log('\n Updated .env with payment credentials\n');
    }
  }

  rl.close();

  // Webhook setup instructions
  if (config.webhookPath) {
    console.log('\n= Webhook Configuration:\n');
    console.log(`  Local development: Use Stripe CLI or ngrok`);
    console.log(`  Production URL: https://your-domain.com${config.webhookPath}\n`);

    if (selectedProvider === 'stripe') {
      console.log('  For local development:');
      console.log('    stripe listen --forward-to localhost:3000/api/webhooks/stripe\n');
    }
  }

  // Create products/prices helper
  if (selectedProvider === 'stripe') {
    console.log('=� Quick Stripe Setup:\n');
    console.log('  Create test products with the Stripe CLI:');
    console.log('  stripe products create --name="Basic Plan" --default-price-data.unit-amount=999 --default-price-data.currency=usd --default-price-data.recurring.interval=month\n');
  }

  console.log('Next steps:');
  console.log('  1. Complete the setup instructions above');
  console.log('  2. Set up your webhook endpoint');
  console.log('  3. Create products and prices');
  console.log('  4. Test checkout at /pricing\n');
}

main().catch(console.error);
