'use server';

/**
 * Type-Safe Server Actions
 * Server-side RPC using Next.js Server Actions
 */

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { organizations, invitations } from '@/lib/organizations';
import { ai } from '@/lib/ai';
import { payments } from '@/lib/payments';
import { credits } from '@/lib/payments/credits';
import { schemas, responses } from './index';

// ============================================
// Auth Helpers
// ============================================

async function requireAuth() {
  const session = await auth.getSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name ?? null,
    role: (session.user as { role?: string }).role || 'USER',
  };
}

async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  return user;
}

// ============================================
// User Actions
// ============================================

export async function getCurrentUser() {
  const user = await requireAuth();

  const userData = await db.user.findUnique({
    where: { id: user.id },
    include: {
      subscription: true,
      creditBalance: true,
    },
  });

  return responses.success(userData);
}

export async function updateCurrentUser(input: z.infer<typeof schemas.user.update>) {
  const parsed = schemas.user.update.parse(input);
  const user = await requireAuth();

  const updated = await db.user.update({
    where: { id: user.id },
    data: parsed,
  });

  return responses.success(updated);
}

// SECURITY: Maximum pagination values to prevent DoS
const MAX_LIMIT = 100;
const MAX_PAGE = 10000;

export async function listUsers(input: z.infer<typeof schemas.pagination> & { search?: string }) {
  await requireAdmin();

  const { page = 1, search } = input;
  // SECURITY: Enforce pagination limits
  const safePage = Math.min(Math.max(1, page), MAX_PAGE);
  const limit = Math.min(Math.max(1, input.limit || 20), MAX_LIMIT);
  const offset = (safePage - 1) * limit;

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        subscription: { select: { plan: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.user.count({ where }),
  ]);

  return responses.paginated(users, total, page, limit);
}

// ============================================
// Organization Actions
// ============================================

export async function listOrganizations() {
  const user = await requireAuth();
  const orgs = await organizations.getUserOrganizations(user.id);
  return responses.success(orgs);
}

export async function getOrganization(input: z.infer<typeof schemas.id>) {
  const { id } = schemas.id.parse(input);
  const user = await requireAuth();

  const org = await organizations.getById(id);
  if (!org) {
    throw new Error('Organization not found');
  }

  const isMember = await organizations.isMember(id, user.id);
  if (!isMember) {
    throw new Error('You are not a member of this organization');
  }

  return responses.success(org);
}

export async function createOrganization(input: z.infer<typeof schemas.organization.create>) {
  const parsed = schemas.organization.create.parse(input);
  const user = await requireAuth();

  const org = await organizations.create({
    ...parsed,
    ownerId: user.id,
  });

  return responses.success(org);
}

export async function updateOrganization(
  input: z.infer<typeof schemas.id> & z.infer<typeof schemas.organization.update>
) {
  const { id, ...data } = input;
  const user = await requireAuth();

  const canManage = await organizations.canManage(id, user.id);
  if (!canManage) {
    throw new Error('You do not have permission to update this organization');
  }

  const org = await organizations.update(id, data);
  return responses.success(org);
}

export async function deleteOrganization(input: z.infer<typeof schemas.id>) {
  const { id } = schemas.id.parse(input);
  const user = await requireAuth();

  const org = await organizations.getById(id);
  if (!org || org.ownerId !== user.id) {
    throw new Error('Only the owner can delete an organization');
  }

  await organizations.delete(id);
  return responses.success({ deleted: true });
}

export async function inviteToOrganization(
  input: z.infer<typeof schemas.id> & z.infer<typeof schemas.invitation.create>
) {
  const { id, email, role } = input;
  const user = await requireAuth();

  const canManage = await organizations.canManage(id, user.id);
  if (!canManage) {
    throw new Error('You do not have permission to invite members');
  }

  const invitation = await invitations.create({
    organizationId: id,
    email,
    role,
    invitedByUserId: user.id,
  });

  return responses.success(invitation);
}

export async function listOrganizationMembers(input: z.infer<typeof schemas.id>) {
  const { id } = schemas.id.parse(input);
  const user = await requireAuth();

  const isMember = await organizations.isMember(id, user.id);
  if (!isMember) {
    throw new Error('You are not a member of this organization');
  }

  const members = await organizations.getMembers(id);
  return responses.success(members);
}

// ============================================
// AI Actions
// ============================================

