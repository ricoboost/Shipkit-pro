# Add Test

Generate a test file for an existing file or component.

## Arguments
- `$ARGUMENTS` - Path to the file to test (e.g., "src/lib/utils.ts" or "src/components/UserCard.tsx")

## Instructions

Create a test file adjacent to the source file with `.test.ts` or `.test.tsx` extension.

## Test Templates

### Unit Test (for utility functions)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Import the function/module to test
import { functionName } from './FILE_NAME';

describe('functionName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle normal input', () => {
    const result = functionName('input');
    expect(result).toBe('expected');
  });

  it('should handle edge case', () => {
    const result = functionName('');
    expect(result).toBe('default');
  });

  it('should throw on invalid input', () => {
    expect(() => functionName(null)).toThrow('Error message');
  });
});
```

### Component Test (for React components)

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './FILE_NAME';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName title="Test" />);

    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ComponentName title="Test" onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    render(<ComponentName title="Test" loading />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

### API Route Test

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: {
    getSession: vi.fn(),
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    model: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('API Route: /api/ROUTE_NAME', () => {
  const { auth } = vi.mocked(await import('@/lib/auth'));
  const { db } = vi.mocked(await import('@/lib/db'));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 when not authenticated', async () => {
      auth.getSession.mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/route');
      const res = await GET(req);

      expect(res.status).toBe(401);
    });

    it('should return data when authenticated', async () => {
      auth.getSession.mockResolvedValue({
        user: { id: 'user-123' },
        expires: new Date().toISOString(),
      });
      db.model.findMany.mockResolvedValue([{ id: '1', name: 'Test' }]);

      const req = new NextRequest('http://localhost/api/route');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
```

## Test File Location

Place test files adjacent to source files:
- `src/lib/utils.ts` -> `src/lib/utils.test.ts`
- `src/components/UserCard.tsx` -> `src/components/UserCard.test.tsx`
- `src/app/api/users/route.ts` -> `src/app/api/users/route.test.ts`

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test src/lib/utils.test.ts

# Run with coverage
npm run test:coverage
```

## Common Matchers

```typescript
// Equality
expect(value).toBe(expected);         // Strict equality (===)
expect(value).toEqual(expected);      // Deep equality
expect(value).not.toBe(unexpected);   // Negation

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3, 5);    // Floating point

// Strings
expect(value).toMatch(/pattern/);
expect(value).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty('key');
expect(object).toMatchObject({ key: 'value' });

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('message');

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();

// DOM (React Testing Library)
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveTextContent('text');
```

## Checklist
- [ ] Create test file with same name + .test extension
- [ ] Import the file under test
- [ ] Mock external dependencies (db, auth, fetch)
- [ ] Test happy path
- [ ] Test error cases
- [ ] Test edge cases
- [ ] Run tests to verify they pass
