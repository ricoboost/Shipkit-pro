/**
 * oRPC Setup
 *
 * Type-safe RPC layer for the application using oRPC and Zod.
 * Provides pre-defined schemas for common operations and consistent
 * response formats across the API.
 *
 * @example
 * ```typescript
 * import { rpc, schemas, responses } from '@/lib/rpc';
 *
 * // Define a procedure
 * const getUser = rpc
 *   .input(schemas.id)
 *   .handler(async ({ input }) => {
 *     const user = await db.user.findUnique({
 *       where: { id: input.id },
 *     });
 *     if (!user) {
 *       return responses.error('User not found', 'NOT_FOUND');
 *     }
 *     return responses.success(user);
 *   });
 * ```
 *
 * @module lib/rpc
 */

import { os } from '@orpc/server';
import { oz } from '@orpc/zod';
import { z } from 'zod';

/**
 * Base oRPC instance for building type-safe procedures.
 *
 * @example
 * ```typescript
 * import { rpc, schemas } from '@/lib/rpc';
 *
 * // Simple procedure
 * const hello = rpc.handler(() => 'Hello, World!');
 *
 * // With input validation
 * const greet = rpc
 *   .input(z.object({ name: z.string() }))
 *   .handler(({ input }) => `Hello, ${input.name}!`);
 *
 * // With middleware
 * const authenticated = rpc.use(authMiddleware);
 * const getProfile = authenticated.handler(({ ctx }) => ctx.user);
 * ```
 */
export const rpc = os;

/**
 * Extended Zod schema helpers for oRPC.
 * Provides additional validation utilities beyond standard Zod.
 */
export { oz };

/**
 * Pre-defined Zod schemas for common API operations.
 *
 * Use these schemas with oRPC input validation to ensure
 * consistent data shapes across the application.
 *
 * @example
 * ```typescript
 * import { rpc, schemas } from '@/lib/rpc';
 *
 * // Pagination
 * const listUsers = rpc
 *   .input(schemas.pagination)
 *   .handler(async ({ input }) => {
 *     const { page, limit } = input;
 *     // ... paginated query
 *   });
 *
 * // AI chat
 * const chat = rpc
 *   .input(schemas.ai.chat)
 *   .handler(async ({ input }) => {
 *     const { messages, model } = input;
 *     // ... AI completion
 *   });
 * ```
 */
export const schemas = {
  /**
   * Pagination parameters with defaults.
   * - page: 1-indexed page number (default: 1)
   * - limit: items per page, 1-100 (default: 20)
   */
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),

  /**
   * Simple ID parameter for resource lookup.
   */
  id: z.object({
    id: z.string().min(1),
  }),

  /**
   * User-related schemas.
   */
  user: {
    /** Schema for creating a new user */
    create: z.object({
      email: z.string().email(),
      name: z.string().min(1).optional(),
      password: z.string().min(8).optional(),
    }),
    /** Schema for updating user profile */
    update: z.object({
      name: z.string().min(1).optional(),
      image: z.string().url().optional(),
    }),
  },

  /**
   * Organization-related schemas.
   */
  organization: {
    /** Schema for creating an organization */
    create: z.object({
      name: z.string().min(1).max(100),
      slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
      logo: z.string().url().optional(),
    }),
    /** Schema for updating organization details */
    update: z.object({
      name: z.string().min(1).max(100).optional(),
      logo: z.string().url().nullable().optional(),
    }),
  },

  /**
   * Team invitation schemas.
   */
  invitation: {
    /** Schema for inviting a team member */
    create: z.object({
      email: z.string().email(),
      role: z.enum(['OWNER', 'ADMIN', 'MEMBER']).default('MEMBER'),
    }),
  },

  /**
   * AI operation schemas.
   */
  ai: {
    /**
     * Chat completion input.
     *
     * @example
     * ```typescript
     * const input = {
     *   messages: [
     *     { role: 'system', content: 'You are helpful.' },
     *     { role: 'user', content: 'Hello!' },
     *   ],
     *   model: 'gpt-4-turbo',
     *   temperature: 0.7,
     * };
     * ```
     */
    chat: z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })),
      model: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().int().min(1).max(128000).optional(),
      stream: z.boolean().optional(),
    }),
    /** Text completion input (single prompt) */
    completion: z.object({
      prompt: z.string(),
      model: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().int().min(1).max(128000).optional(),
    }),
  },

  /**
   * Subscription schemas.
   */
  subscription: {
    /** Schema for creating a subscription */
    create: z.object({
      plan: z.enum(['STARTER', 'PRO', 'ENTERPRISE']),
      interval: z.enum(['month', 'year']).default('month'),
    }),
  },

  /**
   * API key schemas.
   */
  apiKey: {
    /** Schema for creating an API key */
    create: z.object({
      name: z.string().min(1).max(100),
      expiresAt: z.date().optional(),
    }),
  },
};

/**
 * Standard response builders for consistent API responses.
 *
 * @example
 * ```typescript
 * import { responses } from '@/lib/rpc';
 *
 * // Success response
 * return responses.success({ user, token });
 * // { success: true, data: { user, token } }
 *
 * // Error response
 * return responses.error('Invalid credentials', 'AUTH_ERROR');
 * // { success: false, error: { message: '...', code: 'AUTH_ERROR' } }
 *
 * // Paginated response
 * return responses.paginated(users, 100, 1, 20);
 * // { success: true, data: [...], pagination: { total, page, limit, ... } }
 * ```
 */
export const responses = {
  /**
   * Creates a success response.
   *
   * @template T - Type of the response data
   * @param data - The data to return
   * @returns Success response object
   */
  success: <T>(data: T) => ({
    success: true as const,
    data,
  }),

  /**
   * Creates an error response.
   *
   * @param message - Human-readable error message
   * @param code - Optional error code for programmatic handling
   * @returns Error response object
   */
  error: (message: string, code?: string) => ({
    success: false as const,
    error: { message, code },
  }),

  /**
   * Creates a paginated success response.
   *
   * @template T - Type of items in the data array
   * @param data - Array of items for current page
   * @param total - Total count of all items
   * @param page - Current page number
   * @param limit - Items per page
   * @returns Paginated response object
   */
  paginated: <T>(data: T[], total: number, page: number, limit: number) => ({
    success: true as const,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  }),
};

// ==================== Type Helpers ====================

/** Input type for pagination parameters */
export type PaginationInput = z.infer<typeof schemas.pagination>;

/** Input type for ID lookup */
export type IdInput = z.infer<typeof schemas.id>;

/** Input type for creating a user */
export type UserCreateInput = z.infer<typeof schemas.user.create>;

/** Input type for updating a user */
export type UserUpdateInput = z.infer<typeof schemas.user.update>;

/** Input type for creating an organization */
export type OrganizationCreateInput = z.infer<typeof schemas.organization.create>;

/** Input type for updating an organization */
export type OrganizationUpdateInput = z.infer<typeof schemas.organization.update>;

/** Input type for creating an invitation */
export type InvitationCreateInput = z.infer<typeof schemas.invitation.create>;

/** Input type for AI chat requests */
export type AIChatInput = z.infer<typeof schemas.ai.chat>;

/** Input type for AI completion requests */
export type AICompletionInput = z.infer<typeof schemas.ai.completion>;

/** Input type for creating a subscription */
export type SubscriptionCreateInput = z.infer<typeof schemas.subscription.create>;

/** Input type for creating an API key */
export type ApiKeyCreateInput = z.infer<typeof schemas.apiKey.create>;
