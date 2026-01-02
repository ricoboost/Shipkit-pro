#!/usr/bin/env tsx
/**
 * Ensure Environment Script
 *
 * Automatically creates .env file with generated secrets if it doesn't exist.
 * This runs before `npm run dev` to ensure a smooth first-time experience.
 *
 * - Generates AUTH_SECRET automatically
 * - Sets sensible defaults for development
 * - Shows helpful guidance for required manual configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const ROOT_DIR = process.cwd();
const ENV_PATH = path.join(ROOT_DIR, '.env');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message: string) {
  console.log(message);
}

function generateHexSecret(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

function createDefaultEnv(): string {
  const authSecret = generateHexSecret(32);
  const fieldEncryptionKey = generateHexSecret(32);

  return `# ShipKit Environment Configuration
# Auto-generated on ${new Date().toISOString()}
#
# QUICK START:
# 1. Add your DATABASE_URL below (get free DB at supabase.com or neon.tech)
# 2. Run: npm run db:push
# 3. Run: npm run dev
#
# See .env.example for all available options

# ============== APP ==============
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="ShipKit"

# ============== DATABASE (Required) ==============
# Get a free PostgreSQL database from:
#   - Supabase: supabase.com (recommended - includes auth & storage)
#   - Neon: neon.tech (serverless, very fast)
#
# Replace this with your actual database URL:
DATABASE_URL="postgresql://user:password@localhost:5432/shipkit"

# ============== AUTH (Auto-generated) ==============
# These secrets were automatically generated for you
AUTH_SECRET="${authSecret}"
AUTH_PROVIDER="nextauth"
NEXT_PUBLIC_AUTH_PROVIDER="nextauth"
NEXTAUTH_URL="http://localhost:3000"

# ============== SECURITY (Auto-generated) ==============
# Field encryption key for sensitive data
FIELD_ENCRYPTION_KEY="${fieldEncryptionKey}"

# ============== PAYMENT PROVIDER (Optional) ==============
# Uncomment and configure when ready to accept payments
# PAYMENT_PROVIDER="stripe"
# STRIPE_SECRET_KEY=""
# STRIPE_WEBHOOK_SECRET=""

# ============== AI PROVIDER (Optional) ==============
# Uncomment and configure when ready to add AI features
# AI_PROVIDER="openrouter"
# OPENROUTER_API_KEY=""

# ============== CREDITS ==============
SIGNUP_BONUS_CREDITS="100"
`;
}

function checkEnvExists(): boolean {
  return fs.existsSync(ENV_PATH);
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
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }

  return env;
}

function checkRequiredVars(env: Record<string, string>): string[] {
  const missing: string[] = [];

  // Check for placeholder DATABASE_URL
  if (
    !env.DATABASE_URL ||
    env.DATABASE_URL === 'postgresql://user:password@localhost:5432/shipkit' ||
    env.DATABASE_URL.includes('user:password')
  ) {
    missing.push('DATABASE_URL');
  }

  return missing;
}

async function main() {
  const envExists = checkEnvExists();

  if (!envExists) {
    // Create .env file with auto-generated secrets
    log('');
    log(`${colors.cyan}${colors.bright}=== ShipKit First-Time Setup ===${colors.reset}`);
    log('');
    log(`${colors.green}Creating .env file with auto-generated secrets...${colors.reset}`);

    const envContent = createDefaultEnv();
    fs.writeFileSync(ENV_PATH, envContent);

    log(`${colors.green}Created .env file${colors.reset}`);
    log('');
    log(`${colors.yellow}${colors.bright}ACTION REQUIRED:${colors.reset}`);
    log('');
    log(`${colors.bright}1.${colors.reset} Get a free database from one of these providers:`);
    log(`   ${colors.cyan}https://supabase.com${colors.reset} (recommended - includes auth)`);
    log(`   ${colors.cyan}https://neon.tech${colors.reset} (serverless PostgreSQL)`);
    log('');
    log(`${colors.bright}2.${colors.reset} Update ${colors.cyan}DATABASE_URL${colors.reset} in your ${colors.cyan}.env${colors.reset} file with your connection string`);
    log('');
    log(`${colors.bright}3.${colors.reset} Run: ${colors.cyan}npm run db:push${colors.reset} to set up your database schema`);
    log('');
    log(`${colors.dim}Tip: Your AUTH_SECRET and other secrets have been auto-generated!${colors.reset}`);
    log('');

    // Exit with code 0 to not block, but show the message
    // The app will start but show setup guidance if DATABASE_URL isn't configured
    return;
  }

  // .env exists, check if it has required values
  const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  const env = parseEnvFile(envContent);
  const missing = checkRequiredVars(env);

  // Check if AUTH_SECRET exists and is valid
  if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) {
    log('');
    log(`${colors.yellow}Generating missing AUTH_SECRET...${colors.reset}`);

    // Add AUTH_SECRET to the file
    const authSecret = generateHexSecret(32);
    const updatedContent = envContent.includes('AUTH_SECRET')
      ? envContent.replace(/AUTH_SECRET=.*/, `AUTH_SECRET="${authSecret}"`)
      : envContent + `\n# Auto-generated auth secret\nAUTH_SECRET="${authSecret}"\n`;

    fs.writeFileSync(ENV_PATH, updatedContent);
    log(`${colors.green}Added AUTH_SECRET to .env${colors.reset}`);
  }

  if (missing.length > 0) {
    log('');
    log(`${colors.yellow}${colors.bright}Setup reminder:${colors.reset} Configure these in your .env file:`);
    for (const key of missing) {
      if (key === 'DATABASE_URL') {
        log(`  ${colors.cyan}DATABASE_URL${colors.reset} - Get a free DB at supabase.com or neon.tech`);
      } else {
        log(`  ${colors.cyan}${key}${colors.reset}`);
      }
    }
    log('');
  }
}

main().catch(console.error);
