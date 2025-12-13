#!/usr/bin/env tsx
/**
 * Auth Provider Setup Script
 *
 * Configures authentication for your ShipKit application.
 * Supports NextAuth, Supabase, and Better Auth.
 *
 * Usage: npx tsx scripts/setup/setup-auth.ts
 * With args: npx tsx scripts/setup/setup-auth.ts --provider next-auth
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

type AuthProvider = 'next-auth' | 'supabase' | 'better-auth';

interface ProviderConfig {
  name: string;
  description: string;
  envVars: string[];
  setupInstructions: string[];
}

const providers: Record<AuthProvider, ProviderConfig> = {
  'next-auth': {
    name: 'NextAuth.js',
    description: 'Full-featured auth with multiple providers, sessions, and JWT support',
    envVars: [
      'AUTH_SECRET',
      'AUTH_GOOGLE_ID',
      'AUTH_GOOGLE_SECRET',
      'AUTH_GITHUB_ID',
      'AUTH_GITHUB_SECRET',
    ],
    setupInstructions: [
      '1. Generate AUTH_SECRET: openssl rand -base64 32',
      '2. Set up OAuth apps in Google/GitHub developer consoles',
      '3. Add callback URLs: {APP_URL}/api/auth/callback/{provider}',
      '4. Configure providers in src/lib/auth/config.ts',
    ],
  },
  'supabase': {
    name: 'Supabase Auth',
    description: 'Auth powered by Supabase with Row Level Security',
    envVars: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ],
    setupInstructions: [
      '1. Create a project at https://supabase.com',
      '2. Get your project URL and API keys from Settings > API',
      '3. Enable email/OAuth providers in Authentication > Providers',
      '4. Configure callback URLs in URL Configuration',
    ],
  },
  'better-auth': {
    name: 'Better Auth',
    description: 'Modern, type-safe authentication library',
    envVars: [
      'AUTH_SECRET',
      'AUTH_GOOGLE_ID',
      'AUTH_GOOGLE_SECRET',
    ],
    setupInstructions: [
      '1. Generate AUTH_SECRET: openssl rand -base64 32',
      '2. Set up OAuth apps in provider developer consoles',
      '3. Configure Better Auth in src/lib/auth/better-auth.ts',
      '4. Run database migrations: npx prisma db push',
    ],
  },
};

async function main() {
  console.log('\n= ShipKit Auth Setup\n');
  console.log('Configure authentication for your application.\n');

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
  let selectedProvider: AuthProvider | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--provider' && args[i + 1]) {
      const provider = args[i + 1] as AuthProvider;
      if (providers[provider]) {
        selectedProvider = provider;
      }
      i++;
    }
  }

  // Interactive selection if not provided
  if (!selectedProvider) {
    console.log('Available auth providers:\n');

    const providerList = Object.entries(providers);
    providerList.forEach(([key, config], index) => {
      console.log(`  ${index + 1}. ${config.name}`);
      console.log(`     ${config.description}\n`);
    });

    const choice = await question('Select provider (1-3): ');
    const index = parseInt(choice) - 1;

    if (index >= 0 && index < providerList.length) {
      selectedProvider = providerList[index][0] as AuthProvider;
    } else {
      console.error('\nL Invalid selection');
      rl.close();
      process.exit(1);
    }
  }

  const config = providers[selectedProvider];
  console.log(`\n Selected: ${config.name}\n`);

  // Update .env with AUTH_PROVIDER
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');

    // Update or add AUTH_PROVIDER
    if (envContent.includes('AUTH_PROVIDER=')) {
      envContent = envContent.replace(
        /AUTH_PROVIDER=.*/,
        `AUTH_PROVIDER="${selectedProvider}"`
      );
    } else {
      envContent += `\n# Auth Provider\nAUTH_PROVIDER="${selectedProvider}"\n`;
    }
  } else {
    envContent = `# Auth Provider\nAUTH_PROVIDER="${selectedProvider}"\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('=Ä Updated .env with AUTH_PROVIDER\n');

  // Check which env vars are configured
  console.log('Required environment variables:\n');
  const missingVars: string[] = [];

  for (const envVar of config.envVars) {
    const isSet = envContent.includes(`${envVar}=`) &&
      !envContent.includes(`${envVar}=""`) &&
      !envContent.includes(`${envVar}=\n`);

    if (isSet) {
      console.log(`   ${envVar}`);
    } else {
      console.log(`  L ${envVar} (not configured)`);
      missingVars.push(envVar);
    }
  }

  // Show setup instructions
  console.log('\n=Ë Setup Instructions:\n');
  config.setupInstructions.forEach((instruction) => {
    console.log(`  ${instruction}`);
  });

  // Interactive setup for missing variables
  if (missingVars.length > 0) {
    console.log('\n');
    const configure = await question('Would you like to configure missing variables now? (y/N): ');

    if (configure.toLowerCase() === 'y') {
      console.log('');

      for (const varName of missingVars) {
        const isSecret = varName.toLowerCase().includes('secret') ||
          varName.toLowerCase().includes('key');

        const prompt = isSecret
          ? `${varName} (paste value, hidden): `
          : `${varName}: `;

        const value = await question(prompt);

        if (value) {
          // Add or update in env content
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
      console.log('\n Updated .env with new values\n');
    }
  }

  rl.close();

  // Provider-specific additional setup
  if (selectedProvider === 'supabase') {
    console.log('\n=æ Supabase Additional Setup:\n');
    console.log('  Run the following to set up Supabase tables:');
    console.log('  npx supabase init');
    console.log('  npx supabase db push\n');
  } else if (selectedProvider === 'better-auth') {
    console.log('\n=æ Better Auth Additional Setup:\n');
    console.log('  Run the following to generate auth schema:');
    console.log('  npx @better-auth/cli generate\n');
  }

  console.log('Next steps:');
  console.log('  1. Complete the setup instructions above');
  console.log('  2. Run: npx prisma generate && npx prisma db push');
  console.log('  3. Test authentication at /auth/signin\n');
}

main().catch(console.error);
