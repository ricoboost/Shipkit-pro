/**
 * Security Headers Configuration
 * Best practices for secure HTTP headers
 */

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string | false;
  strictTransportSecurity?: string | false;
  xContentTypeOptions?: string | false;
  xFrameOptions?: string | false;
  xXssProtection?: string | false;
  referrerPolicy?: string | false;
  permissionsPolicy?: string | false;
}

/**
 * Default security headers
 * SECURITY: Removed 'unsafe-inline' and 'unsafe-eval' to prevent XSS attacks
 * Note: If you need inline scripts, use nonces or hashes instead
 */
export const defaultSecurityHeaders: SecurityHeadersConfig = {
  // Content Security Policy - STRICT MODE
  // 'unsafe-inline' removed - use nonces for any inline scripts
  // 'unsafe-eval' removed - eval() is not allowed
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' https://js.stripe.com https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'", // Keep unsafe-inline for styles (Tailwind)
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com https://api.openai.com https://openrouter.ai wss:",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; '),

  // HSTS - Force HTTPS
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',

  // Prevent MIME type sniffing
  xContentTypeOptions: 'nosniff',

  // Prevent clickjacking
  xFrameOptions: 'DENY',

  // XSS Protection (legacy, but still useful)
  xXssProtection: '1; mode=block',

  // Referrer Policy
  referrerPolicy: 'strict-origin-when-cross-origin',

  // Permissions Policy (formerly Feature-Policy)
  permissionsPolicy: [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=(self "https://js.stripe.com")',
  ].join(', '),
};

/**
 * Development-friendly headers (more permissive)
 */
export const developmentSecurityHeaders: SecurityHeadersConfig = {
  contentSecurityPolicy: false, // Disable CSP in dev for hot reload
  strictTransportSecurity: false,
  xContentTypeOptions: 'nosniff',
  xFrameOptions: 'SAMEORIGIN',
  xXssProtection: '1; mode=block',
  referrerPolicy: 'no-referrer-when-downgrade',
  permissionsPolicy: false,
};

/**
 * Get security headers for current environment
 */
export function getSecurityHeaders(): Record<string, string> {
  const config =
    process.env.NODE_ENV === 'production'
      ? defaultSecurityHeaders
      : developmentSecurityHeaders;

  const headers: Record<string, string> = {};

  if (config.contentSecurityPolicy) {
    headers['Content-Security-Policy'] = config.contentSecurityPolicy;
  }

  if (config.strictTransportSecurity) {
    headers['Strict-Transport-Security'] = config.strictTransportSecurity;
  }

  if (config.xContentTypeOptions) {
    headers['X-Content-Type-Options'] = config.xContentTypeOptions;
  }

  if (config.xFrameOptions) {
    headers['X-Frame-Options'] = config.xFrameOptions;
  }

  if (config.xXssProtection) {
    headers['X-XSS-Protection'] = config.xXssProtection;
  }

  if (config.referrerPolicy) {
    headers['Referrer-Policy'] = config.referrerPolicy;
  }

  if (config.permissionsPolicy) {
    headers['Permissions-Policy'] = config.permissionsPolicy;
  }

  return headers;
}

/**
 * Apply security headers to a Response
 */
export function withSecurityHeaders(response: Response): Response {
  const headers = getSecurityHeaders();

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}
