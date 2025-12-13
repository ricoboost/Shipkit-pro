# ShipKit - Coding Patterns Guide

> Comprehensive patterns for AI assistants and developers. Use alongside [CLAUDE.md](./CLAUDE.md) (i18n) and [AGENTS.md](./AGENTS.md) (architecture).

## Table of Contents

1. [Database / Prisma Patterns](#database--prisma-patterns)
2. [API Route Patterns](#api-route-patterns)
3. [Component Patterns](#component-patterns)
4. [Error Handling Patterns](#error-handling-patterns)
5. [State Management Patterns](#state-management-patterns)
6. [Security Patterns](#security-patterns)
7. [Testing Patterns](#testing-patterns)

---

## Database / Prisma Patterns

### Basic CRUD Operations

```typescript
import { db } from '@/lib/db';

// CREATE - Single record
const user = await db.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    role: 'USER',
  },
});

// READ - Find by unique field
const user = await db.user.findUnique({
  where: { id: userId },
});

// READ - Find first matching
const admin = await db.user.findFirst({
  where: { role: 'ADMIN' },
});

// READ - Find many with filtering
const users = await db.user.findMany({
  where: {
    status: 'ACTIVE',
    createdAt: { gte: new Date('2024-01-01') },
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0,
});

// UPDATE - Single record
const updated = await db.user.update({
  where: { id: userId },
  data: { name: 'New Name' },
});

// DELETE - Single record
await db.user.delete({
  where: { id: userId },
});
```

### Relations

```typescript
// Include related data (eager loading)
const userWithOrgs = await db.user.findUnique({
  where: { id: userId },
  include: {
    organizations: {
      include: { organization: true },
    },
    subscription: true,
  },
});

// Select specific fields
const userBasic = await db.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
  },
});

// Create with relations
const org = await db.organization.create({
  data: {
    name: 'Acme Corp',
    members: {
      create: {
        userId: ownerId,
        role: 'OWNER',
      },
    },
  },
  include: { members: true },
});
```

### Transactions

```typescript
import { db, withTransaction } from '@/lib/db';

// Simple transaction with utility function
const result = await withTransaction(async (tx) => {
  const user = await tx.user.create({ data: { email, name } });
  const org = await tx.organization.create({
    data: { name: orgName },
  });
  await tx.organizationMember.create({
    data: { userId: user.id, organizationId: org.id, role: 'OWNER' },
  });
  return { user, org };
});

// Manual transaction (for complex scenarios)
const [user, subscription] = await db.$transaction([
  db.user.update({ where: { id: userId }, data: { plan: 'PRO' } }),
  db.subscription.create({ data: { userId, status: 'ACTIVE' } }),
]);
```

### Pagination

```typescript
import { paginate } from '@/lib/db';

// Use the pagination utility
const { take, skip } = paginate(page, perPage);

const users = await db.user.findMany({
  where: { status: 'ACTIVE' },
  take,
  skip,
  orderBy: { createdAt: 'desc' },
});

// Get total count for pagination UI
const total = await db.user.count({ where: { status: 'ACTIVE' } });
const totalPages = Math.ceil(total / perPage);
```

### Aggregations

```typescript
// Count
const userCount = await db.user.count({
  where: { role: 'USER' },
});

// Aggregate (sum, avg, min, max)
const stats = await db.creditLedger.aggregate({
  where: { userId },
  _sum: { amount: true },
  _count: true,
});

// Group by
const usersByRole = await db.user.groupBy({
  by: ['role'],
  _count: true,
});
```

### Error Handling

```typescript
import { Prisma } from '@prisma/client';

try {
  await db.user.create({ data: { email } });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 = Unique constraint violation
    if (error.code === 'P2002') {
      throw new Error('Email already exists');
    }
    // P2025 = Record not found
    if (error.code === 'P2025') {
      throw new Error('User not found');
    }
  }
  throw error;
}
```

---

## API Route Patterns

### Standard API Route Structure

```typescript
// src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// 1. Define validation schema
const createResourceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

// 2. GET - List resources
export async function GET(req: NextRequest) {
  try {
    // Auth check
    const session = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query params
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Fetch data
    const resources = await db.resource.findMany({
      where: { userId: session.user.id },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: resources });
  } catch (error) {
    console.error('GET /api/resource error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 3. POST - Create resource
export async function POST(req: NextRequest) {
  try {
    const session = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate body
    const body = await req.json();
    const parsed = createResourceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Create resource
    const resource = await db.resource.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ data: resource }, { status: 201 });
  } catch (error) {
    console.error('POST /api/resource error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Dynamic Route with Parameters

```typescript
// src/app/api/[resource]/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const resource = await db.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check ownership
    if (resource.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ data: resource });
  } catch (error) {
    console.error('GET /api/resource/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Streaming Response

```typescript
// For AI or long-running operations
export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of someAsyncGenerator()) {
          const data = JSON.stringify(chunk);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        const errorData = JSON.stringify({ error: 'Stream error' });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### HTTP Status Codes Reference

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 402 | Payment Required (insufficient credits) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## Component Patterns

### Server Component (Default)

```typescript
// src/app/[locale]/dashboard/page.tsx
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await auth.getSession();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations('dashboard');

  // Fetch data server-side
  const stats = await db.user.findUnique({
    where: { id: session.user.id },
    select: { creditBalance: true, subscription: true },
  });

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('welcome', { name: session.user.name })}</p>
      {/* Pass data to client components as props */}
      <DashboardStats stats={stats} />
    </div>
  );
}
```

### Client Component

```typescript
// src/components/dashboard/dashboard-stats.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DashboardStatsProps {
  stats: {
    creditBalance: number | null;
    subscription: { plan: string } | null;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const t = useTranslations('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Client-side data fetching
      const res = await fetch('/api/user/stats');
      const data = await res.json();
      // Update state...
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card>
      <p>{t('credits')}: {stats.creditBalance ?? 0}</p>
      <p>{t('plan')}: {stats.subscription?.plan ?? 'Free'}</p>
      <Button onClick={handleRefresh} disabled={isRefreshing}>
        {isRefreshing ? t('refreshing') : t('refresh')}
      </Button>
    </Card>
  );
}
```

### When to Use Client vs Server

| Use Server Component | Use Client Component |
|---------------------|---------------------|
| Fetching data | useState, useEffect |
| Accessing backend directly | Event handlers (onClick) |
| Keeping secrets | Browser APIs |
| Heavy dependencies | Interactivity |
| SEO-critical content | Real-time updates |

### Component Composition Pattern

```typescript
// Parent (Server) fetches data
// src/app/[locale]/settings/page.tsx
export default async function SettingsPage() {
  const user = await db.user.findUnique({ where: { id } });

  return (
    <div>
      <SettingsHeader user={user} />  {/* Server */}
      <SettingsForm user={user} />    {/* Client - has form logic */}
    </div>
  );
}

// Child (Client) handles interaction
// src/components/settings/settings-form.tsx
'use client';

export function SettingsForm({ user }: { user: User }) {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsPending(true);
    await fetch('/api/user', { method: 'PATCH', body: data });
    setIsPending(false);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Error Handling Patterns

### API Route Error Handling

```typescript
export async function POST(req: NextRequest) {
  try {
    // ... main logic
  } catch (error) {
    // Log error with context
    console.error('POST /api/resource error:', {
      error,
      userId: session?.user?.id,
      timestamp: new Date().toISOString(),
    });

    // Handle specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Resource already exists' },
          { status: 409 }
        );
      }
    }

    // Check for custom error types
    if (error instanceof Error) {
      if (error.message.includes('Insufficient credits')) {
        return NextResponse.json({ error: error.message }, { status: 402 });
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
    }

    // Default error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Client-Side Error Handling

```typescript
'use client';

import { toast } from 'sonner';

async function handleSubmit(data: FormData) {
  try {
    const res = await fetch('/api/resource', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const error = await res.json();

      // Handle specific status codes
      if (res.status === 401) {
        toast.error('Please log in to continue');
        return;
      }
      if (res.status === 402) {
        toast.error('Insufficient credits. Please upgrade your plan.');
        return;
      }
      if (res.status === 429) {
        toast.error('Too many requests. Please wait a moment.');
        return;
      }

      // Generic error
      toast.error(error.error || 'Something went wrong');
      return;
    }

    const result = await res.json();
    toast.success('Resource created successfully');
    return result;
  } catch (error) {
    // Network error
    toast.error('Network error. Please check your connection.');
    console.error('Submit error:', error);
  }
}
```

### Error Boundary Pattern

```typescript
// src/app/[locale]/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error tracking service
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground mt-2">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={reset} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
```

---

## State Management Patterns

### When to Use What

| State Type | Use Case | Solution |
|------------|----------|----------|
| Server data | Database records | Server Components + fetch |
| URL state | Filters, pagination | `useSearchParams` |
| Form state | Inputs, validation | React Hook Form |
| UI state | Modals, toggles | `useState` |
| Global UI state | Theme, sidebar | Zustand |
| Complex client state | Shopping cart | Zustand |

### URL State (Recommended for Filters)

```typescript
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function Filters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={searchParams.get('status') || ''}
      onChange={(e) => updateFilter('status', e.target.value)}
    >
      <option value="">All</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  );
}
```

### Zustand Store (Global State)

```typescript
// src/stores/sidebar-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: false,
      isCollapsed: false,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
);

// Usage in component
function Sidebar() {
  const { isCollapsed, setCollapsed } = useSidebarStore();
  // ...
}
```

### React Context (Feature-Scoped)

```typescript
// For state that's specific to a feature tree
// src/components/settings/settings-context.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextValue {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);

  return (
    <SettingsContext.Provider value={{ isDirty, setIsDirty }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
```

---

## Security Patterns

### Input Validation (Zod)

```typescript
import { z } from 'zod';

// User input schema
const userInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase')
    .regex(/[0-9]/, 'Password must contain number'),
});

// ID parameter validation
const idSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
});

