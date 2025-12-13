/**
 * Unit Test Examples
 *
 * Demonstrates how to write unit tests for utility functions,
 * pure functions, and modules in the ShipKit codebase.
 *
 * Run tests with: npm run test
 * Run with watch: npm run test:watch
 * Run with coverage: npm run test:coverage
 *
 * @module test/examples/unit
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==================== Testing Pure Functions ====================

/**
 * Example: Testing the paginate function from @/lib/db
 *
 * Pure functions are the easiest to test - no mocks needed.
 */
describe('paginate', () => {
  // Import the real function
  const paginate = (page: number = 1, perPage: number = 20) => {
    const take = Math.min(perPage, 100);
    const skip = (Math.max(page, 1) - 1) * take;
    return { take, skip };
  };

  it('should return correct pagination for page 1', () => {
    const result = paginate(1, 20);

    expect(result).toEqual({ take: 20, skip: 0 });
  });

  it('should return correct pagination for page 2', () => {
    const result = paginate(2, 20);

    expect(result).toEqual({ take: 20, skip: 20 });
  });

  it('should cap perPage at 100', () => {
    const result = paginate(1, 200);

    expect(result.take).toBe(100);
  });

  it('should handle negative page numbers', () => {
    const result = paginate(-5, 20);

    expect(result.skip).toBe(0);
  });

  it('should use default values', () => {
    const result = paginate();

    expect(result).toEqual({ take: 20, skip: 0 });
  });
});

// ==================== Testing with Mocks ====================

/**
 * Example: Testing a function that depends on external services
 */
describe('checkUserCredits', () => {
  // Mock the credits module
  const mockGetBalance = vi.fn();
  const credits = {
    getBalance: mockGetBalance,
  };

  // Function under test
  async function checkUserCredits(userId: string, required: number) {
    const balance = await credits.getBalance(userId);
    return {
      hasEnough: balance >= required,
      balance,
      shortage: Math.max(0, required - balance),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return hasEnough true when balance is sufficient', async () => {
    mockGetBalance.mockResolvedValue(100);

    const result = await checkUserCredits('user-123', 50);

    expect(result.hasEnough).toBe(true);
    expect(result.balance).toBe(100);
    expect(result.shortage).toBe(0);
  });

  it('should return hasEnough false when balance is insufficient', async () => {
    mockGetBalance.mockResolvedValue(30);

    const result = await checkUserCredits('user-123', 50);

    expect(result.hasEnough).toBe(false);
    expect(result.shortage).toBe(20);
  });

  it('should call getBalance with correct userId', async () => {
    mockGetBalance.mockResolvedValue(100);

    await checkUserCredits('user-456', 50);

    expect(mockGetBalance).toHaveBeenCalledWith('user-456');
    expect(mockGetBalance).toHaveBeenCalledTimes(1);
  });
});

// ==================== Testing Error Handling ====================

/**
 * Example: Testing error scenarios
 */
describe('Error Handling', () => {
  // Function that throws on invalid input
  function validateEmail(email: string): boolean {
    if (!email) {
      throw new Error('Email is required');
    }
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    return true;
  }

  it('should validate correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should throw on empty email', () => {
    expect(() => validateEmail('')).toThrow('Email is required');
  });

  it('should throw on invalid format', () => {
    expect(() => validateEmail('invalid-email')).toThrow('Invalid email format');
  });
});

// ==================== Testing Async Functions ====================

/**
 * Example: Testing async/await functions
 */
describe('Async Functions', () => {
  // Simulated async function
  async function fetchUserData(userId: string) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (!userId) {
      throw new Error('User ID required');
    }

    return {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    };
  }

  it('should resolve with user data', async () => {
    const result = await fetchUserData('user-123');

    expect(result).toEqual({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    });
  });

  it('should reject when no userId provided', async () => {
    await expect(fetchUserData('')).rejects.toThrow('User ID required');
  });
});

// ==================== Testing Date/Time Functions ====================

/**
 * Example: Testing functions that use dates
 */
describe('Date Functions', () => {
  // Function to test subscription expiry
  function isSubscriptionActive(endDate: Date): boolean {
    return endDate > new Date();
  }

  function daysUntilExpiry(endDate: Date): number {
    const diff = endDate.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  it('should detect active subscription', () => {
    const futureDate = new Date(Date.now() + 86400000); // Tomorrow
    expect(isSubscriptionActive(futureDate)).toBe(true);
  });

  it('should detect expired subscription', () => {
    const pastDate = new Date(Date.now() - 86400000); // Yesterday
    expect(isSubscriptionActive(pastDate)).toBe(false);
  });

  it('should calculate days until expiry', () => {
    const in7Days = new Date(Date.now() + 7 * 86400000);
    const days = daysUntilExpiry(in7Days);

    expect(days).toBe(7);
  });
});

// ==================== Testing Type Guards ====================

/**
 * Example: Testing TypeScript type guards
 */
describe('Type Guards', () => {
  // Type guard function
  interface ApiError {
    success: false;
    error: { message: string; code?: string };
  }

  interface ApiSuccess<T> {
    success: true;
    data: T;
  }

  type ApiResponse<T> = ApiSuccess<T> | ApiError;

  function isApiError<T>(response: ApiResponse<T>): response is ApiError {
    return response.success === false;
  }

  it('should identify error response', () => {
    const errorResponse: ApiError = {
      success: false,
      error: { message: 'Not found', code: 'NOT_FOUND' },
    };

    expect(isApiError(errorResponse)).toBe(true);
  });

  it('should identify success response', () => {
    const successResponse: ApiSuccess<string> = {
      success: true,
      data: 'Hello',
    };

    expect(isApiError(successResponse)).toBe(false);
  });
});

// ==================== Testing with Spies ====================

/**
 * Example: Using spies to track function calls
 */
describe('Function Spies', () => {
  it('should track function calls', () => {
    const callback = vi.fn();

    // Call the function multiple times
    callback('first');
    callback('second');
    callback('third');

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(1, 'first');
    expect(callback).toHaveBeenNthCalledWith(2, 'second');
    expect(callback).toHaveBeenNthCalledWith(3, 'third');
  });

  it('should mock return values', () => {
    const mockFn = vi.fn()
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValue(3);

    expect(mockFn()).toBe(1);
    expect(mockFn()).toBe(2);
    expect(mockFn()).toBe(3);
    expect(mockFn()).toBe(3); // Continues returning 3
  });
});

// ==================== Snapshot Testing ====================

/**
 * Example: Snapshot testing for stable outputs
 */
describe('Snapshot Tests', () => {
  function generateUserSummary(user: { name: string; email: string; role: string }) {
    return {
      displayName: user.name,
      contact: user.email,
      permissions: user.role === 'ADMIN' ? ['read', 'write', 'delete'] : ['read'],
      formatted: `${user.name} (${user.email})`,
    };
  }

  it('should match snapshot for regular user', () => {
    const result = generateUserSummary({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    });

    expect(result).toMatchSnapshot();
  });

  it('should match snapshot for admin user', () => {
    const result = generateUserSummary({
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    expect(result).toMatchSnapshot();
  });
});
