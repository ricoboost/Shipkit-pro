/**
 * Redis Client
 *
 * SECURITY: Provides distributed caching and rate limiting.
 * Falls back gracefully to in-memory storage if Redis is not configured.
 */

import { Redis } from '@upstash/redis';
import { isRedisConfigured } from '@/lib/env';

/**
 * Singleton Redis client
 * Uses Upstash Redis REST API for Edge compatibility
 */
let redisClient: Redis | null = null;

/**
 * Get Redis client instance
 * Returns null if Redis is not configured
 */
export function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  if (!isRedisConfigured()) {
    return null;
  }

  // Prefer Upstash (works on Edge)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return redisClient;
  }

  return null;
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return !!getRedisClient();
}

/**
 * Cache utilities
 */
export const cache = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      const value = await client.get(key);
      return value as T | null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  /**
   * Set value in cache with optional TTL
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      if (ttlSeconds) {
        await client.set(key, JSON.stringify(value), { ex: ttlSeconds });
      } else {
        await client.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  },

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  },

  /**
   * Increment a counter
   */
  async incr(key: string): Promise<number | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      return await client.incr(key);
    } catch (error) {
      console.error('Redis incr error:', error);
      return null;
    }
  },

  /**
   * Set TTL on existing key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('Redis expire error:', error);
      return false;
    }
  },
};

export { Redis };
