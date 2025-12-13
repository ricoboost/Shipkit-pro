/**
 * Payment Provider Abstraction Layer
 *
 * Provides a provider-agnostic payment API that works with Stripe,
 * LemonSqueezy, or Polar. Switch providers via the PAYMENT_PROVIDER
 * environment variable without changing application code.
 *
 * @example
 * ```typescript
 * import { payments } from '@/lib/payments';
 *
 * // Create a checkout session
 * const { url } = await payments.createCheckout({
 *   priceId: 'price_xxx',
 *   userId: 'user-123',
 *   successUrl: '/dashboard?success=true',
 *   cancelUrl: '/pricing',
 * });
 *
 * // Get customer subscriptions
 * const subscriptions = await payments.getCustomerSubscriptions(customerId);
 *
 * // Create customer portal session
 * const { url } = await payments.createPortalSession({
 *   customerId,
 *   returnUrl: '/settings/billing',
 * });
 * ```
 *
 * @module lib/payments
 */

import type {
  PaymentProvider,
  PaymentProviderInterface,
  CheckoutOptions,
  CheckoutResult,
  PortalOptions,
  PortalResult,
  CustomerInfo,
  CreateCustomerOptions,
  SubscriptionInfo,
  UpdateSubscriptionOptions,
  WebhookEvent,
  PriceInfo,
} from './types';

/** Current payment provider from environment @internal */
const PAYMENT_PROVIDER = (process.env.PAYMENT_PROVIDER || 'stripe') as PaymentProvider;

/** Cached provider instance @internal */
let providerInstance: PaymentProviderInterface | null = null;

/** Track if provider warning has been shown */
let providerWarningShown = false;

/**
 * Gets the configured payment provider instance.
 *
 * The provider is determined by the PAYMENT_PROVIDER environment variable:
 * - `stripe` (default): Uses Stripe - fully tested and production-ready
 * - `lemonsqueezy`: Uses LemonSqueezy - BETA: less tested, use with caution
 * - `polar`: Uses Polar - BETA: less tested, use with caution
 *
 * @returns The configured payment provider instance
 * @throws Error if PAYMENT_PROVIDER is set to an invalid value
 * @internal
 */
async function getPaymentProvider(): Promise<PaymentProviderInterface> {
  if (providerInstance) return providerInstance;

  switch (PAYMENT_PROVIDER) {
    case 'stripe': {
      const { StripeProvider } = await import('./stripe');
      providerInstance = new StripeProvider();
      break;
    }
    case 'lemonsqueezy': {
      // SECURITY WARNING: LemonSqueezy provider is less tested
      if (!providerWarningShown) {
        console.warn(
          '\n⚠️  WARNING: LemonSqueezy payment provider is in BETA status.\n' +
          '   This provider has received less testing than Stripe.\n' +
          '   Please thoroughly test all payment flows before production use.\n' +
          '   Report issues at: https://github.com/your-repo/issues\n'
        );
        providerWarningShown = true;
      }
      const { LemonSqueezyProvider } = await import('./lemonsqueezy');
      providerInstance = new LemonSqueezyProvider();
      break;
    }
    case 'polar': {
      // SECURITY WARNING: Polar provider is less tested
      if (!providerWarningShown) {
        console.warn(
          '\n⚠️  WARNING: Polar payment provider is in BETA status.\n' +
          '   This provider has received less testing than Stripe.\n' +
          '   Please thoroughly test all payment flows before production use.\n' +
          '   Report issues at: https://github.com/your-repo/issues\n'
        );
        providerWarningShown = true;
      }
      const { PolarProvider } = await import('./polar');
      providerInstance = new PolarProvider();
      break;
    }
    default:
      throw new Error(`Unknown payment provider: ${PAYMENT_PROVIDER}`);
  }

  return providerInstance;
}

/**
 * Unified payment API object.
 *
 * Provides methods for managing customers, subscriptions, checkouts,
 * and billing portals across different payment providers.
 */
