/**
 * Credits System
 * Manage user credits with a ledger-based approach
 */

import { db } from '@/lib/db';
import type { CreditType, Prisma } from '@prisma/client';

export interface CreditTransactionInput {
  userId: string;
  amount: number;
  type: CreditType;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface CreditCheckResult {
  hasEnough: boolean;
  balance: number;
  required: number;
}

export const credits = {
  /**
   * Get user's current credit balance
   */
  async getBalance(userId: string): Promise<number> {
    const balance = await db.creditBalance.findUnique({
      where: { userId },
    });
    return balance?.balance ?? 0;
  },

  /**
   * Check if user has enough credits
   */
  async checkBalance(userId: string, required: number): Promise<CreditCheckResult> {
    const balance = await this.getBalance(userId);
    return {
      hasEnough: balance >= required,
      balance,
      required,
    };
  },

  /**
   * Get or create credit balance for user
   */
  async getOrCreateBalance(userId: string): Promise<{ id: string; balance: number }> {
    const existing = await db.creditBalance.findUnique({
      where: { userId },
    });

    if (existing) {
      return { id: existing.id, balance: existing.balance };
    }

    const created = await db.creditBalance.create({
      data: { userId, balance: 0 },
    });

    return { id: created.id, balance: created.balance };
  },

  /**
   * Add credits to user's account
   */
  async addCredits(input: CreditTransactionInput): Promise<number> {
    const { userId, amount, type, description, metadata } = input;

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const result = await db.$transaction(async (tx) => {
      // Get or create balance
      let balanceRecord = await tx.creditBalance.findUnique({
        where: { userId },
      });

      if (!balanceRecord) {
        balanceRecord = await tx.creditBalance.create({
          data: { userId, balance: 0 },
        });
      }

      // Create ledger entry
      await tx.creditLedger.create({
        data: {
          balanceId: balanceRecord.id,
          amount,
          type,
          description,
          metadata: metadata as Prisma.InputJsonValue | undefined,
        },
      });

      // Update balance
      const updated = await tx.creditBalance.update({
        where: { id: balanceRecord.id },
        data: {
          balance: { increment: amount },
        },
      });

      return updated.balance;
    });

    return result;
  },

  /**
   * Use credits from user's account
   * SECURITY: Uses serializable isolation to prevent race conditions
   */
  async useCredits(input: CreditTransactionInput): Promise<number> {
    const { userId, amount, type, description, metadata } = input;

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // SECURITY: Use serializable isolation to prevent concurrent credit exploitation
    // Without this, multiple concurrent requests could pass the balance check
    // before any deduction occurs, resulting in negative balance
    const result = await db.$transaction(async (tx) => {
      // Check current balance with a SELECT ... FOR UPDATE equivalent
      const balanceRecord = await tx.creditBalance.findUnique({
        where: { userId },
      });

      if (!balanceRecord || balanceRecord.balance < amount) {
        throw new Error('Insufficient credits');
      }

      // Double-check: Verify balance won't go negative
      const newBalance = balanceRecord.balance - amount;
      if (newBalance < 0) {
        throw new Error('Insufficient credits');
      }

      // Create ledger entry (negative amount)
      await tx.creditLedger.create({
        data: {
          balanceId: balanceRecord.id,
          amount: -amount,
          type,
          description,
          metadata: metadata as Prisma.InputJsonValue | undefined,
        },
      });

      // Update balance
      const updated = await tx.creditBalance.update({
        where: { id: balanceRecord.id },
        data: {
          balance: { decrement: amount },
        },
      });

      // SECURITY: Final check - ensure balance didn't go negative
      if (updated.balance < 0) {
        throw new Error('Race condition detected: balance went negative');
      }

      return updated.balance;
    }, {
      // SECURITY: Serializable isolation prevents concurrent transactions
      // from reading uncommitted data
      isolationLevel: 'Serializable',
    });

    return result;
  },

  /**
   * Try to use credits, returning false if insufficient
   */
  async tryUseCredits(input: CreditTransactionInput): Promise<{ success: boolean; balance: number }> {
    try {
      const balance = await this.useCredits(input);
      return { success: true, balance };
    } catch {
      const balance = await this.getBalance(input.userId);
      return { success: false, balance };
    }
  },

  /**
   * Get user's credit transaction history
   */
  async getHistory(userId: string, options?: {
    limit?: number;
    offset?: number;
    type?: CreditType;
  }) {
    const { limit = 50, offset = 0, type } = options || {};

    const balance = await db.creditBalance.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!balance) {
      return {
        transactions: [],
        total: 0,
        hasMore: false,
      };
    }

    const where = {
      balanceId: balance.id,
      ...(type && { type }),
    };

    const [transactions, total] = await Promise.all([
      db.creditLedger.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.creditLedger.count({ where }),
    ]);

    return {
      transactions,
      total,
      hasMore: offset + transactions.length < total,
    };
  },

  /**
   * Get credit usage summary for a period
   */
  async getUsageSummary(userId: string, startDate: Date, endDate: Date) {
    const balance = await db.creditBalance.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!balance) {
      return {
        totalAdded: 0,
        totalUsed: 0,
        netChange: 0,
        byType: {} as Record<CreditType, number>,
      };
    }

    const transactions = await db.creditLedger.findMany({
      where: {
        balanceId: balance.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const summary = {
      totalAdded: 0,
      totalUsed: 0,
      netChange: 0,
      byType: {} as Record<CreditType, number>,
    };

    for (const tx of transactions) {
      if (tx.amount > 0) {
        summary.totalAdded += tx.amount;
      } else {
        summary.totalUsed += Math.abs(tx.amount);
      }
      summary.netChange += tx.amount;

      if (!summary.byType[tx.type]) {
        summary.byType[tx.type] = 0;
      }
      summary.byType[tx.type] += tx.amount;
    }

    return summary;
  },

  /**
   * Award signup bonus credits
   */
  async awardSignupBonus(userId: string, amount: number = 100): Promise<number> {
    return this.addCredits({
      userId,
      amount,
      type: 'GRANT',
      description: 'Welcome bonus credits',
    });
  },

  /**
   * Award referral bonus credits
   */
  async awardReferralBonus(userId: string, referrerId: string, amount: number = 50): Promise<void> {
    // Award to new user
    await this.addCredits({
      userId,
      amount,
      type: 'GRANT',
      description: 'Referral bonus credits',
      metadata: { referrerId },
    });

    // Award to referrer
    await this.addCredits({
      userId: referrerId,
      amount,
      type: 'GRANT',
      description: 'Referral reward credits',
      metadata: { referredUserId: userId },
    });
  },

  /**
   * Process credit package purchase
   */
  async processPurchase(
    userId: string,
    packageId: string,
    creditAmount: number,
    transactionId?: string
  ): Promise<number> {
    return this.addCredits({
      userId,
      amount: creditAmount,
      type: 'PURCHASE',
      description: `Credit package purchase: ${packageId}`,
      metadata: { packageId, transactionId },
    });
  },
};
