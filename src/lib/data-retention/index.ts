/**
 * Data Retention and Cleanup Service
 *
 * SECURITY: Handles automatic cleanup of expired/stale data
 * - Prevents database bloat
 * - Ensures GDPR/privacy compliance
 * - Cleans up expired security tokens
 */

import { db } from '@/lib/db';

export interface RetentionConfig {
  // Session/token retention (days)
  sessionRetentionDays: number;
  revokedSessionRetentionDays: number;
  verificationTokenRetentionDays: number;

  // Webhook/audit logs (days)
  webhookLogRetentionDays: number;
  auditLogRetentionDays: number;

  // User data
  softDeletedUserRetentionDays: number; // Days before permanent deletion

  // Invitation cleanup
  expiredInvitationRetentionDays: number;
}

export const defaultRetentionConfig: RetentionConfig = {
  sessionRetentionDays: 30,
  revokedSessionRetentionDays: 7,
  verificationTokenRetentionDays: 7,
  webhookLogRetentionDays: 90,
  auditLogRetentionDays: 365,
  softDeletedUserRetentionDays: 30, // Give 30 days to recover before permanent deletion
  expiredInvitationRetentionDays: 7,
};

export interface CleanupResult {
  expiredSessions: number;
  revokedSessions: number;
  verificationTokens: number;
  webhookLogs: number;
  auditLogs: number;
  expiredInvitations: number;
  softDeletedUsers: number;
  errors: string[];
}

