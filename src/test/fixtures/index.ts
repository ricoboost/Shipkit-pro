/**
 * Test Fixtures
 *
 * Pre-defined mock data for tests. Use these fixtures to ensure
 * consistent test data across the test suite.
 *
 * @example
 * ```typescript
 * import { fixtures } from '@/test/fixtures';
 *
 * test('should display user name', () => {
 *   render(<UserProfile user={fixtures.user} />);
 *   expect(screen.getByText(fixtures.user.name)).toBeInTheDocument();
 * });
 * ```
 *
 * @module test/fixtures
 */

// ==================== User Fixtures ====================

/**
 * Standard test user with all common fields.
 */
export const mockUser = {
  id: 'user_test123',
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/avatar.jpg',
  role: 'USER' as const,
  emailVerified: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Admin user for testing admin-only features.
 */
export const mockAdminUser = {
  ...mockUser,
  id: 'user_admin123',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'ADMIN' as const,
};

/**
 * User without a name (for testing optional fields).
 */
export const mockMinimalUser = {
  id: 'user_minimal123',
  email: 'minimal@example.com',
  name: null,
  image: null,
  role: 'USER' as const,
  emailVerified: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// ==================== Session Fixtures ====================

/**
 * Authenticated session mock.
 */
export const mockSession = {
  user: mockUser,
  expires: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
};

/**
 * Admin session mock.
 */
export const mockAdminSession = {
  user: mockAdminUser,
  expires: new Date(Date.now() + 86400000).toISOString(),
};

// ==================== Organization Fixtures ====================

/**
 * Standard organization for multi-tenant tests.
 */
export const mockOrganization = {
  id: 'org_test123',
  name: 'Test Organization',
  slug: 'test-org',
  logo: 'https://example.com/logo.png',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Organization membership.
 */
export const mockMembership = {
  id: 'member_test123',
  userId: mockUser.id,
  organizationId: mockOrganization.id,
  role: 'OWNER' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// ==================== Subscription Fixtures ====================

/**
 * Active subscription mock.
 */
export const mockSubscription = {
  id: 'sub_test123',
  userId: mockUser.id,
  organizationId: mockOrganization.id,
  plan: 'PRO' as const,
  status: 'ACTIVE' as const,
  customerId: 'cus_test123',
  priceId: 'price_test123',
  currentPeriodStart: new Date('2024-01-01'),
  currentPeriodEnd: new Date('2024-02-01'),
  cancelAtPeriodEnd: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Canceled subscription mock.
 */
export const mockCanceledSubscription = {
  ...mockSubscription,
  id: 'sub_canceled123',
  status: 'CANCELED' as const,
  cancelAtPeriodEnd: true,
};

// ==================== AI Fixtures ====================

/**
 * AI chat messages fixture.
 */
export const mockChatMessages = [
  { role: 'system' as const, content: 'You are a helpful assistant.' },
  { role: 'user' as const, content: 'Hello, how are you?' },
  { role: 'assistant' as const, content: 'I am doing well, thank you!' },
];

/**
 * AI model fixture.
 */
export const mockAIModel = {
  id: 'gpt-4-turbo',
  name: 'GPT-4 Turbo',
  provider: 'OpenAI',
  contextLength: 128000,
  inputCostPer1k: 0.01,
  outputCostPer1k: 0.03,
  creditsPerRequest: 15,
};

/**
 * AI chat response fixture.
 */
export const mockAIChatResponse = {
  id: 'chatcmpl-test123',
  content: 'This is a test response from the AI.',
  model: 'gpt-4-turbo',
  usage: {
    promptTokens: 50,
    completionTokens: 100,
    totalTokens: 150,
  },
  finishReason: 'stop' as const,
};

// ==================== Credit Fixtures ====================

/**
 * Credit balance fixture.
 */
export const mockCreditBalance = {
  id: 'balance_test123',
  userId: mockUser.id,
  organizationId: mockOrganization.id,
  balance: 1000,
  totalEarned: 1500,
  totalSpent: 500,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Credit transaction fixture.
 */
export const mockCreditTransaction = {
  id: 'txn_test123',
  userId: mockUser.id,
  amount: 100,
  type: 'EARN' as const,
  description: 'Purchase credits',
  metadata: { orderId: 'order_123' },
  createdAt: new Date('2024-01-01'),
};

// ==================== API Response Fixtures ====================

/**
 * Success API response fixture.
 */
export const mockSuccessResponse = <T>(data: T) => ({
  success: true as const,
  data,
});

/**
 * Error API response fixture.
 */
export const mockErrorResponse = (message: string, code?: string) => ({
  success: false as const,
  error: { message, code },
});

/**
 * Paginated API response fixture.
 */
export const mockPaginatedResponse = <T>(data: T[], total: number, page = 1, limit = 20) => ({
  success: true as const,
  data,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  },
});

// ==================== Helper Functions ====================

/**
 * Creates a user fixture with custom overrides.
 *
 * @example
 * ```typescript
 * const user = createUser({ name: 'Custom Name' });
 * ```
 */
export function createUser(overrides: Partial<typeof mockUser> = {}) {
  return { ...mockUser, ...overrides };
}

/**
 * Creates an organization fixture with custom overrides.
 */
export function createOrganization(overrides: Partial<typeof mockOrganization> = {}) {
  return { ...mockOrganization, ...overrides };
}

/**
 * Creates a subscription fixture with custom overrides.
 */
export function createSubscription(overrides: Partial<typeof mockSubscription> = {}) {
  return { ...mockSubscription, ...overrides };
}

/**
 * Creates a session fixture with custom user.
 */
export function createSession(user: typeof mockUser = mockUser) {
  return {
    user,
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}

// ==================== Combined Export ====================

/**
 * All fixtures as a single object for easy importing.
 */
export const fixtures = {
  user: mockUser,
  adminUser: mockAdminUser,
  minimalUser: mockMinimalUser,
  session: mockSession,
  adminSession: mockAdminSession,
  organization: mockOrganization,
  membership: mockMembership,
  subscription: mockSubscription,
  canceledSubscription: mockCanceledSubscription,
  chatMessages: mockChatMessages,
  aiModel: mockAIModel,
  aiChatResponse: mockAIChatResponse,
  creditBalance: mockCreditBalance,
  creditTransaction: mockCreditTransaction,
};

export default fixtures;
