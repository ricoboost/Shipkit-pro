/**
 * Payment Provider Types
 * Unified interface for Stripe, LemonSqueezy, and Polar
 */

export type PaymentProvider = 'stripe' | 'lemonsqueezy' | 'polar';

export interface PriceInfo {
  id: string;
  productId: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval?: 'month' | 'year' | 'one_time';
  metadata?: Record<string, string>;
}

export interface SubscriptionInfo {
  id: string;
  customerId: string;
  priceId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  metadata?: Record<string, string>;
}

export interface CustomerInfo {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutOptions {
  priceId: string;
  customerId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  allowPromotionCodes?: boolean;
  trialDays?: number;
}

export interface CheckoutResult {
  url: string;
  sessionId?: string;
}

export interface PortalOptions {
  customerId: string;
  returnUrl: string;
}

export interface PortalResult {
  url: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  provider: PaymentProvider;
  rawEvent: unknown;
}

export interface CreateCustomerOptions {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface UpdateSubscriptionOptions {
  subscriptionId: string;
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, string>;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  popular?: boolean;
}

export interface PaymentProviderInterface {
  // Customer management
  createCustomer(options: CreateCustomerOptions): Promise<CustomerInfo>;
  getCustomer(customerId: string): Promise<CustomerInfo | null>;
  updateCustomer(customerId: string, options: Partial<CreateCustomerOptions>): Promise<CustomerInfo>;
  deleteCustomer(customerId: string): Promise<void>;

  // Subscription management
  createCheckout(options: CheckoutOptions): Promise<CheckoutResult>;
  getSubscription(subscriptionId: string): Promise<SubscriptionInfo | null>;
  getCustomerSubscriptions(customerId: string): Promise<SubscriptionInfo[]>;
  updateSubscription(options: UpdateSubscriptionOptions): Promise<SubscriptionInfo>;
  cancelSubscription(subscriptionId: string, immediate?: boolean): Promise<SubscriptionInfo>;

  // Customer portal
  createPortalSession(options: PortalOptions): Promise<PortalResult>;

  // One-time payments (for credit packages)
  createOneTimeCheckout(options: CheckoutOptions): Promise<CheckoutResult>;

  // Webhook handling
  constructWebhookEvent(payload: string | Buffer, signature: string): Promise<WebhookEvent>;

  // Price management
  getPrice(priceId: string): Promise<PriceInfo | null>;
  listPrices(productId?: string): Promise<PriceInfo[]>;
}

// Credit system types
export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'expiry';
  amount: number; // positive for credits added, negative for credits used
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface CreditBalance {
  userId: string;
  balance: number;
  lastUpdated: Date;
}

export interface CreditUsageOptions {
  userId: string;
  amount: number;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface CreditPurchaseOptions {
  userId: string;
  packageId: string;
  amount: number;
  transactionId?: string;
}