export const dataRetention = {
  /**
   * Run all cleanup tasks
   * Safe to run frequently (e.g., daily via cron)
   */
  async runCleanup(config: RetentionConfig = defaultRetentionConfig): Promise<CleanupResult> {
    const result: CleanupResult = {
      expiredSessions: 0,
      revokedSessions: 0,
      verificationTokens: 0,
      webhookLogs: 0,
      auditLogs: 0,
      expiredInvitations: 0,
      softDeletedUsers: 0,
      errors: [],
    };

    const now = new Date();

    // 1. Clean up expired sessions
    try {
      const sessionCutoff = new Date(now.getTime() - config.sessionRetentionDays * 24 * 60 * 60 * 1000);
      const sessions = await db.session.deleteMany({
        where: { expires: { lt: sessionCutoff } },
      });
      result.expiredSessions = sessions.count;
    } catch (error) {
      result.errors.push(`Session cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 2. Clean up revoked sessions past their expiry
    try {
      const revokedCutoff = new Date(now.getTime() - config.revokedSessionRetentionDays * 24 * 60 * 60 * 1000);
      const revokedSessions = await db.revokedSession.deleteMany({
        where: { expiresAt: { lt: revokedCutoff } },
      });
      result.revokedSessions = revokedSessions.count;
    } catch (error) {
      result.errors.push(`Revoked session cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 3. Clean up expired verification tokens
    try {
      const tokenCutoff = new Date(now.getTime() - config.verificationTokenRetentionDays * 24 * 60 * 60 * 1000);
      const tokens = await db.verificationToken.deleteMany({
        where: { expires: { lt: tokenCutoff } },
      });
      result.verificationTokens = tokens.count;
    } catch (error) {
      result.errors.push(`Verification token cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 4. Clean up old webhook logs
    try {
      const webhookCutoff = new Date(now.getTime() - config.webhookLogRetentionDays * 24 * 60 * 60 * 1000);
      const webhooks = await db.webhookLog.deleteMany({
        where: { createdAt: { lt: webhookCutoff } },
      });
      result.webhookLogs = webhooks.count;
    } catch (error) {
      result.errors.push(`Webhook log cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 5. Clean up old audit logs
    try {
      const auditCutoff = new Date(now.getTime() - config.auditLogRetentionDays * 24 * 60 * 60 * 1000);
      const audits = await db.auditLog.deleteMany({
        where: { createdAt: { lt: auditCutoff } },
      });
      result.auditLogs = audits.count;
    } catch (error) {
      result.errors.push(`Audit log cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 6. Clean up expired invitations
    try {
      const invitationCutoff = new Date(now.getTime() - config.expiredInvitationRetentionDays * 24 * 60 * 60 * 1000);
      const invitations = await db.organizationInvitation.deleteMany({
        where: { expiresAt: { lt: invitationCutoff } },
      });
      result.expiredInvitations = invitations.count;
    } catch (error) {
      result.errors.push(`Invitation cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 7. Permanently delete users that have been soft-deleted past retention period
    // SECURITY: This is the only place where users are permanently deleted
    try {
      const userCutoff = new Date(now.getTime() - config.softDeletedUserRetentionDays * 24 * 60 * 60 * 1000);
      const users = await db.user.deleteMany({
        where: {
          deletedAt: { lt: userCutoff, not: null },
        },
      });
      result.softDeletedUsers = users.count;
      if (users.count > 0) {
        console.log(`[DATA RETENTION] Permanently deleted ${users.count} users past retention period`);
      }
    } catch (error) {
      result.errors.push(`Soft-deleted user cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Log summary
    console.log('[DATA RETENTION] Cleanup completed:', {
      expiredSessions: result.expiredSessions,
      revokedSessions: result.revokedSessions,
      verificationTokens: result.verificationTokens,
      webhookLogs: result.webhookLogs,
      auditLogs: result.auditLogs,
      expiredInvitations: result.expiredInvitations,
      softDeletedUsers: result.softDeletedUsers,
      errors: result.errors.length,
    });

    return result;
  },

  /**
   * Get retention statistics (for admin dashboard)
   */
  async getRetentionStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [
      totalSessions,
      expiredSessions,
      revokedSessions,
      webhookLogs30d,
      webhookLogs90d,
      auditLogs30d,
      softDeletedUsers,
      expiredInvitations,
    ] = await Promise.all([
      db.session.count(),
      db.session.count({ where: { expires: { lt: now } } }),
      db.revokedSession.count(),
      db.webhookLog.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.webhookLog.count({ where: { createdAt: { gte: ninetyDaysAgo } } }),
      db.auditLog.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.user.count({ where: { deletedAt: { not: null } } }),
      db.organizationInvitation.count({ where: { expiresAt: { lt: now } } }),
    ]);

    return {
      sessions: {
        total: totalSessions,
        expired: expiredSessions,
        revoked: revokedSessions,
      },
      webhookLogs: {
        last30Days: webhookLogs30d,
        last90Days: webhookLogs90d,
      },
      auditLogs: {
        last30Days: auditLogs30d,
      },
      users: {
        softDeleted: softDeletedUsers,
      },
      invitations: {
        expired: expiredInvitations,
      },
    };
  },

  /**
   * GDPR: Complete user data export
   * Returns all data associated with a user for data portability
   */
  async exportUserData(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        creditBalance: {
          include: { ledger: true },
        },
        apiKeys: {
          select: {
            id: true,
            name: true,
            prefix: true,
            createdAt: true,
            lastUsed: true,
            // Exclude actual key
          },
        },
        aiUsage: true,
        memberships: {
          include: {
            organization: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        blogPosts: true,
      },
    });

    if (!user) return null;

    // Remove sensitive fields (using _prefix to indicate intentional omission)
    const { passwordHash: _pw, twoFactorSecret: _tfa, twoFactorBackupCodes: _codes, ...safeUser } = user;

    return {
      exportedAt: new Date().toISOString(),
      user: safeUser,
    };
  },

  /**
   * GDPR: Right to erasure - permanent deletion
   * SECURITY: Requires explicit confirmation
   */
  async gdprErasure(userId: string, confirmedDeletion: boolean): Promise<{ success: boolean; message: string }> {
    if (!confirmedDeletion) {
      return { success: false, message: 'Deletion must be explicitly confirmed' };
    }

    // Check if user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    console.log(`[GDPR] Processing erasure request for user ${userId}`);

    try {
      // Delete all user data
      await db.$transaction([
        // Delete API keys
        db.apiKey.deleteMany({ where: { userId } }),
        // Delete AI usage
        db.aIUsage.deleteMany({ where: { userId } }),
        // Delete credit ledger entries (via balance cascade)
        db.creditBalance.deleteMany({ where: { userId } }),
        // Delete sessions
        db.session.deleteMany({ where: { userId } }),
        // Delete accounts
        db.account.deleteMany({ where: { userId } }),
        // Delete organization memberships
        db.organizationMember.deleteMany({ where: { userId } }),
        // Delete referrals (as referrer)
        db.referral.deleteMany({ where: { referrerId: userId } }),
        // Finally, delete the user
        db.user.delete({ where: { id: userId } }),
      ]);

      console.log(`[GDPR] Successfully erased user ${userId}`);
      return { success: true, message: 'User data has been permanently deleted' };
    } catch (error) {
      console.error(`[GDPR] Erasure failed for user ${userId}:`, error);
      return { success: false, message: 'Failed to delete user data' };
    }
  },
};