export async function aiChat(input: z.infer<typeof schemas.ai.chat>) {
  const parsed = schemas.ai.chat.parse(input);
  const user = await requireAuth();

  const balance = await credits.getBalance(user.id);
  if (balance <= 0) {
    throw new Error('Insufficient credits');
  }

  const result = await ai.chat({
    messages: parsed.messages,
    model: parsed.model || 'gpt-4o-mini',
    temperature: parsed.temperature,
    maxTokens: parsed.maxTokens,
    userId: user.id,
  });

  return responses.success(result);
}

export async function aiCompletion(input: z.infer<typeof schemas.ai.completion>) {
  const parsed = schemas.ai.completion.parse(input);
  const user = await requireAuth();

  const balance = await credits.getBalance(user.id);
  if (balance <= 0) {
    throw new Error('Insufficient credits');
  }

  // Use chat API with a single user message for completion
  const result = await ai.chat({
    messages: [{ role: 'user', content: parsed.prompt }],
    model: parsed.model || 'gpt-4o-mini',
    temperature: parsed.temperature,
    maxTokens: parsed.maxTokens,
    userId: user.id,
  });

  return responses.success({
    text: result.content,
    usage: result.usage,
  });
}

export async function getAIUsageHistory(input: z.infer<typeof schemas.pagination>) {
  const { page = 1, limit = 20 } = input;
  const user = await requireAuth();
  const offset = (page - 1) * limit;

  const [usage, total] = await Promise.all([
    db.aIUsage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.aIUsage.count({ where: { userId: user.id } }),
  ]);

  return responses.paginated(usage, total, page, limit);
}

// ============================================
// Credits Actions
// ============================================

export async function getCreditsBalance() {
  const user = await requireAuth();
  const balance = await credits.getBalance(user.id);
  return responses.success({ balance });
}

export async function getCreditsHistory(input: z.infer<typeof schemas.pagination>) {
  const { page = 1, limit = 20 } = input;
  const user = await requireAuth();
  const history = await credits.getHistory(user.id, { limit, offset: (page - 1) * limit });
  return responses.success(history);
}

// ============================================
// Subscription Actions
// ============================================

export async function getCurrentSubscription() {
  const user = await requireAuth();

  const subscription = await db.subscription.findUnique({
    where: { userId: user.id },
  });

  return responses.success(subscription);
}

export async function createCheckoutSession(input: z.infer<typeof schemas.subscription.create>) {
  const parsed = schemas.subscription.create.parse(input);
  const user = await requireAuth();

  const result = await payments.createCheckout({
    customerEmail: user.email,
    priceId: `${parsed.plan.toLowerCase()}_${parsed.interval}`,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
    metadata: { userId: user.id },
  });

  return responses.success(result);
}

export async function createBillingPortalSession() {
  const user = await requireAuth();

  // Get user's Stripe customer ID
  const userData = await db.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  if (!userData?.stripeCustomerId) {
    throw new Error('No billing account found');
  }

  const result = await payments.createPortalSession({
    customerId: userData.stripeCustomerId,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing`,
  });

  return responses.success({ url: result.url });
}

// ============================================
// API Key Actions
// ============================================

export async function listApiKeys() {
  const user = await requireAuth();

  const keys = await db.apiKey.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      lastUsed: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return responses.success(keys);
}

export async function createApiKey(input: z.infer<typeof schemas.apiKey.create>) {
  const parsed = schemas.apiKey.create.parse(input);
  const user = await requireAuth();

  const { randomBytes } = await import('crypto');
  const keyValue = randomBytes(32).toString('hex');
  const fullKey = `sk_live_${keyValue}`;
  const prefix = fullKey.substring(0, 12);

  const apiKey = await db.apiKey.create({
    data: {
      name: parsed.name,
      key: fullKey,
      prefix,
      userId: user.id,
      expiresAt: parsed.expiresAt,
    },
  });

  return responses.success({
    id: apiKey.id,
    name: apiKey.name,
    key: fullKey, // Only time the full key is shown
    expiresAt: apiKey.expiresAt,
    createdAt: apiKey.createdAt,
  });
}

export async function deleteApiKey(input: z.infer<typeof schemas.id>) {
  const { id } = schemas.id.parse(input);
  const user = await requireAuth();

  const deleted = await db.apiKey.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  if (deleted.count === 0) {
    throw new Error('API key not found');
  }

  return responses.success({ deleted: true });
}
