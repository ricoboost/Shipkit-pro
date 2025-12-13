/**
 * LemonSqueezy Payment Provider Implementation
 *
 * TODO: Full implementation - currently a stub
 * Docs: https://docs.lemonsqueezy.com/api
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

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

async function lemonRequest(endpoint: string, options?: RequestInit) {
  const response = await fetch(`https://api.lemonsqueezy.com/v1${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`LemonSqueezy API error: ${response.statusText}`);
  }

  return response.json();
}

export class LemonSqueezyProvider implements PaymentProviderInterface {
  async createCustomer(options: CreateCustomerOptions): Promise<CustomerInfo> {
    const data = await lemonRequest('/customers', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'customers',
          attributes: {
            email: options.email,
            name: options.name,
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: LEMONSQUEEZY_STORE_ID,
              },
            },
          },
        },
      }),
    });

    return {
      id: data.data.id,
      email: data.data.attributes.email,
      name: data.data.attributes.name,
    };
  }

  async getCustomer(customerId: string): Promise<CustomerInfo | null> {
    try {
      const data = await lemonRequest(`/customers/${customerId}`);
      return {
        id: data.data.id,
        email: data.data.attributes.email,
        name: data.data.attributes.name,
      };
    } catch {
      return null;
    }
  }

  async updateCustomer(customerId: string, options: Partial<CreateCustomerOptions>): Promise<CustomerInfo> {
    const data = await lemonRequest(`/customers/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          type: 'customers',
          id: customerId,
          attributes: {
            email: options.email,
            name: options.name,
          },
        },
      }),
    });

    return {
      id: data.data.id,
      email: data.data.attributes.email,
      name: data.data.attributes.name,
    };
  }

  async deleteCustomer(_customerId: string): Promise<void> {
    // LemonSqueezy doesn't support customer deletion via API
    console.warn('LemonSqueezy does not support customer deletion');
  }

  async createCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    const data = await lemonRequest('/checkouts', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: options.customerEmail,
              custom: options.metadata,
            },
            product_options: {
              redirect_url: options.successUrl,
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: LEMONSQUEEZY_STORE_ID,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: options.priceId,
              },
            },
          },
        },
      }),
    });

    return {
      url: data.data.attributes.url,
    };
  }

  async createOneTimeCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    return this.createCheckout(options);
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionInfo | null> {
    try {
      const data = await lemonRequest(`/subscriptions/${subscriptionId}`);
      const attrs = data.data.attributes;

      return {
        id: data.data.id,
        customerId: attrs.customer_id.toString(),
        priceId: attrs.variant_id.toString(),
        status: attrs.status === 'active' ? 'active' : attrs.status === 'cancelled' ? 'canceled' : 'incomplete',
        currentPeriodStart: new Date(attrs.created_at),
        currentPeriodEnd: new Date(attrs.renews_at),
        cancelAtPeriodEnd: attrs.cancelled,
      };
    } catch {
      return null;
    }
  }

  async getCustomerSubscriptions(customerId: string): Promise<SubscriptionInfo[]> {
    const data = await lemonRequest(`/subscriptions?filter[customer_id]=${customerId}`);

    return data.data.map((sub: Record<string, unknown>) => {
      const attrs = sub.attributes as Record<string, unknown>;
      return {
        id: sub.id as string,
        customerId: (attrs.customer_id as number).toString(),
        priceId: (attrs.variant_id as number).toString(),
        status: attrs.status === 'active' ? 'active' : attrs.status === 'cancelled' ? 'canceled' : 'incomplete',
        currentPeriodStart: new Date(attrs.created_at as string),
        currentPeriodEnd: new Date(attrs.renews_at as string),
        cancelAtPeriodEnd: attrs.cancelled as boolean,
      } as SubscriptionInfo;
    });
  }

  async updateSubscription(options: UpdateSubscriptionOptions): Promise<SubscriptionInfo> {
    const data = await lemonRequest(`/subscriptions/${options.subscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          type: 'subscriptions',
          id: options.subscriptionId,
          attributes: {
            variant_id: options.priceId ? parseInt(options.priceId) : undefined,
            cancelled: options.cancelAtPeriodEnd,
          },
        },
      }),
    });

    const attrs = data.data.attributes;
    return {
      id: data.data.id,
      customerId: attrs.customer_id.toString(),
      priceId: attrs.variant_id.toString(),
      status: attrs.status === 'active' ? 'active' : 'canceled',
      currentPeriodStart: new Date(attrs.created_at),
      currentPeriodEnd: new Date(attrs.renews_at),
      cancelAtPeriodEnd: attrs.cancelled,
    };
  }

  async cancelSubscription(subscriptionId: string, _immediate = false): Promise<SubscriptionInfo> {
    const data = await lemonRequest(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    });

    const attrs = data.data.attributes;
    return {
      id: data.data.id,
      customerId: attrs.customer_id.toString(),
      priceId: attrs.variant_id.toString(),
      status: 'canceled',
      currentPeriodStart: new Date(attrs.created_at),
      currentPeriodEnd: new Date(attrs.ends_at || attrs.renews_at),
      cancelAtPeriodEnd: true,
    };
  }

  async createPortalSession(options: PortalOptions): Promise<PortalResult> {
    // LemonSqueezy uses customer portal URLs directly
    const customer = await this.getCustomer(options.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // The portal URL is constructed from the customer email
    return {
      url: `https://app.lemonsqueezy.com/my-orders?email=${encodeURIComponent(customer.email)}`,
    };
  }

  async constructWebhookEvent(payload: string | Buffer, signature: string): Promise<WebhookEvent> {
    // Verify webhook signature using HMAC
    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET!);
    const digest = hmac.update(payload).digest('hex');

    if (digest !== signature) {
      throw new Error('Invalid webhook signature');
    }

    const event = JSON.parse(payload.toString());

    return {
      id: event.meta.event_id,
      type: event.meta.event_name,
      data: event.data,
      provider: 'lemonsqueezy',
      rawEvent: event,
    };
  }

  async getPrice(priceId: string): Promise<PriceInfo | null> {
    try {
      const data = await lemonRequest(`/variants/${priceId}`);
      const attrs = data.data.attributes;

      return {
        id: data.data.id,
        productId: attrs.product_id.toString(),
        name: attrs.name,
        description: attrs.description,
        amount: attrs.price,
        currency: 'USD',
        interval: attrs.is_subscription ? (attrs.interval === 'month' ? 'month' : 'year') : 'one_time',
      };
    } catch {
      return null;
    }
  }

  async listPrices(productId?: string): Promise<PriceInfo[]> {
    const endpoint = productId
      ? `/variants?filter[product_id]=${productId}`
      : '/variants';

    const data = await lemonRequest(endpoint);

    return data.data.map((variant: Record<string, unknown>) => {
      const attrs = variant.attributes as Record<string, unknown>;
      return {
        id: variant.id as string,
        productId: (attrs.product_id as number).toString(),
        name: attrs.name as string,
        description: attrs.description as string,
        amount: attrs.price as number,
        currency: 'USD',
        interval: attrs.is_subscription
          ? (attrs.interval === 'month' ? 'month' : 'year')
          : 'one_time',
      } as PriceInfo;
    });
  }
}