export const payments = {
  /** Returns the currently configured payment provider name */
  getProvider: (): PaymentProvider => PAYMENT_PROVIDER,

  // ==================== Customer Management ====================

  /**
   * Creates a new customer in the payment provider.
   *
   * @param options - Customer creation options (email, name, metadata)
   * @returns The created customer information
   */
  createCustomer: async (options: CreateCustomerOptions): Promise<CustomerInfo> => {
    const provider = await getPaymentProvider();
    return provider.createCustomer(options);
  },

  /**
   * Retrieves a customer by their provider customer ID.
   *
   * @param customerId - The payment provider's customer ID
   * @returns Customer info or null if not found
   */
  getCustomer: async (customerId: string): Promise<CustomerInfo | null> => {
    const provider = await getPaymentProvider();
    return provider.getCustomer(customerId);
  },

  /**
   * Updates a customer's information.
   *
   * @param customerId - The customer ID to update
   * @param options - Fields to update
   * @returns Updated customer information
   */
  updateCustomer: async (customerId: string, options: Partial<CreateCustomerOptions>): Promise<CustomerInfo> => {
    const provider = await getPaymentProvider();
    return provider.updateCustomer(customerId, options);
  },

  /**
   * Deletes a customer from the payment provider.
   *
   * @param customerId - The customer ID to delete
   */
  deleteCustomer: async (customerId: string): Promise<void> => {
    const provider = await getPaymentProvider();
    return provider.deleteCustomer(customerId);
  },

  // ==================== Checkout ====================

  /**
   * Creates a subscription checkout session.
   *
   * @param options - Checkout options including priceId and URLs
   * @returns Object containing the checkout URL
   *
   * @example
   * ```typescript
   * const { url } = await payments.createCheckout({
   *   priceId: 'price_xxx',
   *   userId: session.user.id,
   *   successUrl: '/dashboard?checkout=success',
   *   cancelUrl: '/pricing',
   * });
   * redirect(url);
   * ```
   */
  createCheckout: async (options: CheckoutOptions): Promise<CheckoutResult> => {
    const provider = await getPaymentProvider();
    return provider.createCheckout(options);
  },

  /**
   * Creates a one-time payment checkout session.
   *
   * @param options - Checkout options for one-time payment
   * @returns Object containing the checkout URL
   */
  createOneTimeCheckout: async (options: CheckoutOptions): Promise<CheckoutResult> => {
    const provider = await getPaymentProvider();
    return provider.createOneTimeCheckout(options);
  },

  // ==================== Subscriptions ====================

  /**
   * Retrieves a subscription by ID.
   *
   * @param subscriptionId - The subscription ID
   * @returns Subscription info or null if not found
   */
  getSubscription: async (subscriptionId: string): Promise<SubscriptionInfo | null> => {
    const provider = await getPaymentProvider();
    return provider.getSubscription(subscriptionId);
  },

  /**
   * Gets all subscriptions for a customer.
   *
   * @param customerId - The customer ID
   * @returns Array of subscription information
   */
  getCustomerSubscriptions: async (customerId: string): Promise<SubscriptionInfo[]> => {
    const provider = await getPaymentProvider();
    return provider.getCustomerSubscriptions(customerId);
  },

  /**
   * Updates a subscription (e.g., change plan).
   *
   * @param options - Update options including subscriptionId and new priceId
   * @returns Updated subscription information
   */
  updateSubscription: async (options: UpdateSubscriptionOptions): Promise<SubscriptionInfo> => {
    const provider = await getPaymentProvider();
    return provider.updateSubscription(options);
  },

  /**
   * Cancels a subscription.
   *
   * @param subscriptionId - The subscription to cancel
   * @param immediate - If true, cancels immediately; otherwise at period end
   * @returns Updated subscription information
   */
  cancelSubscription: async (subscriptionId: string, immediate?: boolean): Promise<SubscriptionInfo> => {
    const provider = await getPaymentProvider();
    return provider.cancelSubscription(subscriptionId, immediate);
  },

  // ==================== Billing Portal ====================

  /**
   * Creates a billing portal session for customer self-service.
   *
   * @param options - Portal options including customerId and returnUrl
   * @returns Object containing the portal URL
   *
   * @example
   * ```typescript
   * const { url } = await payments.createPortalSession({
   *   customerId: user.customerId,
   *   returnUrl: '/settings/billing',
   * });
   * redirect(url);
   * ```
   */
  createPortalSession: async (options: PortalOptions): Promise<PortalResult> => {
    const provider = await getPaymentProvider();
    return provider.createPortalSession(options);
  },

  // ==================== Webhooks ====================

  /**
   * Constructs and verifies a webhook event from the payment provider.
   *
   * @param payload - The raw webhook payload
   * @param signature - The webhook signature header
   * @returns Parsed and verified webhook event
   * @throws Error if signature verification fails
   */
  constructWebhookEvent: async (payload: string | Buffer, signature: string): Promise<WebhookEvent> => {
    const provider = await getPaymentProvider();
    return provider.constructWebhookEvent(payload, signature);
  },

  // ==================== Prices ====================

  /**
   * Retrieves a price by ID.
   *
   * @param priceId - The price ID
   * @returns Price info or null if not found
   */
  getPrice: async (priceId: string): Promise<PriceInfo | null> => {
    const provider = await getPaymentProvider();
    return provider.getPrice(priceId);
  },

  /**
   * Lists all prices, optionally filtered by product.
   *
   * @param productId - Optional product ID to filter by
   * @returns Array of price information
   */
  listPrices: async (productId?: string): Promise<PriceInfo[]> => {
    const provider = await getPaymentProvider();
    return provider.listPrices(productId);
  },
};

export * from './types';
export { credits } from './credits';
export { subscriptions } from './subscriptions';
