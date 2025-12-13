/**
 * Rate Limiting
 *
 * SECURITY: Distributed rate limiting with Redis (Upstash)
 * Falls back to in-memory for development/single-instance
 */

import { Ratelimit } from '@upstash/ratelimit';
import { getRedisClient, isRedisAvailable } from '@/lib/redis';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (fallback when Redis not configured)
const memoryStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Rate limit presets
 */
export const rateLimitPresets = {
  // API routes
  api: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
  apiStrict: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 requests per minute

  // Auth routes
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 attempts per 15 min
  authStrict: { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 attempts per hour

  // AI endpoints (expensive)
  ai: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute

  // Webhooks
  webhook: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute

  // Organization creation
  orgCreate: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10 }, // 10 per day

  // Signup
  signup: { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 per hour
};

// Redis-based rate limiters (created on demand)
const redisLimiters = new Map<string, Ratelimit>();

/**
 * Get or create a Redis rate limiter
 */
function getRedisLimiter(config: RateLimitConfig, prefix: string): Ratelimit | null {
  const redis = getRedisClient();
  if (!redis) return null;

  const key = `${prefix}:${config.windowMs}:${config.maxRequests}`;

  if (!redisLimiters.has(key)) {
    // Convert windowMs to a duration string
    const windowSeconds = Math.floor(config.windowMs / 1000);
    const duration = windowSeconds >= 86400
      ? `${Math.floor(windowSeconds / 86400)} d`
      : windowSeconds >= 3600
        ? `${Math.floor(windowSeconds / 3600)} h`
        : windowSeconds >= 60
          ? `${Math.floor(windowSeconds / 60)} m`
          : `${windowSeconds} s`;

    redisLimiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.maxRequests, duration as `${number} s` | `${number} m` | `${number} h` | `${number} d`),
        prefix: `ratelimit:${prefix}`,
        analytics: true,
      })
    );
  }

  return redisLimiters.get(key)!;
}

/**
 * Check rate limit using Redis (with in-memory fallback)
 */
export async function checkRateLimitAsync(
  key: string,
  config: RateLimitConfig = rateLimitPresets.api,
  prefix: string = 'api'
): Promise<RateLimitResult> {
  // Try Redis first
  const limiter = getRedisLimiter(config, prefix);
  if (limiter) {
    try {
      const result = await limiter.limit(key);
      return {
        success: result.success,
        remaining: result.remaining,
        resetTime: result.reset,
      };
    } catch (error) {
      console.warn('Redis rate limit error, falling back to memory:', error);
      // Fall through to in-memory
    }
  }

  // Fallback to in-memory
  return checkRateLimit(key, config);
}

/**
 * Check rate limit for a given key (in-memory, synchronous)
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = rateLimitPresets.api
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    cleanupOldEntries(now);
  }

  if (!entry || now > entry.resetTime) {
    // Create new entry
    memoryStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    // Rate limited
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count += 1;
  memoryStore.set(key, entry);

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get rate limit key from request
 */
export function getRateLimitKey(
  identifier: string,
  prefix: string = 'rl'
): string {
  return `${prefix}:${identifier}`;
}

/**
 * Clean up expired entries
 */
function cleanupOldEntries(now: number): void {
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetTime) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Rate limit middleware for API routes
 * Uses Redis when available for distributed rate limiting
 */
export async function withRateLimit(
  request: Request,
  config: RateLimitConfig = rateLimitPresets.api,
  prefix: string = 'api'
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  // Get identifier (IP or user ID)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const key = getRateLimitKey(ip);

  // Use async Redis-based rate limiting when available
  const result = await checkRateLimitAsync(key, config, prefix);

  const headers = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
  };

  return {
    allowed: result.success,
    headers,
  };
}

/**
 * Check if distributed rate limiting is active
 */
export function isDistributedRateLimitingActive(): boolean {
  return isRedisAvailable();
}

/**
 * Create rate limited response
 */
export function rateLimitedResponse(resetTime: number): Response {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}
