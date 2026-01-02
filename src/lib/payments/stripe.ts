/**
 * Stripe Payment Provider Implementation
 */

import Stripe from 'stripe';
import type {
  PaymentProviderInterface,
  CustomerInfo,
  CreateCustomerOptions,
  SubscriptionInfo,
  UpdateSubscriptionOptions,
  CheckoutOptions,
  CheckoutResult,
  PortalOptions,
  PortalResult,
  WebhookEvent,
  PriceInfo,
} from './types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

function mapSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionInfo['status'] {
  const statusMap: Record<Stripe.Subscription.Status, SubscriptionInfo['status']> = {
    active: 'active',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'canceled',
    past_due: 'past_due',
    paused: 'canceled',
    trialing: 'trialing',
    unpaid: 'past_due',
  };
  return statusMap[status] || 'incomplete';
}

function mapSubscription(sub: Stripe.Subscription): SubscriptionInfo {
  // Type assertion needed due to Stripe API version differences
  const subAny = sub as unknown as Record<string, unknown>;
  const currentPeriodStart = (subAny.current_period_start || subAny.currentPeriodStart) as number;
  const currentPeriodEnd = (subAny.current_period_end || subAny.currentPeriodEnd) as number;
  const cancelAtPeriodEnd = (subAny.cancel_at_period_end ?? subAny.cancelAtPeriodEnd) as boolean;

  return {
    id: sub.id,
    customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    priceId: sub.items.data[0]?.price.id || '',
    status: mapSubscriptionStatus(sub.status),
    currentPeriodStart: new Date(currentPeriodStart * 1000),
    currentPeriodEnd: new Date(currentPeriodEnd * 1000),
    cancelAtPeriodEnd,
    metadata: sub.metadata as Record<string, string>,
  };
}

function mapCustomer(customer: Stripe.Customer): CustomerInfo {
  return {
    id: customer.id,
    email: customer.email || '',
    name: customer.name || undefined,
    metadata: customer.metadata as Record<string, string>,
  };
}

function mapPrice(price: Stripe.Price): PriceInfo {
  return {
    id: price.id,
    productId: typeof price.product === 'string' ? price.product : price.product.id,
    name: price.nickname || '',
    amount: price.unit_amount || 0,
    currency: price.currency,
    interval: price.recurring?.interval === 'month' ? 'month' : price.recurring?.interval === 'year' ? 'year' : 'one_time',
    metadata: price.metadata as Record<string, string>,
  };
}

export class StripeProvider implements PaymentProviderInterface {
  // Customer management
  async createCustomer(options: CreateCustomerOptions): Promise<CustomerInfo> {
    const customer = await stripe.customers.create({
      email: options.email,
      name: options.name,
      metadata: options.metadata,
    });
    return mapCustomer(customer);
  }

  async getCustomer(customerId: string): Promise<CustomerInfo | null> {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) return null;
      return mapCustomer(customer as Stripe.Customer);
    } catch {
      return null;
    }
  }

  async updateCustomer(customerId: string, options: Partial<CreateCustomerOptions>): Promise<CustomerInfo> {
    const customer = await stripe.customers.update(customerId, {
      email: options.email,
      name: options.name,
      metadata: options.metadata,
    });
    return mapCustomer(customer);
  }

  async deleteCustomer(customerId: string): Promise<void> {
    await stripe.customers.del(customerId);
  }

  // Checkout
  async createCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price: options.priceId, quantity: 1 }],
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      metadata: options.metadata,
      allow_promotion_codes: options.allowPromotionCodes,
    };

    if (options.customerId) {
      sessionParams.customer = options.customerId;
    } else if (options.customerEmail) {
      sessionParams.customer_email = options.customerEmail;
    }

    if (options.trialDays) {
      sessionParams.subscription_data = {
        trial_period_days: options.trialDays,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      url: session.url!,
      sessionId: session.id,
    };
  }

  async createOneTimeCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: [{ price: options.priceId, quantity: 1 }],
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      metadata: options.metadata,
      allow_promotion_codes: options.allowPromotionCodes,
    };

    if (options.customerId) {
      sessionParams.customer = options.customerId;
    } else if (options.customerEmail) {
      sessionParams.customer_email = options.customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      url: session.url!,
      sessionId: session.id,
    };
  }

  // Subscriptions
  async getSubscription(subscriptionId: string): Promise<SubscriptionInfo | null> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return mapSubscription(subscription);
    } catch {
      return null;
    }
  }

  async getCustomerSubscriptions(customerId: string): Promise<SubscriptionInfo[]> {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
    });
    return subscriptions.data.map(mapSubscription);
  }

  async updateSubscription(options: UpdateSubscriptionOptions): Promise<SubscriptionInfo> {
    const updateParams: Stripe.SubscriptionUpdateParams = {};

    if (options.priceId) {
      const subscription = await stripe.subscriptions.retrieve(options.subscriptionId);
      updateParams.items = [
        {
          id: subscription.items.data[0].id,
          price: options.priceId,
        },
      ];
    }

    if (options.cancelAtPeriodEnd !== undefined) {
      updateParams.cancel_at_period_end = options.cancelAtPeriodEnd;
    }

    if (options.metadata) {
      updateParams.metadata = options.metadata;
    }

    const subscription = await stripe.subscriptions.update(
      options.subscriptionId,
      updateParams
    );

    return mapSubscription(subscription);
  }

  async cancelSubscription(subscriptionId: string, immediate = false): Promise<SubscriptionInfo> {
    if (immediate) {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return mapSubscription(subscription);
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return mapSubscription(subscription);
  }

  // Portal
  async createPortalSession(options: PortalOptions): Promise<PortalResult> {
    const session = await stripe.billingPortal.sessions.create({
      customer: options.customerId,
      return_url: options.returnUrl,
    });

    return { url: session.url };
  }

  // Webhooks
  async constructWebhookEvent(payload: string | Buffer, signature: string): Promise<WebhookEvent> {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      WEBHOOK_SECRET
    );

    return {
      id: event.id,
      type: event.type,
      data: event.data.object as unknown as Record<string, unknown>,
      provider: 'stripe',
      rawEvent: event,
    };
  }

  // Prices
  async getPrice(priceId: string): Promise<PriceInfo | null> {
    try {
      const price = await stripe.prices.retrieve(priceId);
      return mapPrice(price);
    } catch {
      return null;
    }
  }

  async listPrices(productId?: string): Promise<PriceInfo[]> {
    const params: Stripe.PriceListParams = { active: true };
    if (productId) {
      params.product = productId;
    }
    const prices = await stripe.prices.list(params);
    return prices.data.map(mapPrice);
  }
}
