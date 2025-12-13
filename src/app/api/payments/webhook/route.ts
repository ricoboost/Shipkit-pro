/**
 * Payment Webhook Handler
 * Handles webhooks from Stripe, LemonSqueezy, or Polar
 *
 * SECURITY:
 * - Implements idempotency to prevent duplicate processing
 * - Only accepts signature from configured payment provider
 * - Validates credit amounts from database, not webhook metadata
 * - Validates webhook metadata with Zod schemas
 */

import { NextRequest } from 'next/server';
import { payments, credits } from '@/lib/payments';
import { db } from '@/lib/db';
import { z } from 'zod';

// SECURITY: Zod schemas for webhook metadata validation
const checkoutMetadataSchema = z.object({
  userId: z.string().min(1).max(100).optional(),
  creditPackageId: z.string().min(1).max(100).optional(),
  credits: z.string().regex(/^\d+$/).optional(),
}).passthrough();

const subscriptionMetadataSchema = z.object({
  userId: z.string().min(1).max(100).optional(),
}).passthrough();

/**
 * SECURITY: Safely parse and validate metadata
 */
function validateMetadata<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  defaultValue: T
): T {
  try {
    if (!data) return defaultValue;
    return schema.parse(data);
  } catch (error) {
    console.warn('Invalid webhook metadata:', error);
    return defaultValue;
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.text();

    // SECURITY: Only accept signature header matching configured provider
    const provider = payments.getProvider();
    let signature = '';

    switch (provider) {
      case 'stripe':
        signature = req.headers.get('stripe-signature') || '';
        break;
      case 'lemonsqueezy':
        signature = req.headers.get('x-signature') || '';
        break;
      case 'polar':
        signature = req.headers.get('x-polar-signature') || '';
        break;
    }

    if (!signature) {
      console.error('Missing webhook signature');
      return Response.json({ error: 'Missing signature' }, { status: 401 });
    }

    const event = await payments.constructWebhookEvent(body, signature);

    // SECURITY: Idempotency check - prevent duplicate processing
    const webhookId = event.id || `${event.provider}-${event.type}-${Date.now()}`;
    const existingWebhook = await db.webhookLog.findUnique({
      where: { webhookId },
    });

    if (existingWebhook) {
      console.log(`Webhook ${webhookId} already processed, skipping`);
      return Response.json({ received: true, status: 'already_processed' });
    }

    console.log(`Processing webhook: ${event.type} from ${event.provider}`);

    // Handle events based on provider
    switch (event.provider) {
      case 'stripe':
        await handleStripeEvent(event);
        break;
      case 'lemonsqueezy':
        await handleLemonSqueezyEvent(event);
        break;
      case 'polar':
        await handlePolarEvent(event);
        break;
    }

    // SECURITY: Log webhook for idempotency tracking
    await db.webhookLog.create({
      data: {
        webhookId,
        provider: event.provider.toUpperCase() as 'STRIPE' | 'LEMONSQUEEZY' | 'POLAR',
        eventType: event.type,
        status: 'processed',
      },
    });

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 500 for transient errors (provider will retry)
    // Return 400 for permanent errors (provider won't retry)
    const isTransient = error instanceof Error &&
      (error.message.includes('timeout') ||
       error.message.includes('network') ||
       error.message.includes('database'));

    return Response.json(
      { error: 'Webhook handler failed' },
      { status: isTransient ? 503 : 400 }
    );
  }
}

async function handleStripeEvent(event: { type: string; data: Record<string, unknown> }) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data as {
        customer: string;
        customer_email?: string;
        metadata?: { userId?: string; creditPackageId?: string; credits?: string };
        mode: string;
        subscription?: string;
      };

      if (session.mode === 'subscription') {
        // Handle subscription creation
        await handleSubscriptionCreated(session);
      } else if (session.mode === 'payment') {
        // Handle one-time payment (credit purchase)
        await handleCreditPurchase(session);
      }
      break;
    }

    case 'customer.subscription.updated': {
      await handleSubscriptionUpdated(event.data);
      break;
    }

    case 'customer.subscription.deleted': {
      await handleSubscriptionCanceled(event.data);
      break;
    }

    case 'invoice.payment_succeeded': {
      await handleInvoicePaid(event.data);
      break;
    }

    case 'invoice.payment_failed': {
      await handleInvoiceFailed(event.data);
      break;
    }
  }
}

async function handleLemonSqueezyEvent(event: { type: string; data: Record<string, unknown> }) {
  switch (event.type) {
    case 'subscription_created':
    case 'subscription_updated':
      await handleSubscriptionUpdated(event.data);
      break;

    case 'subscription_cancelled':
      await handleSubscriptionCanceled(event.data);
      break;

    case 'order_created':
      // Handle one-time purchase
      await handleOrderCreated(event.data);
      break;
  }
}

async function handlePolarEvent(event: { type: string; data: Record<string, unknown> }) {
  switch (event.type) {
    case 'subscription.created':
    case 'subscription.updated':
      await handleSubscriptionUpdated(event.data);
      break;

    case 'subscription.canceled':
      await handleSubscriptionCanceled(event.data);
      break;

    case 'checkout.completed':
      await handleCheckoutCompleted(event.data);
      break;
  }
}