// Pagination validation
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
```

### Authorization Checks

```typescript
// Check ownership
async function checkOwnership(resourceId: string, userId: string) {
  const resource = await db.resource.findUnique({
    where: { id: resourceId },
    select: { userId: true },
  });

  if (!resource) {
    throw new Error('Resource not found');
  }

  if (resource.userId !== userId) {
    throw new Error('Forbidden');
  }
}

// Check admin role
async function requireAdmin(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
}

// Check organization membership
async function checkOrgMembership(orgId: string, userId: string) {
  const membership = await db.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId: orgId, userId },
    },
  });

  if (!membership) {
    throw new Error('Not a member of this organization');
  }

  return membership;
}
```

### Rate Limiting

```typescript
// Simple in-memory rate limiter
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimits.get(key);

  if (!record || now > record.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// Usage in API route
export async function POST(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 10 requests per minute
  if (!checkRateLimit(`user:${session.user.id}`, 10, 60000)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // ... rest of handler
}
```

### Sanitization

```typescript
// HTML sanitization for user content
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
  });
}

// Filename sanitization
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}
```

---

## Testing Patterns

### Unit Test (Utility Function)

```typescript
// tests/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, slugify } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('handles negative values', () => {
    expect(formatCurrency(-100, 'USD')).toBe('-$100.00');
  });
});

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world');
  });
});
```

### Component Test

```typescript
// tests/components/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables when loading', () => {
    render(<Button disabled>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### API Route Test

```typescript
// tests/api/user.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH } from '@/app/api/user/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: {
    getSession: vi.fn(),
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

describe('GET /api/user', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth.getSession).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/user');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('returns user data when authenticated', async () => {
    vi.mocked(auth.getSession).mockResolvedValue({
      user: { id: 'user-1' },
    });
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
    });

    const req = new NextRequest('http://localhost/api/user');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.email).toBe('test@example.com');
  });
});
```

### Test Fixtures

```typescript
// tests/fixtures/index.ts
import { User, Organization, Subscription } from '@prisma/client';

export const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  status: 'ACTIVE',
  passwordHash: null,
  emailVerified: new Date(),
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-123',
  email: 'admin@example.com',
  role: 'ADMIN',
};

export const mockOrganization: Organization = {
  id: 'org-123',
  name: 'Test Org',
  slug: 'test-org',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockSubscription: Subscription = {
  id: 'sub-123',
  userId: 'user-123',
  status: 'ACTIVE',
  plan: 'PRO',
  customerId: 'cus-123',
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  cancelAtPeriodEnd: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Helper to create partial mocks
export function createMockUser(overrides?: Partial<User>): User {
  return { ...mockUser, ...overrides };
}
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific file
npm test -- tests/lib/utils.test.ts

# Run in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

---

## Quick Reference

### File Creation Checklist

When creating a new feature, ensure:

- [ ] Types defined (interfaces for props/data)
- [ ] Validation schemas (Zod for API inputs)
- [ ] Error handling (try/catch, user feedback)
- [ ] i18n keys added (all 7 locales)
- [ ] Tests written (at least happy path)
- [ ] Auth checks (if protected route)
- [ ] Loading states (for async operations)

### Common Import Paths

```typescript
// Auth
import { auth } from '@/lib/auth';

// Database
import { db, withTransaction, paginate } from '@/lib/db';

// Payments
import { payments, credits } from '@/lib/payments';

// AI
import { ai } from '@/lib/ai';

// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Utilities
import { cn } from '@/lib/utils';

// Translations
import { useTranslations } from 'next-intl';           // Client
import { getTranslations } from 'next-intl/server';   // Server
```

---

*This guide complements [CLAUDE.md](./CLAUDE.md) (i18n patterns) and [AGENTS.md](./AGENTS.md) (architecture). Keep all three updated together.*
