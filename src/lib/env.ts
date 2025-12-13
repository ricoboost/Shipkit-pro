/**
 * Environment Variable Validation
 *
 * SECURITY: Validates required environment variables at startup
 * to prevent runtime crashes from missing configuration.
 *
 * Import this file in your app's entry point to validate on startup.
 */

import { z } from 'zod';

/**
 * Schema for required environment variables
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Authentication
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url().optional(),

  // Security (required in production)
  FIELD_ENCRYPTION_KEY: z
    .string()
    .min(32, 'FIELD_ENCRYPTION_KEY must be at least 32 characters')
    .optional()
    .refine(
      (key) => {
        // Required in production
        if (process.env.NODE_ENV === 'production' && !key) {
          return false;
        }
        return true;
      },
      { message: 'FIELD_ENCRYPTION_KEY is required in production' }
    ),

  // Redis (optional, enables distributed rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().optional(),

  // Payment providers (at least one required for payments)
  PAYMENT_PROVIDER: z.enum(['stripe', 'lemonsqueezy', 'polar']).optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  LEMONSQUEEZY_API_KEY: z.string().optional(),
  LEMONSQUEEZY_WEBHOOK_SECRET: z.string().optional(),
  POLAR_ACCESS_TOKEN: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),

  // OAuth providers (all optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),

  // AI providers (optional)
  OPENROUTER_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Feature flags
  SIGNUP_BONUS_CREDITS: z.string().optional(),
  BYPASS_MAINTENANCE: z.enum(['true', 'false']).optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Parsed and validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Call this at application startup
 */
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      return `  - ${issue.path.join('.')}: ${issue.message}`;
    });

    console.error('\n❌ Invalid environment variables:\n');
    console.error(errors.join('\n'));
    console.error('\nPlease check your .env file and ensure all required variables are set.\n');

    // In production, throw to prevent startup
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration');
    }

    // In development, warn but continue with defaults
    console.warn('⚠️  Continuing with partial configuration (development mode)\n');
  }

  return result.data as Env;
}

/**
 * Check if Redis is configured
 */
export function isRedisConfigured(): boolean {
  return !!(
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
    process.env.REDIS_URL
  );
}

/**
 * Check if a payment provider is configured
 */
export function isPaymentConfigured(): boolean {
  const provider = process.env.PAYMENT_PROVIDER;

  switch (provider) {
    case 'stripe':
      return !!process.env.STRIPE_SECRET_KEY;
    case 'lemonsqueezy':
      return !!process.env.LEMONSQUEEZY_API_KEY;
    case 'polar':
      return !!process.env.POLAR_ACCESS_TOKEN;
    default:
      // Check if any provider is configured
      return !!(
        process.env.STRIPE_SECRET_KEY ||
        process.env.LEMONSQUEEZY_API_KEY ||
        process.env.POLAR_ACCESS_TOKEN
      );
  }
}

/**
 * Get configured OAuth providers
 */
export function getConfiguredOAuthProviders(): string[] {
  const providers: string[] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push('google');
  }
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push('github');
  }
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    providers.push('discord');
  }

  return providers;
}

// Validate on module load (development only)
// In production, call validateEnv() explicitly in your app entry
if (process.env.NODE_ENV === 'development') {
  // Defer validation to avoid issues during build
  if (typeof window === 'undefined') {
    try {
      validateEnv();
    } catch {
      // Ignore errors during build
    }
  }
}