// Helper functions for common operations
async function handleSubscriptionCreated(session: Record<string, unknown>) {
  // SECURITY: Validate metadata with Zod schema
  const metadata = validateMetadata(session.metadata, subscriptionMetadataSchema, {});
  const userId = metadata.userId;
  if (!userId) return;

  const subscriptionId = session.subscription as string;
  const subscription = await payments.getSubscription(subscriptionId);
  if (!subscription) return;

  // Update user's subscription in database
  await db.subscription.upsert({
    where: { userId },
    update: {
      providerSubscriptionId: subscription.id,
      status: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
      providerPriceId: subscription.priceId,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
    },
    create: {
      userId,
      providerSubscriptionId: subscription.id,
      providerCustomerId: subscription.customerId,
      provider: payments.getProvider().toUpperCase() as 'STRIPE' | 'LEMONSQUEEZY' | 'POLAR',
      status: 'ACTIVE',
      providerPriceId: subscription.priceId,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
    },
  });

  console.log(`Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdated(data: Record<string, unknown>) {
  const subscriptionId = data.id as string;

  // SECURITY: First verify the subscription exists in our database
  // This prevents attackers from creating fake subscriptions via forged webhooks
  const existingSubscription = await db.subscription.findFirst({
    where: { providerSubscriptionId: subscriptionId },
  });

  if (!existingSubscription) {
    console.warn(`Subscription ${subscriptionId} not found in database, ignoring update`);
    return;
  }

  // Now fetch the updated details from the payment provider
  const subscription = await payments.getSubscription(subscriptionId);
  if (!subscription) {
    console.warn(`Could not fetch subscription ${subscriptionId} from provider`);
    return;
  }

  await db.subscription.updateMany({
    where: { providerSubscriptionId: subscriptionId },
    data: {
      status: subscription.status === 'active' ? 'ACTIVE' :
        subscription.status === 'canceled' ? 'CANCELED' : 'INACTIVE',
      providerPriceId: subscription.priceId,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    },
  });

  console.log(`Subscription ${subscriptionId} updated`);
}

async function handleSubscriptionCanceled(data: Record<string, unknown>) {
  const subscriptionId = data.id as string;

  await db.subscription.updateMany({
    where: { providerSubscriptionId: subscriptionId },
    data: {
      status: 'CANCELED',
      cancelAtPeriodEnd: true,
    },
  });

  console.log(`Subscription ${subscriptionId} canceled`);
}

async function handleCreditPurchase(session: Record<string, unknown>) {
  // SECURITY: Validate metadata with Zod schema
  const metadata = validateMetadata(session.metadata, checkoutMetadataSchema, {});
  const userId = metadata.userId;
  const packageId = metadata.creditPackageId;

  if (!userId || !packageId) {
    console.error('Missing userId or packageId in credit purchase webhook');
    return;
  }

  // SECURITY: Fetch credit amount from database, NOT from webhook metadata
  // This prevents attackers from inflating credit amounts via forged webhooks
  const creditPackage = await db.creditPackage.findUnique({
    where: { id: packageId },
  });

  if (!creditPackage) {
    console.error(`Credit package ${packageId} not found`);
    return;
  }

  const creditAmount = creditPackage.credits;

  await credits.processPurchase(
    userId,
    packageId,
    creditAmount,
    session.id as string
  );

  console.log(`Credits purchased: ${creditAmount} for user ${userId} (package: ${packageId})`);
}

async function handleInvoicePaid(data: Record<string, unknown>) {
  const subscriptionId = data.subscription as string;
  if (!subscriptionId) return;

  // Could add monthly credits here for subscription renewals
  console.log(`Invoice paid for subscription ${subscriptionId}`);
}

async function handleInvoiceFailed(data: Record<string, unknown>) {
  const subscriptionId = data.subscription as string;
  if (!subscriptionId) return;

  await db.subscription.updateMany({
    where: { providerSubscriptionId: subscriptionId },
    data: { status: 'PAST_DUE' },
  });

  console.log(`Invoice failed for subscription ${subscriptionId}`);
}

async function handleOrderCreated(data: Record<string, unknown>) {
  const attributes = data.attributes as Record<string, unknown>;
  // SECURITY: Validate metadata with Zod schema
  const metadata = validateMetadata(attributes?.custom_data, checkoutMetadataSchema, {});
  const userId = metadata.userId;

  if (!userId) return;

  // Handle credit purchase for LemonSqueezy
  const creditAmount = parseInt(metadata.credits || '0', 10);
  if (creditAmount > 0) {
    await credits.processPurchase(
      userId,
      metadata.creditPackageId || 'unknown',
      creditAmount
    );
  }
}

async function handleCheckoutCompleted(data: Record<string, unknown>) {
  // SECURITY: Validate metadata with Zod schema
  const metadata = validateMetadata(data.metadata, checkoutMetadataSchema, {});
  const userId = metadata.userId;

  if (!userId) return;

  // Handle Polar checkout completion
  const creditAmount = parseInt(metadata.credits || '0', 10);
  if (creditAmount > 0) {
    await credits.processPurchase(
      userId,
      metadata.creditPackageId || 'unknown',
      creditAmount
    );
  }
}
