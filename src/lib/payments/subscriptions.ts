/**
 * Subscription Management Utilities
 *
 * SECURITY:
 * - Handles subscription expiration
 * - Provides grace period logic
 * - Audit logs status changes
 */

import { db } from '@/lib/db';

/**
 * Subscription management utilities
 */
export const subscriptions = {
  /**
   * Check and handle expired subscriptions
   * Should be called periodically (e.g., via cron job or serverless function)
   *
   * @returns Number of subscriptions that were expired
   */
  async handleExpiredSubscriptions(): Promise<{
    processed: number;
    expired: string[];
    errors: string[];
  }> {
    const now = new Date();
    const errors: string[] = [];
    const expired: string[] = [];

    try {
      // Find active subscriptions past their period end
      // Give a 3-day grace period before downgrading
      const gracePeriodDays = 3;
      const graceDate = new Date(now.getTime() - gracePeriodDays * 24 * 60 * 60 * 1000);

      const expiredSubscriptions = await db.subscription.findMany({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            lt: graceDate,
          },
          // Don't expire if cancelAtPeriodEnd is false (auto-renewing)
          // This means payment failed or subscription was cancelled
          OR: [
            { cancelAtPeriodEnd: true },
            // Also catch subscriptions that haven't been updated recently
            // (webhook might have failed)
            {
              updatedAt: {
                lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days
              },
            },
          ],
        },
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      });

      for (const subscription of expiredSubscriptions) {
        try {
          // Update subscription status
          await db.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'INACTIVE',
              plan: 'FREE',
            },
          });

          // Log the expiration
          await db.auditLog.create({
            data: {
              userId: subscription.userId,
              action: 'subscription.expired',
              resource: 'subscription',
              resourceId: subscription.id,
              metadata: {
                previousStatus: 'ACTIVE',
                previousPlan: subscription.plan,
                periodEnd: subscription.currentPeriodEnd?.toISOString(),
                reason: 'period_end_passed',
              },
            },
          });

          expired.push(subscription.id);

          console.log(
            `[SUBSCRIPTION] Expired subscription ${subscription.id} for user ${subscription.user?.email}`
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`${subscription.id}: ${errorMessage}`);
          console.error(`Failed to expire subscription ${subscription.id}:`, error);
        }
      }

      return {
        processed: expiredSubscriptions.length,
        expired,
        errors,
      };
    } catch (error) {
      console.error('Error handling expired subscriptions:', error);
      throw error;
    }
  },

  /**
   * Check if a user's subscription is active
   * Includes grace period logic
   */
  async isActive(userId: string): Promise<boolean> {
    const subscription = await db.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) return false;
    if (subscription.status !== 'ACTIVE') return false;

    // Check if within grace period
    if (subscription.currentPeriodEnd) {
      const gracePeriodDays = 3;
      const graceDate = new Date(
        subscription.currentPeriodEnd.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000
      );

      if (new Date() > graceDate) {
        return false;
      }
    }

    return true;
  },

  /**
   * Get subscription status with details
   */
  async getStatus(userId: string): Promise<{
    hasSubscription: boolean;
    isActive: boolean;
    plan: string;
    expiresAt: Date | null;
    isInGracePeriod: boolean;
    daysUntilExpiry: number | null;
  }> {
    const subscription = await db.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return {
        hasSubscription: false,
        isActive: false,
        plan: 'FREE',
        expiresAt: null,
        isInGracePeriod: false,
        daysUntilExpiry: null,
      };
    }

    const now = new Date();
    const periodEnd = subscription.currentPeriodEnd;
    const gracePeriodDays = 3;

    let isInGracePeriod = false;
    let daysUntilExpiry: number | null = null;

    if (periodEnd) {
      const graceEnd = new Date(periodEnd.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);

      if (now > periodEnd && now <= graceEnd) {
        isInGracePeriod = true;
      }

      const msUntilExpiry = graceEnd.getTime() - now.getTime();
      if (msUntilExpiry > 0) {
        daysUntilExpiry = Math.ceil(msUntilExpiry / (24 * 60 * 60 * 1000));
      }
    }

    const isActive = subscription.status === 'ACTIVE' && (!periodEnd || new Date() <= new Date(periodEnd.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000));

    return {
      hasSubscription: true,
      isActive,
      plan: subscription.plan,
      expiresAt: periodEnd,
      isInGracePeriod,
      daysUntilExpiry,
    };
  },

  /**
   * Warn users about expiring subscriptions
   * Returns users whose subscriptions expire within the specified days
   */
  async getExpiringSubscriptions(withinDays: number = 7): Promise<
    Array<{
      userId: string;
      email: string;
      plan: string;
      expiresAt: Date;
      daysRemaining: number;
    }>
  > {
    const now = new Date();
    const futureDate = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);

    const expiring = await db.subscription.findMany({
      where: {
        status: 'ACTIVE',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    return expiring.map((sub) => ({
      userId: sub.userId,
      email: sub.user?.email || '',
      plan: sub.plan,
      expiresAt: sub.currentPeriodEnd!,
      daysRemaining: Math.ceil(
        (sub.currentPeriodEnd!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      ),
    }));
  },
};
