/**
 * Newsletter & Waitlist Management
 * Handles email subscriptions, confirmations, and segmentation
 */

import { db } from '@/lib/db';
import crypto from 'crypto';

export interface SubscribeInput {
  email: string;
  source?: string;
  tags?: string[];
}

export interface SubscriberInfo {
  id: string;
  email: string;
  confirmed: boolean;
  source: string | null;
  tags: string[];
  createdAt: Date;
  unsubscribedAt: Date | null;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export const newsletter = {
  /**
   * Subscribe to newsletter/waitlist
   */
  async subscribe(input: SubscribeInput): Promise<{ subscriber: SubscriberInfo; isNew: boolean }> {
    const { email, source, tags = [] } = input;
    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing subscriber
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      // Resubscribe if previously unsubscribed
      if (existing.unsubscribedAt) {
        const updated = await db.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            unsubscribedAt: null,
            source: source || existing.source,
            tags: [...new Set([...existing.tags, ...tags])],
            confirmToken: existing.confirmed ? null : generateToken(),
          },
        });
        return { subscriber: this.mapSubscriber(updated), isNew: false };
      }

      // Already subscribed
      return { subscriber: this.mapSubscriber(existing), isNew: false };
    }

    // Create new subscriber
    const subscriber = await db.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        source,
        tags,
        confirmToken: generateToken(),
      },
    });

    return { subscriber: this.mapSubscriber(subscriber), isNew: true };
  },

  /**
   * Confirm email subscription
   */
  async confirm(token: string): Promise<SubscriberInfo | null> {
    const subscriber = await db.newsletterSubscriber.findUnique({
      where: { confirmToken: token },
    });

    if (!subscriber) {
      return null;
    }

    const updated = await db.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        confirmed: true,
        confirmToken: null,
      },
    });

    return this.mapSubscriber(updated);
  },

  /**
   * Unsubscribe from newsletter
   */
  async unsubscribe(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      await db.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: { unsubscribedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Unsubscribe by token (for one-click unsubscribe)
   */
  async unsubscribeByToken(token: string): Promise<boolean> {
    const subscriber = await db.newsletterSubscriber.findUnique({
      where: { confirmToken: token },
    });

    if (!subscriber) {
      return false;
    }

    await db.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { unsubscribedAt: new Date() },
    });

    return true;
  },

  /**
   * Get subscriber by email
   */
  async getByEmail(email: string): Promise<SubscriberInfo | null> {
    const normalizedEmail = email.toLowerCase().trim();

    const subscriber = await db.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    return subscriber ? this.mapSubscriber(subscriber) : null;
  },

  /**
   * Add tags to subscriber
   */
  async addTags(email: string, tags: string[]): Promise<SubscriberInfo | null> {
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (!existing) {
      return null;
    }

    const updated = await db.newsletterSubscriber.update({
      where: { email: normalizedEmail },
      data: {
        tags: [...new Set([...existing.tags, ...tags])],
      },
    });

    return this.mapSubscriber(updated);
  },

  /**
   * Remove tags from subscriber
   */
  async removeTags(email: string, tagsToRemove: string[]): Promise<SubscriberInfo | null> {
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (!existing) {
      return null;
    }

    const updated = await db.newsletterSubscriber.update({
      where: { email: normalizedEmail },
      data: {
        tags: existing.tags.filter((t) => !tagsToRemove.includes(t)),
      },
    });

    return this.mapSubscriber(updated);
  },

  /**
   * Get all subscribers (with filters)
   */
  async getSubscribers(options?: {
    confirmedOnly?: boolean;
    source?: string;
    tag?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ subscribers: SubscriberInfo[]; total: number }> {
    const { confirmedOnly = false, source, tag, limit = 50, offset = 0 } = options || {};

    const where = {
      unsubscribedAt: null,
      ...(confirmedOnly && { confirmed: true }),
      ...(source && { source }),
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

    return {
      subscribers: subscribers.map(this.mapSubscriber),
      total,
    };
  },

  /**
   * Get subscriber statistics
   */
  async getStats(): Promise<{
    total: number;
    confirmed: number;
    unconfirmed: number;
    unsubscribed: number;
    bySource: Record<string, number>;
    recentSignups: number;
  }> {
    const [total, confirmed, unsubscribed, bySource, recentSignups] = await Promise.all([
      db.newsletterSubscriber.count({
        where: { unsubscribedAt: null },
      }),
      db.newsletterSubscriber.count({
        where: { confirmed: true, unsubscribedAt: null },
      }),
      db.newsletterSubscriber.count({
        where: { unsubscribedAt: { not: null } },
      }),
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
    ]);

    const sourceStats: Record<string, number> = {};
    bySource.forEach((s) => {
      sourceStats[s.source || 'unknown'] = s._count;
    });

    return {
      total,
      confirmed,
      unconfirmed: total - confirmed,
      unsubscribed,
      bySource: sourceStats,
      recentSignups,
    };
  },

  /**
   * Export subscribers as CSV
   */
  async exportCSV(options?: { confirmedOnly?: boolean }): Promise<string> {
    const { subscribers } = await this.getSubscribers({
      confirmedOnly: options?.confirmedOnly,
      limit: 100000,
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

  // Helper to map database model to interface
  mapSubscriber(data: {
    id: string;
    email: string;
    confirmed: boolean;
    source: string | null;
    tags: string[];
    createdAt: Date;
    unsubscribedAt: Date | null;
  }): SubscriberInfo {
    return {
      id: data.id,
      email: data.email,
      confirmed: data.confirmed,
      source: data.source,
      tags: data.tags,
      createdAt: data.createdAt,
      unsubscribedAt: data.unsubscribedAt,
    };
  },
};
