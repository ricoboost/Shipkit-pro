/**
 * Environment Check API Route
 * Validates required and optional environment variables
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Required environment variables for basic operation
const REQUIRED_VARS = [
  'DATABASE_URL',
  'AUTH_SECRET',
] as const;

// Optional but recommended environment variables
const OPTIONAL_VARS = [
  // Auth providers
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  // Payment providers
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'LEMONSQUEEZY_API_KEY',
  'LEMONSQUEEZY_WEBHOOK_SECRET',
  // AI providers
  'OPENROUTER_API_KEY',
  'OPENAI_API_KEY',
  // Email
  'RESEND_API_KEY',
  // App URLs
  'NEXT_PUBLIC_APP_URL',
] as const;

interface EnvCheckResponse {
  valid: boolean;
  missing: string[];
  optional: string[];
  configured: string[];
  template: string;
}

export async function GET() {
  const missing: string[] = [];
  const optional: string[] = [];
  const configured: string[] = [];

  // Check required variables
  for (const varName of REQUIRED_VARS) {
    if (process.env[varName]) {
      configured.push(varName);
    } else {
      missing.push(varName);
    }
  }

  // Check optional variables
  for (const varName of OPTIONAL_VARS) {
    if (process.env[varName]) {
      configured.push(varName);
    } else {
      optional.push(varName);
    }
  }

  // Generate .env.local template
  const template = `# ShipKit Environment Configuration
# Copy this to .env.local and fill in your values

# === REQUIRED ===

# Database connection string
# Get from: Supabase, Neon, PlanetScale, or your PostgreSQL provider
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Auth secret for NextAuth.js (generate with: openssl rand -base64 32)
AUTH_SECRET="${generatePlaceholder()}"

# === OPTIONAL (but recommended) ===

# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Stripe Payments (https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# OpenRouter AI (https://openrouter.ai/keys)
OPENROUTER_API_KEY=""

# Resend Email (https://resend.com/api-keys)
RESEND_API_KEY=""

# App URL (for production)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`;

  const response: EnvCheckResponse = {
    valid: missing.length === 0,
    missing,
    optional,
    configured,
    template,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

function generatePlaceholder(): string {
  // Generate a placeholder that looks like a real secret
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
