/**
 * Setup Mode Detection
 *
 * Detects when the application is in initial setup mode
 * (missing required environment variables like DATABASE_URL or AUTH_SECRET)
 */

/**
 * Check if essential database environment is configured
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Check if essential auth environment is configured
 */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET);
}

/**
 * Check if we're in setup mode (missing essential configuration)
 */
export function isSetupMode(): boolean {
  return !isDatabaseConfigured() || !isAuthConfigured();
}

/**
 * Get a list of missing essential environment variables
 */
export function getMissingEnvVars(): string[] {
  const missing: string[] = [];

  if (!process.env.DATABASE_URL) {
    missing.push('DATABASE_URL');
  }

  if (!process.env.AUTH_SECRET) {
    missing.push('AUTH_SECRET');
  }

  return missing;
}
