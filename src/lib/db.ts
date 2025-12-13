/**
 * Prisma Database Client
 *
 * Provides a singleton Prisma client instance with connection pooling.
 * Uses the global object to preserve connections across hot reloads in development.
 *
 * @example
 * ```typescript
 * import { db } from '@/lib/db';
 *
 * // Basic query
 * const users = await db.user.findMany();
 *
 * // Query with relations
 * const user = await db.user.findUnique({
 *   where: { id: userId },
 *   include: {
 *     organizations: true,
 *     subscriptions: true,
 *   },
 * });
 *
 * // Create with nested relations
 * const org = await db.organization.create({
 *   data: {
 *     name: 'Acme Inc',
 *     slug: 'acme',
 *     members: {
 *       create: { userId, role: 'OWNER' },
 *     },
 *   },
 * });
 * ```
 *
 * @module lib/db
 */

import { PrismaClient } from '@prisma/client';

/** Global reference for singleton pattern @internal */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma database client instance.
 *
 * This is a singleton that reuses connections across requests.
 * In development, it logs queries, errors, and warnings.
 * In production, only errors are logged.
 *
 * @example
 * ```typescript
 * import { db } from '@/lib/db';
 *
 * // Find user by email
 * const user = await db.user.findUnique({
 *   where: { email: 'user@example.com' },
 * });
 *
 * // Update user
 * await db.user.update({
 *   where: { id: user.id },
 *   data: { name: 'New Name' },
 * });
 *
 * // Delete user
 * await db.user.delete({
 *   where: { id: user.id },
 * });
 * ```
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

/**
 * Executes multiple database operations in a transaction.
 *
 * All operations within the callback either succeed together or fail together.
 * If any operation throws an error, the entire transaction is rolled back.
 *
 * @template T - The return type of the transaction function
 * @param fn - Async function containing transaction operations
 * @returns Promise resolving to the function's return value
 * @throws Rolls back all changes if any operation fails
 *
 * @example
 * ```typescript
 * import { withTransaction, db } from '@/lib/db';
 *
 * // Transfer credits between users
 * const result = await withTransaction(async (tx) => {
 *   // Deduct from sender
 *   await tx.creditBalance.update({
 *     where: { userId: senderId },
 *     data: { balance: { decrement: amount } },
 *   });
 *
 *   // Add to receiver
 *   await tx.creditBalance.update({
 *     where: { userId: receiverId },
 *     data: { balance: { increment: amount } },
 *   });
 *
 *   // Record the transaction
 *   return tx.creditTransaction.create({
 *     data: {
 *       fromUserId: senderId,
 *       toUserId: receiverId,
 *       amount,
 *       type: 'TRANSFER',
 *     },
 *   });
 * });
 * ```
 */
export async function withTransaction<T>(
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  return db.$transaction(fn);
}

/**
 * Generates pagination parameters for Prisma queries.
 *
 * Enforces a maximum of 100 items per page and ensures valid page numbers.
 *
 * @param page - Page number (1-indexed, defaults to 1)
 * @param perPage - Items per page (defaults to 20, max 100)
 * @returns Object with `take` and `skip` for Prisma queries
 *
 * @example
 * ```typescript
 * import { db, paginate } from '@/lib/db';
 *
 * // Basic pagination
 * const { take, skip } = paginate(1, 20);
 * const users = await db.user.findMany({ take, skip });
 *
 * // With search params
 * export async function getUsers(page: number, search?: string) {
 *   const { take, skip } = paginate(page, 20);
 *
 *   const [users, total] = await Promise.all([
 *     db.user.findMany({
 *       where: search ? { name: { contains: search } } : undefined,
 *       take,
 *       skip,
 *       orderBy: { createdAt: 'desc' },
 *     }),
 *     db.user.count({
 *       where: search ? { name: { contains: search } } : undefined,
 *     }),
 *   ]);
 *
 *   return {
 *     users,
 *     pagination: {
 *       page,
 *       perPage: take,
 *       total,
 *       totalPages: Math.ceil(total / take),
 *     },
 *   };
 * }
 * ```
 */
export function paginate(page: number = 1, perPage: number = 20) {
  const take = Math.min(perPage, 100); // Max 100 per page
  const skip = (Math.max(page, 1) - 1) * take;
  return { take, skip };
}

/** Re-export PrismaClient type for external use */
export type { PrismaClient } from '@prisma/client';
