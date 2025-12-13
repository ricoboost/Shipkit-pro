#!/usr/bin/env tsx
/**
 * Environment Setup Script
 *
 * Generates a .env file with all required environment variables for ShipKit.
 *
 * Usage: npx tsx scripts/setup/setup-env.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as crypto from 'crypto';

interface EnvVariable {
  key: string;
  description: string;
  required: boolean;
  default?: string;
  secret?: boolean;
  generator?: () => string;
}

const envVariables: EnvVariable[] = [
  // Database
  {
    key: 'DATABASE_URL',
    description: 'Database connection string (PostgreSQL recommended)',
    required: true,
    default: 'postgresql://user:password@localhost:5432/shipkit',
  },

  // Auth
  {
    key: 'AUTH_SECRET',
    description: 'Secret key for auth session encryption (auto-generated)',
    required: true,
    secret: true,
    generator: () => crypto.randomBytes(32).toString('hex'),
  },
  {
    key: 'AUTH_PROVIDER',
    description: 'Auth provider: next-auth, supabase, or better-auth',
    required: false,
    default: 'next-auth',
  },
  {
    key: 'AUTH_GOOGLE_ID',
    description: 'Google OAuth client ID',
    required: false,
  },
  {
    key: 'AUTH_GOOGLE_SECRET',
    description: 'Google OAuth client secret',
    required: false,
    secret: true,
  },
  {
    key: 'AUTH_GITHUB_ID',
    description: 'GitHub OAuth client ID',
    required: false,
  },
  {
    key: 'AUTH_GITHUB_SECRET',
    description: 'GitHub OAuth client secret',
    required: false,
    secret: true,
  },

  // Supabase (optional)
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
    required: false,
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key',
    required: false,
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key (server only)',
    required: false,
    secret: true,
  },

  // Payments
  {
    key: 'PAYMENTS_PROVIDER',
    description: 'Payments provider: stripe or none',
    required: false,
    default: 'stripe',
  },
  {
    key: 'STRIPE_SECRET_KEY',
    description: 'Stripe secret key (sk_test_... or sk_live_...)',
    required: false,
    secret: true,
  },
  {
    key: 'STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe publishable key (pk_test_... or pk_live_...)',
    required: false,
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe webhook signing secret (whsec_...)',
    required: false,
    secret: true,
  },

  // AI
  {
    key: 'AI_PROVIDER',
    description: 'AI provider: openai, anthropic, or google',
    required: false,
    default: 'openai',
  },
  {
    key: 'OPENAI_API_KEY',
    description: 'OpenAI API key',
    required: false,
    secret: true,
  },
  {
    key: 'ANTHROPIC_API_KEY',
    description: 'Anthropic API key',
    required: false,
    secret: true,
  },
  {
    key: 'GOOGLE_GENERATIVE_AI_API_KEY',
    description: 'Google AI (Gemini) API key',
    required: false,
    secret: true,
  },

  // Email
  {
    key: 'RESEND_API_KEY',
    description: 'Resend API key for transactional emails',
    required: false,
    secret: true,
  },
  {
    key: 'EMAIL_FROM',
    description: 'Default from email address',
    required: false,
    default: 'noreply@example.com',
  },

  // App
  {
    key: 'NEXT_PUBLIC_APP_URL',
    description: 'Your application URL',
    required: true,
    default: 'http://localhost:3000',
  },
  {
    key: 'NEXT_PUBLIC_APP_NAME',
    description: 'Your application name',
    required: false,
    default: 'ShipKit',
  },
];

async function main() {
  console.log('\n=== ShipKit Environment Setup ===\n');
  console.log('This script will help you configure your environment variables.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  // Check if .env already exists
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  let existingEnv: Record<string, string> = {};

  if (fs.existsSync(envPath)) {
    console.log('=� Found existing .env file\n');
    const content = fs.readFileSync(envPath, 'utf-8');
    existingEnv = parseEnvFile(content);

    const overwrite = await question('Do you want to update it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('\n Keeping existing .env file\n');
      rl.close();
      return;
    }
    console.log('');
  }

  // Parse command line arguments for mode
  const args = process.argv.slice(2);
  const quickMode = args.includes('--quick') || args.includes('-q');
  const interactiveMode = args.includes('--interactive') || args.includes('-i');

  if (quickMode) {
    console.log('� Quick mode: Using defaults and auto-generation\n');
  }

  const envValues: Record<string, string> = {};

  // Group variables by category
  const categories = [
    { name: 'Database', prefix: 'DATABASE' },
    { name: 'Authentication', prefix: 'AUTH' },
    { name: 'Supabase', prefix: 'SUPABASE' },
    { name: 'Payments', prefix: 'STRIPE' },
    { name: 'AI', prefix: 'AI' },
    { name: 'Email', prefix: 'RESEND' },
    { name: 'Application', prefix: 'NEXT_PUBLIC_APP' },
  ];

  for (const variable of envVariables) {
    // Use existing value if present
    if (existingEnv[variable.key]) {
      envValues[variable.key] = existingEnv[variable.key];
      continue;
    }

    // Auto-generate if generator exists and in quick mode
    if (variable.generator && (quickMode || !interactiveMode)) {
      envValues[variable.key] = variable.generator();
      console.log(`= Auto-generated: ${variable.key}`);
      continue;
    }

    // Use default in quick mode
    if (quickMode && variable.default) {
      envValues[variable.key] = variable.default;
      continue;
    }

    // Interactive mode for required variables
    if (interactiveMode || variable.required) {
      const defaultHint = variable.default ? ` (default: ${variable.default})` : '';
      const requiredHint = variable.required ? ' [required]' : '';
      console.log(`\n${variable.description}${requiredHint}`);

      const value = await question(`${variable.key}${defaultHint}: `);

      if (value) {
        envValues[variable.key] = value;
      } else if (variable.default) {
        envValues[variable.key] = variable.default;
      } else if (variable.generator) {
        envValues[variable.key] = variable.generator();
        console.log(`  � Auto-generated`);
      }
    } else if (variable.default) {
      envValues[variable.key] = variable.default;
    }
  }

  rl.close();

  // Generate .env content
  let envContent = `# ShipKit Environment Configuration
# Generated on ${new Date().toISOString()}
# See .env.example for all available options

`;

  let currentCategory = '';
  for (const variable of envVariables) {
    // Add category headers
    const category = categories.find((c) =>
      variable.key.startsWith(c.prefix) ||
      variable.key.includes(c.prefix)
    );
    if (category && category.name !== currentCategory) {
      currentCategory = category.name;
      envContent += `\n# ${currentCategory}\n`;
    }

    if (envValues[variable.key]) {
      envContent += `${variable.key}="${envValues[variable.key]}"\n`;
    } else if (variable.required) {
      envContent += `# ${variable.key}= # Required: ${variable.description}\n`;
    }
  }

  // Write .env file
  fs.writeFileSync(envPath, envContent);
  console.log('\n Created .env file\n');

  // Generate .env.example if it doesn't exist
  if (!fs.existsSync(envExamplePath)) {
    let exampleContent = `# ShipKit Environment Variables
# Copy this file to .env and fill in your values

`;
    for (const variable of envVariables) {
      const requiredTag = variable.required ? ' (required)' : '';
      exampleContent += `# ${variable.description}${requiredTag}\n`;
      if (variable.default && !variable.secret) {
        exampleContent += `${variable.key}="${variable.default}"\n\n`;
      } else {
        exampleContent += `${variable.key}=\n\n`;
      }
    }

    fs.writeFileSync(envExamplePath, exampleContent);
    console.log(' Created .env.example file\n');
  }

  console.log('=� Summary of configured variables:\n');
  const configured = Object.keys(envValues).length;
  const required = envVariables.filter((v) => v.required).length;
  const configuredRequired = envVariables.filter(
    (v) => v.required && envValues[v.key]
  ).length;

  console.log(`  Total configured: ${configured}/${envVariables.length}`);
  console.log(`  Required configured: ${configuredRequired}/${required}`);

  if (configuredRequired < required) {
    console.log('\n�  Some required variables are not configured.');
    console.log('   Run this script with --interactive to configure them.\n');
  } else {
    console.log('\n All required variables are configured!\n');
  }

  console.log('Next steps:');
  console.log('  1. Review and update .env with your actual values');
  console.log('  2. Run: npx prisma generate');
  console.log('  3. Run: npx prisma db push');
  console.log('  4. Run: npm run dev\n');
}

function parseEnvFile(content: string): Record<string, string> {
  const env: Record<string, string> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }

  return env;
}

main().catch(console.error);
