/**
 * Setup Mode Detection
 *
 * Detects when the application is in initial setup mode
 * (missing or placeholder environment variables like DATABASE_URL or AUTH_SECRET)
 */

// Placeholder values that indicate the user hasn't configured the env yet
const DATABASE_URL_PLACEHOLDERS = [
  'postgresql://user:password@localhost:5432/shipkit',
  'postgresql://user:password@localhost:5432/db',
];

/**
 * Check if DATABASE_URL is a placeholder value (not yet configured)
 */
function isDatabasePlaceholder(): boolean {
  const dbUrl = process.env.DATABASE_URL || '';
  return (
    DATABASE_URL_PLACEHOLDERS.includes(dbUrl) ||
    dbUrl.includes('user:password') ||
    !dbUrl
  );
}

/**
 * Check if essential database environment is configured (not just present, but valid)
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL) && !isDatabasePlaceholder();
}

/**
 * Check if essential auth environment is configured
 */
export function isAuthConfigured(): boolean {
  const authSecret = process.env.AUTH_SECRET || '';
  // Must exist and be at least 32 characters
  return authSecret.length >= 32;
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

  if (!isDatabaseConfigured()) {
    missing.push('DATABASE_URL');
  }

  if (!isAuthConfigured()) {
    missing.push('AUTH_SECRET');
  }

  return missing;
}

/**
 * Get setup status with detailed information
 */
export function getSetupStatus(): {
  isSetupMode: boolean;
  database: { configured: boolean; isPlaceholder: boolean };
  auth: { configured: boolean };
  missing: string[];
} {
  const dbConfigured = isDatabaseConfigured();
  const authConfigured = isAuthConfigured();

  return {
    isSetupMode: !dbConfigured || !authConfigured,
    database: {
      configured: dbConfigured,
      isPlaceholder: isDatabasePlaceholder(),
    },
    auth: {
      configured: authConfigured,
    },
    missing: getMissingEnvVars(),
  };
}
