/**
 * Polar Payment Provider Implementation
 *
 * TODO: Full implementation - currently a stub
 * Docs: https://docs.polar.sh/api
 */

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

const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN;
const POLAR_ORGANIZATION_ID = process.env.POLAR_ORGANIZATION_ID;
const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;

async function polarRequest(endpoint: string, options?: RequestInit) {
  const response = await fetch(`https://api.polar.sh/v1${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${POLAR_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Polar API error: ${response.statusText}`);
  }

  return response.json();
}

export class PolarProvider implements PaymentProviderInterface {
  async createCustomer(options: CreateCustomerOptions): Promise<CustomerInfo> {
    // Polar creates customers automatically during checkout
    // This is a placeholder that returns a mock customer
    return {
      id: `polar_${Date.now()}`,
      email: options.email,
      name: options.name,
      metadata: options.metadata,
    };
  }

  async getCustomer(customerId: string): Promise<CustomerInfo | null> {
    try {
      const data = await polarRequest(`/customers/${customerId}`);
      return {
        id: data.id,
        email: data.email,
        name: data.name,
      };
    } catch {
      return null;
    }
  }

  async updateCustomer(customerId: string, options: Partial<CreateCustomerOptions>): Promise<CustomerInfo> {
    const data = await polarRequest(`/customers/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        email: options.email,
        name: options.name,
      }),
    });

    return {
      id: data.id,
      email: data.email,
      name: data.name,
    };
  }

  async deleteCustomer(_customerId: string): Promise<void> {
    // Polar may not support customer deletion
    console.warn('Polar customer deletion not implemented');
  }

  async createCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    const data = await polarRequest('/checkout-links', {
      method: 'POST',
      body: JSON.stringify({
        product_price_id: options.priceId,
        success_url: options.successUrl,
        metadata: {
          ...options.metadata,
          customer_email: options.customerEmail,
        },
      }),
    });

    return {
      url: data.url,
      sessionId: data.id,
    };
  }

  async createOneTimeCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    return this.createCheckout(options);
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionInfo | null> {
    try {
      const data = await polarRequest(`/subscriptions/${subscriptionId}`);

      return {
        id: data.id,
        customerId: data.user_id,
        priceId: data.product_price_id,
        status: data.status === 'active' ? 'active' : data.status === 'canceled' ? 'canceled' : 'incomplete',
        currentPeriodStart: new Date(data.current_period_start),
        currentPeriodEnd: new Date(data.current_period_end),
        cancelAtPeriodEnd: data.cancel_at_period_end || false,
      };
    } catch {
      return null;
    }
  }

  async getCustomerSubscriptions(customerId: string): Promise<SubscriptionInfo[]> {
    const data = await polarRequest(`/subscriptions?user_id=${customerId}`);

    return data.items.map((sub: Record<string, unknown>) => ({
      id: sub.id as string,
      customerId: sub.user_id as string,
      priceId: sub.product_price_id as string,
      status: sub.status === 'active' ? 'active' : 'canceled',
      currentPeriodStart: new Date(sub.current_period_start as string),
      currentPeriodEnd: new Date(sub.current_period_end as string),
      cancelAtPeriodEnd: (sub.cancel_at_period_end as boolean) || false,
    } as SubscriptionInfo));
  }

  async updateSubscription(options: UpdateSubscriptionOptions): Promise<SubscriptionInfo> {
    const data = await polarRequest(`/subscriptions/${options.subscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        product_price_id: options.priceId,
      }),
    });

    return {
      id: data.id,
      customerId: data.user_id,
      priceId: data.product_price_id,
      status: data.status === 'active' ? 'active' : 'canceled',
      currentPeriodStart: new Date(data.current_period_start),
      currentPeriodEnd: new Date(data.current_period_end),
      cancelAtPeriodEnd: data.cancel_at_period_end || false,
    };
  }

  async cancelSubscription(subscriptionId: string, _immediate = false): Promise<SubscriptionInfo> {
    const data = await polarRequest(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    });

    return {
      id: data.id,
      customerId: data.user_id,
      priceId: data.product_price_id,
      status: 'canceled',
      currentPeriodStart: new Date(data.current_period_start),
      currentPeriodEnd: new Date(data.current_period_end),
      cancelAtPeriodEnd: true,
    };
  }

  async createPortalSession(options: PortalOptions): Promise<PortalResult> {
    // Polar uses a different portal approach
    // Return the Polar dashboard URL
    return {
      url: `https://polar.sh/dashboard/${POLAR_ORGANIZATION_ID}/subscriptions?customer=${options.customerId}`,
    };
  }

  async constructWebhookEvent(payload: string | Buffer, signature: string): Promise<WebhookEvent> {
    // Verify webhook signature using HMAC
    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha256', POLAR_WEBHOOK_SECRET!);
    const digest = hmac.update(payload).digest('hex');

    if (digest !== signature) {
      throw new Error('Invalid webhook signature');
    }

    const event = JSON.parse(payload.toString());

    return {
      id: event.id,
      type: event.type,
      data: event.data,
      provider: 'polar',
      rawEvent: event,
    };
  }

  async getPrice(priceId: string): Promise<PriceInfo | null> {
    try {
      const data = await polarRequest(`/product-prices/${priceId}`);

      return {
        id: data.id,
        productId: data.product_id,
        name: data.product.name,
        description: data.product.description,
        amount: data.price_amount,
        currency: data.price_currency,
        interval: data.type === 'recurring'
          ? (data.recurring_interval === 'month' ? 'month' : 'year')
          : 'one_time',
      };
    } catch {
      return null;
    }
  }

  async listPrices(productId?: string): Promise<PriceInfo[]> {
    const endpoint = productId
      ? `/product-prices?product_id=${productId}`
      : `/product-prices?organization_id=${POLAR_ORGANIZATION_ID}`;

    const data = await polarRequest(endpoint);

    return data.items.map((price: Record<string, unknown>) => ({
      id: price.id as string,
      productId: price.product_id as string,
      name: (price.product as Record<string, unknown>)?.name as string || '',
      amount: price.price_amount as number,
      currency: price.price_currency as string,
      interval: price.type === 'recurring'
        ? (price.recurring_interval === 'month' ? 'month' : 'year')
        : 'one_time',
    } as PriceInfo));
  }
}
