/**
 * Admin Management Library
 * Dashboard stats and user management
 *
 * SECURITY: Uses PII minimization for certain responses
 */

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { privacy } from '@/lib/security';

// Type for subscription with user relation
type SubscriptionWithUser = Prisma.SubscriptionGetPayload<{
  include: { user: { select: { id: true; name: true; email: true } } };
}>;

// Type for user with subscription and counts (include returns all scalar fields)
type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    subscription: { select: { plan: true; status: true } };
    creditBalance: { select: { balance: true } };
    _count: { select: { aiUsage: true } };
  };
}>;

// Type for organization with owner and member count
type OrganizationWithRelations = Prisma.OrganizationGetPayload<{
  include: {
    owner: { select: { id: true; name: true; email: true } };
    _count: { select: { members: true; aiUsage: true } };
  };
}>;

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  subscriptions: {
    total: number;
    active: number;
    trialing: number;
    mrr: number;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  ai: {
    totalRequests: number;
    totalTokens: number;
    totalCreditsUsed: number;
  };
}

export const admin = {
  /**
   * Get dashboard overview stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // User stats
    const [totalUsers, newUsersWeek, newUsersMonth] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { createdAt: { gte: weekAgo } } }),
      db.user.count({ where: { createdAt: { gte: monthAgo } } }),
    ]);

    // Subscription stats
    const subscriptions = await db.subscription.groupBy({
      by: ['status'],
      _count: true,
    });

    const subStats = subscriptions.reduce(
      (acc, s) => {
        acc.total += s._count;
        if (s.status === 'ACTIVE') acc.active += s._count;
        if (s.status === 'TRIALING') acc.trialing += s._count;
        return acc;
      },
      { total: 0, active: 0, trialing: 0 }
    );

    // AI usage stats
    const aiUsage = await db.aIUsage.aggregate({
      _count: true,
      _sum: {
        totalTokens: true,
        creditsUsed: true,
      },
    });

    // Calculate MRR (simplified - assumes monthly subscriptions)
    const activeSubscriptions = await db.subscription.findMany({
      where: { status: 'ACTIVE' },
      select: { plan: true },
    });

    const planPrices: Record<string, number> = {
      FREE: 0,
      STARTER: 29,
      PRO: 79,
      ENTERPRISE: 199,
    };

    const mrr = activeSubscriptions.reduce((sum, sub) => {
      return sum + (planPrices[sub.plan] || 0);
    }, 0);

    // Revenue growth (simplified)
    const thisMonthRevenue = mrr;
    const lastMonthRevenue = mrr * 0.9; // Placeholder - would need actual historical data
    const growth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    return {
      users: {
        total: totalUsers,
        active: totalUsers, // Would need activity tracking
        newThisWeek: newUsersWeek,
        newThisMonth: newUsersMonth,
      },
      subscriptions: {
        ...subStats,
        mrr,
      },
      revenue: {
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        growth,
      },
      ai: {
        totalRequests: aiUsage._count || 0,
        totalTokens: aiUsage._sum.totalTokens || 0,
        totalCreditsUsed: aiUsage._sum.creditsUsed || 0,
      },
    };
  },

  /**
   * List users with pagination and filters
   * SECURITY: Excludes soft-deleted users by default
   */
  async listUsers(options?: {
    search?: string;
    role?: string;
    status?: string;
    plan?: string;
    limit?: number;
    offset?: number;
    includeDeleted?: boolean;
  }): Promise<{ users: UserWithRelations[]; total: number; hasMore: boolean }> {
    const { search, role, status, plan, limit = 20, offset = 0, includeDeleted = false } = options || {};

    const where = {
      // SECURITY: Exclude soft-deleted users unless explicitly requested
      ...(!includeDeleted && { deletedAt: null }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(role && role !== 'all' && { role: role as 'USER' | 'ADMIN' }),
      ...(status && status !== 'all' && { status: status as 'ACTIVE' | 'SUSPENDED' | 'BANNED' }),
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          subscription: {
            select: {
              plan: true,
              status: true,
            },
          },
          creditBalance: {
            select: {
              balance: true,
            },
          },
          _count: {
            select: {
              aiUsage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.user.count({ where }),
    ]);

    return { users, total, hasMore: offset + users.length < total };
  },

  /**
   * Get user details with full information
   */
  async getUser(userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        creditBalance: {
          include: {
            ledger: {
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
          },
        },
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        aiUsage: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            aiUsage: true,
            apiKeys: true,
            blogPosts: true,
          },
        },
      },
    });
  },

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    data: {
      name?: string;
      email?: string;
      role?: 'USER' | 'ADMIN';
      status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
    }
  ) {
    return db.user.update({
      where: { id: userId },
      data,
    });
  },

  /**
   * Ban user with reason
   */
  async banUser(userId: string, reason?: string) {
    return db.user.update({
      where: { id: userId },
      data: {
        status: 'BANNED',
        bannedAt: new Date(),
        bannedReason: reason,
      },
    });
  },

  /**
   * Suspend user with reason
   */
  async suspendUser(userId: string, reason?: string) {
    return db.user.update({
      where: { id: userId },
      data: {
        status: 'SUSPENDED',
        bannedAt: new Date(),
        bannedReason: reason,
      },
    });
  },

  /**
   * Reactivate user (unban/unsuspend)
   */
  async reactivateUser(userId: string) {
    return db.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        bannedAt: null,
        bannedReason: null,
      },
    });
  },

  /**
   * Adjust user credits
   */
  async adjustCredits(
    userId: string,
    amount: number,
    reason: string
  ) {
    // Get or create credit balance
    let creditBalance = await db.creditBalance.findUnique({
      where: { userId },
    });

    if (!creditBalance) {
      creditBalance = await db.creditBalance.create({
        data: { userId, balance: 0 },
      });
    }

    // Create ledger entry and update balance
    const [ledgerEntry, updatedBalance] = await db.$transaction([
      db.creditLedger.create({
        data: {
          balanceId: creditBalance.id,
          amount,
          type: amount > 0 ? 'GRANT' : 'BURN',
          description: reason,
          metadata: { adjustedBy: 'admin', reason },
        },
      }),
      db.creditBalance.update({
        where: { id: creditBalance.id },
        data: { balance: { increment: amount } },
      }),
    ]);

    return { ledgerEntry, balance: updatedBalance };
  },

  /**
   * Get user activity/timeline
   */
  async getUserActivity(userId: string, limit: number = 50) {
    const [
      aiUsage,
      creditHistory,
      sessions,
    ] = await Promise.all([
      db.aIUsage.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      db.creditLedger.findMany({
        where: { balance: { userId } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      db.session.findMany({
        where: { userId },
        orderBy: { expires: 'desc' },
        take: 10,
      }),
    ]);

    return { aiUsage, creditHistory, sessions };
  },

  /**
   * Soft delete user
   * SECURITY: Uses soft delete to preserve audit trail and allow data recovery
   * The user's data is retained but they can no longer log in
   */
  async deleteUser(userId: string, reason?: string) {
    return db.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        deletedReason: reason || 'Deleted by admin',
        status: 'BANNED',
        // Clear sensitive data but preserve for audit
        passwordHash: null,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      },
    });
  },

  /**
   * Permanently delete user (hard delete)
   * SECURITY: Only use when legally required (e.g., GDPR right to erasure)
   * This action is irreversible
   */
  async permanentlyDeleteUser(userId: string) {
    console.warn(`[CRITICAL] Permanently deleting user ${userId} - this action is irreversible`);
    return db.user.delete({
      where: { id: userId },
    });
  },

  /**
   * Restore soft-deleted user
   */
  async restoreUser(userId: string) {
    return db.user.update({
      where: { id: userId },
      data: {
        deletedAt: null,
        deletedReason: null,
        status: 'ACTIVE',
      },
    });
  },

  /**
   * List soft-deleted users
   */
  async listDeletedUsers(options?: { limit?: number; offset?: number }) {
    const { limit = 20, offset = 0 } = options || {};

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: { deletedAt: { not: null } },
        orderBy: { deletedAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          email: true,
          name: true,
          deletedAt: true,
          deletedReason: true,
        },
      }),
      db.user.count({ where: { deletedAt: { not: null } } }),
    ]);

    return { users, total, hasMore: offset + users.length < total };
  },

  /**
   * List subscriptions with filters
   */
  async listSubscriptions(options?: {
    status?: string;
    plan?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ subscriptions: SubscriptionWithUser[]; total: number; hasMore: boolean }> {
    const { status, plan, limit = 20, offset = 0 } = options || {};

    const where = {
      ...(status && { status: status as 'ACTIVE' | 'INACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' }),
      ...(plan && { plan: plan as 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' }),
    };

    const [subscriptions, total] = await Promise.all([
      db.subscription.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.subscription.count({ where }),
    ]);

    return { subscriptions, total, hasMore: offset + subscriptions.length < total };
  },

  /**
   * Get analytics data
   */
  async getAnalytics(options?: { startDate?: Date; endDate?: Date }) {
    const { startDate, endDate } = options || {};
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    // User signups by day
    const signups = await db.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: true,
    });

    // AI usage by day
    const aiUsage = await db.aIUsage.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: true,
      _sum: {
        totalTokens: true,
        creditsUsed: true,
      },
    });

    // Top models used
    const topModels = await db.aIUsage.groupBy({
      by: ['model'],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: true,
      _sum: {
        totalTokens: true,
      },
      orderBy: {
        _count: {
          model: 'desc',
        },
      },
      take: 10,
    });

    return {
      signups,
      aiUsage,
      topModels,
    };
  },

  /**
   * Get recent activity
   * SECURITY: Optional PII minimization for privacy compliance
   */
  async getRecentActivity(limit: number = 20, options?: { minimizePII?: boolean }) {
    const { minimizePII = false } = options || {};

    const [recentUsers, recentSubscriptions, recentAiUsage] = await Promise.all([
      db.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),
      db.subscription.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      db.aIUsage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // SECURITY: Apply PII minimization if requested
    if (minimizePII) {
      return {
        users: recentUsers.map((u) => ({
          ...u,
          email: privacy.maskEmail(u.email),
          name: u.name ? privacy.maskName(u.name) : null,
        })),
        subscriptions: recentSubscriptions.map((s) => ({
          ...s,
          user: {
            email: privacy.maskEmail(s.user.email || ''),
            name: s.user.name ? privacy.maskName(s.user.name) : null,
          },
        })),
        aiUsage: recentAiUsage.map((a) => ({
          ...a,
          user: {
            email: privacy.maskEmail(a.user.email || ''),
            name: a.user.name ? privacy.maskName(a.user.name) : null,
          },
        })),
      };
    }

    return {
      users: recentUsers,
      subscriptions: recentSubscriptions,
      aiUsage: recentAiUsage,
    };
  },

  // ==================== ORGANIZATION MANAGEMENT ====================

  /**
   * List organizations with pagination and filters
   */
  async listOrganizations(options?: {
    search?: string;
    plan?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ organizations: OrganizationWithRelations[]; total: number; hasMore: boolean }> {
    const { search, plan, limit = 20, offset = 0 } = options || {};

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
          { owner: { email: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
      ...(plan && plan !== 'all' && { plan: plan as 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' }),
    };

    const [organizations, total] = await Promise.all([
      db.organization.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              aiUsage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.organization.count({ where }),
    ]);

    return { organizations, total, hasMore: offset + organizations.length < total };
  },

  /**
   * Get organization details with full information
   */
  async getOrganization(organizationId: string) {
    return db.organization.findUnique({
      where: { id: organizationId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        invitations: {
          where: {
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        },
        aiUsage: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            members: true,
            aiUsage: true,
            invitations: true,
          },
        },
      },
    });
  },

  /**
   * Update organization
   */
  async updateOrganization(
    organizationId: string,
    data: {
      name?: string;
      slug?: string;
      plan?: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
      settings?: Prisma.InputJsonValue;
    }
  ) {
    return db.organization.update({
      where: { id: organizationId },
      data,
    });
  },

  /**
   * Delete organization
   */
  async deleteOrganization(organizationId: string) {
    return db.organization.delete({
      where: { id: organizationId },
    });
  },

  /**
   * Add member to organization
   */
  async addOrganizationMember(
    organizationId: string,
    userId: string,
    role: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER'
  ) {
    return db.organizationMember.create({
      data: {
        organizationId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Update member role
   */
  async updateOrganizationMemberRole(
    memberId: string,
    role: 'OWNER' | 'ADMIN' | 'MEMBER'
  ) {
    return db.organizationMember.update({
      where: { id: memberId },
      data: { role },
    });
  },

  /**
   * Remove member from organization
   */
  async removeOrganizationMember(memberId: string) {
    return db.organizationMember.delete({
      where: { id: memberId },
    });
  },

  /**
   * Cancel pending invitation
   */
  async cancelOrganizationInvitation(invitationId: string) {
    return db.organizationInvitation.delete({
      where: { id: invitationId },
    });
  },

  /**
   * Transfer organization ownership
   */
  async transferOrganizationOwnership(
    organizationId: string,
    newOwnerId: string
  ) {
    const org = await db.organization.findUnique({
      where: { id: organizationId },
      include: { members: true },
    });

    if (!org) throw new Error('Organization not found');

    // Check if new owner is already a member
    const existingMembership = org.members.find(m => m.userId === newOwnerId);

    return db.$transaction(async (tx) => {
      // Update old owner's membership to ADMIN
      await tx.organizationMember.updateMany({
        where: {
          organizationId,
          userId: org.ownerId,
          role: 'OWNER',
        },
        data: { role: 'ADMIN' },
      });

      // If new owner is not a member, create membership
      if (!existingMembership) {
        await tx.organizationMember.create({
          data: {
            organizationId,
            userId: newOwnerId,
            role: 'OWNER',
          },
        });
      } else {
        // Update new owner's membership to OWNER
        await tx.organizationMember.update({
          where: { id: existingMembership.id },
          data: { role: 'OWNER' },
        });
      }

      // Update organization owner
      return tx.organization.update({
        where: { id: organizationId },
        data: { ownerId: newOwnerId },
      });
    });
  },

  /**
   * Get organization stats
   */
  async getOrganizationStats(organizationId: string) {
    const [memberCount, aiUsageStats, invitationCount] = await Promise.all([
      db.organizationMember.count({ where: { organizationId } }),
      db.aIUsage.aggregate({
        where: { organizationId },
        _count: true,
        _sum: {
          totalTokens: true,
          creditsUsed: true,
          cost: true,
        },
      }),
      db.organizationInvitation.count({
        where: {
          organizationId,
          expiresAt: { gt: new Date() },
        },
      }),
    ]);

    return {
      memberCount,
      pendingInvitations: invitationCount,
      aiUsage: {
        totalRequests: aiUsageStats._count || 0,
        totalTokens: aiUsageStats._sum.totalTokens || 0,
        totalCreditsUsed: aiUsageStats._sum.creditsUsed || 0,
        totalCost: aiUsageStats._sum.cost || 0,
      },
    };
  },

  // ==================== WAITLIST MANAGEMENT ====================

  /**
   * List waitlist subscribers with pagination and filters
   */
  async listWaitlistSubscribers(options?: {
    search?: string;
    source?: string;
    status?: 'all' | 'confirmed' | 'unconfirmed' | 'unsubscribed';
    tag?: string;
    limit?: number;
    offset?: number;
  }) {
    const { search, source, status, tag, limit = 20, offset = 0 } = options || {};

    const where = {
      ...(search && {
        email: { contains: search, mode: 'insensitive' as const },
      }),
      ...(source && source !== 'all' && { source }),
      ...(status === 'confirmed' && { confirmed: true, unsubscribedAt: null }),
      ...(status === 'unconfirmed' && { confirmed: false, unsubscribedAt: null }),
      ...(status === 'unsubscribed' && { unsubscribedAt: { not: null } }),
      ...(status === 'all' ? {} : status === undefined && { unsubscribedAt: null }),
      ...(tag && { tags: { has: tag } }),
    };

    const [subscribers, total] = await Promise.all([
      db.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.newsletterSubscriber.count({ where }),
    ]);

    return { subscribers, total, hasMore: offset + subscribers.length < total };
  },

  /**
   * Get waitlist statistics
   */
  async getWaitlistStats() {
    const [total, confirmed, unconfirmed, unsubscribed, bySource, recentSignups, allTags] = await Promise.all([
      db.newsletterSubscriber.count({ where: { unsubscribedAt: null } }),
      db.newsletterSubscriber.count({ where: { confirmed: true, unsubscribedAt: null } }),
      db.newsletterSubscriber.count({ where: { confirmed: false, unsubscribedAt: null } }),
      db.newsletterSubscriber.count({ where: { unsubscribedAt: { not: null } } }),
      db.newsletterSubscriber.groupBy({
        by: ['source'],
        where: { unsubscribedAt: null },
        _count: true,
      }),
      db.newsletterSubscriber.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          unsubscribedAt: null,
        },
      }),
      db.newsletterSubscriber.findMany({
        where: { unsubscribedAt: null },
        select: { tags: true },
      }),
    ]);

    const sourceStats: Record<string, number> = {};
    bySource.forEach((s) => {
      sourceStats[s.source || 'unknown'] = s._count;
    });

    // Aggregate all unique tags
    const tagCounts: Record<string, number> = {};
    allTags.forEach((sub) => {
      sub.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return {
      total,
      confirmed,
      unconfirmed,
      unsubscribed,
      bySource: sourceStats,
      recentSignups,
      tags: tagCounts,
    };
  },

  /**
   * Bulk add tags to subscribers
   */
  async bulkAddTags(subscriberIds: string[], tags: string[]) {
    const results = await Promise.all(
      subscriberIds.map(async (id) => {
        const existing = await db.newsletterSubscriber.findUnique({ where: { id } });
        if (!existing) return null;

        return db.newsletterSubscriber.update({
          where: { id },
          data: {
            tags: [...new Set([...existing.tags, ...tags])],
          },
        });
      })
    );

    return results.filter(Boolean).length;
  },

  /**
   * Bulk remove tags from subscribers
   */
  async bulkRemoveTags(subscriberIds: string[], tagsToRemove: string[]) {
    const results = await Promise.all(
      subscriberIds.map(async (id) => {
        const existing = await db.newsletterSubscriber.findUnique({ where: { id } });
        if (!existing) return null;

        return db.newsletterSubscriber.update({
          where: { id },
          data: {
            tags: existing.tags.filter((t) => !tagsToRemove.includes(t)),
          },
        });
      })
    );

    return results.filter(Boolean).length;
  },

  /**
   * Bulk delete subscribers
   */
  async bulkDeleteSubscribers(subscriberIds: string[]) {
    const result = await db.newsletterSubscriber.deleteMany({
      where: { id: { in: subscriberIds } },
    });
    return result.count;
  },

  /**
   * Export waitlist as CSV
   * SECURITY: maxRecords parameter enforces export limit
   */
  async exportWaitlistCSV(options?: {
    confirmedOnly?: boolean;
    tag?: string;
    maxRecords?: number;
  }) {
    const where = {
      unsubscribedAt: null,
      ...(options?.confirmedOnly && { confirmed: true }),
      ...(options?.tag && { tags: { has: options.tag } }),
    };

    // SECURITY: Enforce export limit to prevent DoS
    const limit = options?.maxRecords || 100000;

    const subscribers = await db.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const headers = ['email', 'confirmed', 'source', 'tags', 'created_at'];
    const rows = subscribers.map((s) => [
      s.email,
      s.confirmed ? 'yes' : 'no',
      s.source || '',
      s.tags.join(';'),
      s.createdAt.toISOString(),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  // ==================== FEATURE FLAGS / APP CONFIG ====================

  /**
   * Get app configuration
   */
  async getAppConfig() {
    let config = await db.appConfig.findUnique({ where: { id: 'default' } });

    // Create default config if not exists
    if (!config) {
      config = await db.appConfig.create({
        data: { id: 'default' },
      });
    }

    return config;
  },

  /**
   * Update app configuration
   */
  async updateAppConfig(data: {
    siteName?: string;
    siteIcon?: string;
    siteUrl?: string;
    siteDescription?: string;
    waitlistMode?: boolean;
    maintenanceMode?: boolean;
    authProvider?: 'NEXTAUTH' | 'SUPABASE' | 'BETTERAUTH';
    paymentProvider?: 'STRIPE' | 'LEMONSQUEEZY' | 'POLAR';
    aiProvider?: 'OPENROUTER' | 'VERCEL';
    theme?: Prisma.InputJsonValue;
  }) {
    return db.appConfig.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
  },

  /**
   * Toggle a specific feature flag
   */
  async toggleFeatureFlag(flag: 'waitlistMode' | 'maintenanceMode', enabled: boolean) {
    return db.appConfig.upsert({
      where: { id: 'default' },
      update: { [flag]: enabled },
      create: { id: 'default', [flag]: enabled },
    });
  },
};
