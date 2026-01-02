/**
 * Checkout API Route
 * Creates checkout sessions for subscriptions or credit purchases
 *
 * SECURITY:
 * - Requires authentication
 * - Validates price IDs against server-side configuration (not client-provided)
 * - Credit packages validated against database
 * - Rate limited to prevent abuse
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { payments } from '@/lib/payments';
import { db } from '@/lib/db';
import { withRateLimit, rateLimitPresets } from '@/lib/security/rate-limit';
import { getPlanPriceId, isValidPriceId } from '@/config/pricing';

/**
 * SECURITY: Generate idempotency key to prevent duplicate checkouts
 * Key is based on user ID + checkout parameters + 5-minute window
 */
function generateIdempotencyKey(userId: string, params: Record<string, unknown>): string {
  const timeWindow = Math.floor(Date.now() / (5 * 60 * 1000)); // 5-minute windows
  const data = JSON.stringify({ userId, params, timeWindow });
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
}

// SECURITY: Accept plan name + interval instead of raw price IDs
const subscriptionSchema = z.object({
  plan: z.enum(['starter', 'pro', 'enterprise']),
  interval: z.enum(['monthly', 'yearly']),
  type: z.literal('subscription'),
});

const creditSchema = z.object({
  packageId: z.string(),
  type: z.literal('credits'),
});

const schema = z.discriminatedUnion('type', [subscriptionSchema, creditSchema]);

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // Rate limit: 20 checkout attempts per minute
    const { allowed, headers } = await withRateLimit(req, rateLimitPresets.apiStrict);
    if (!allowed) {
      return Response.json(
        { error: 'Too many checkout requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    const session = await auth.getSession();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/settings/billing?success=true`;
    const cancelUrl = `${baseUrl}/settings/billing?canceled=true`;

    // Get or create payment customer
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, stripeCustomerId: true },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;

    // Create customer in payment provider if not exists
    if (!customerId) {
      const customer = await payments.createCustomer({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });

      customerId = customer.id;

      // Save customer ID to user record
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    if (data.type === 'subscription') {
      // SECURITY: Get price ID from server-side config, not client input
      const provider = payments.getProvider();
      const priceId = getPlanPriceId(data.plan, data.interval, provider);

      if (!priceId) {
        return Response.json(
          { error: `No price configured for ${data.plan} ${data.interval}` },
          { status: 400 }
        );
      }

      // SECURITY: Double-check the price ID is valid
      if (!isValidPriceId(priceId, provider)) {
        console.error(`Invalid price ID configured: ${priceId}`);
        return Response.json({ error: 'Invalid pricing configuration' }, { status: 500 });
      }

      // SECURITY: Generate idempotency key to prevent duplicate checkouts on back navigation
      const idempotencyKey = generateIdempotencyKey(user.id, { type: 'subscription', plan: data.plan, interval: data.interval });

      // Create subscription checkout
      const checkout = await payments.createCheckout({
        priceId,
        customerId,
        successUrl,
        cancelUrl,
        metadata: { userId: user.id, plan: data.plan, interval: data.interval, idempotencyKey },
        allowPromotionCodes: true,
      });

      return Response.json({ url: checkout.url });
    } else {
      // Credit package purchase
      const creditPackage = await db.creditPackage.findUnique({
        where: { id: data.packageId },
      });

      if (!creditPackage) {
        return Response.json({ error: 'Package not found' }, { status: 404 });
      }

      // SECURITY: Generate idempotency key to prevent duplicate credit purchases
      const idempotencyKey = generateIdempotencyKey(user.id, { type: 'credits', packageId: data.packageId });

      const checkout = await payments.createOneTimeCheckout({
        priceId: creditPackage.stripePriceId || creditPackage.id,
        customerId,
        successUrl: `${baseUrl}/settings/billing?credits=success`,
        cancelUrl,
        metadata: {
          userId: user.id,
          creditPackageId: creditPackage.id,
          credits: creditPackage.credits.toString(),
          idempotencyKey,
        },
      });

      return Response.json({ url: checkout.url });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error('Checkout error:', error);
    return Response.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
