# ShipKit - AI Agent Context

> Universal context file for AI coding assistants (Cursor, Windsurf, Claude Code, GitHub Copilot)

## Project Identity

ShipKit is an AI-native SaaS boilerplate designed for vibecoding. It features:
- **Multi-provider architecture**: Switch auth, payments, or AI with one env var
- **Self-documenting codebase**: Auto-generated docs stay in sync
- **Visual customization**: Theme builder with live preview
- **Production-ready**: Security, organizations, credits system included

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js | 16.x |
| Bundler | Turbopack | Built-in |
| Language | TypeScript | 5.x (strict) |
| UI Library | React | 19.x |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui | latest |
| ORM | Prisma | 5.x |
| Auth | NextAuth / Supabase / Better Auth | See provider |
| Payments | Stripe / LemonSqueezy / Polar | See provider |
| AI | OpenRouter / Vercel AI SDK | See provider |
| State | Zustand | 4.x |
| Forms | React Hook Form + Zod | latest |
| Email | Resend | 3.x |
| i18n | next-intl | 4.x |

## Critical Paths

### Provider Abstraction Pattern
All external services use a unified abstraction layer. Switch providers via environment variables.

```
AUTH_PROVIDER=nextauth|supabase|betterauth
PAYMENT_PROVIDER=stripe|lemonsqueezy|polar
AI_PROVIDER=openrouter|vercel
STORAGE_PROVIDER=r2|s3|supabase
```

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register, etc.)
│   ├── (dashboard)/       # Protected user pages
│   ├── (marketing)/       # Public marketing pages
│   ├── (admin)/           # Admin-only pages
│   ├── (docs)/            # Documentation site
│   └── api/               # API routes
│
├── lib/                   # Core abstractions
│   ├── auth/              # Auth provider abstraction
│   │   ├── index.ts       # Unified auth API
│   │   ├── types.ts       # Auth types
│   │   ├── nextauth.ts    # NextAuth implementation
│   │   ├── supabase.ts    # Supabase implementation
│   │   └── betterauth.ts  # Better Auth implementation
│   │
│   ├── payments/          # Payment provider abstraction
│   │   ├── index.ts       # Unified payments API
│   │   ├── types.ts       # Payment types
│   │   ├── stripe.ts      # Stripe implementation
│   │   ├── lemonsqueezy.ts
│   │   └── polar.ts
│   │
│   ├── ai/                # AI provider abstraction
│   │   ├── index.ts       # Unified AI API
│   │   ├── types.ts       # AI types
│   │   ├── openrouter.ts  # OpenRouter implementation
│   │   └── vercel-ai.ts   # Vercel AI SDK implementation
│   │
│   ├── theme/             # Theme system
│   ├── docs/              # Auto-documentation
│   └── db.ts              # Prisma client
│
├── components/            # React components
│   ├── ui/                # shadcn/ui primitives
│   ├── layout/            # Layout components
│   ├── auth/              # Auth forms
│   ├── billing/           # Billing components
│   ├── ai/                # AI demo components
│   └── admin/             # Admin components
│
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
├── types/                 # TypeScript types
└── config/                # App configuration
```

## Code Standards

### TypeScript
- Use strict mode (noImplicitAny, strictNullChecks)
- Prefer interfaces over types for objects
- Use const assertions for literals
- All functions must have explicit return types

### React
- Use function components only
- Prefer server components by default
- Add 'use client' only when necessary
- Use React.FC sparingly (prefer explicit props)

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`
- Utils: `kebab-case.ts`
- Types: `kebab-case.ts`
- API routes: `route.ts`

### Import Order
1. React/Next.js imports
2. Third-party imports
3. Internal absolute imports (@/...)
4. Relative imports
5. Type imports

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

// 3. Component
export function Component({ title, onAction }: ComponentProps): JSX.Element {
  // 4. Hooks
  const [state, setState] = useState(false);

  // 5. Handlers
  const handleClick = () => {
    setState(true);
    onAction?.();
  };

  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Action</Button>
    </div>
  );
}
```

## Common Tasks

### Adding a new API route
1. Create `src/app/api/[endpoint]/route.ts`
2. Export async function for HTTP method (GET, POST, etc.)
3. Use Zod for request validation
4. Return `Response.json()` for responses

### Adding a new page
1. Create `src/app/(group)/path/page.tsx`
2. Export default async function component
3. Use layout.tsx for shared layouts

### Using the auth abstraction
```typescript
import { auth } from '@/lib/auth';

// Get current session
const session = await auth.getSession();

// Sign in
await auth.signIn({ email, password });

// Sign out
await auth.signOut();
```

### Using the payment abstraction
```typescript
import { payments } from '@/lib/payments';

// Create checkout
const { url } = await payments.createCheckout({ priceId, userId });

// Get subscription
const subscription = await payments.getSubscription(userId);
```

### Using the AI abstraction
```typescript
import { ai } from '@/lib/ai';

// Chat completion
const response = await ai.chat({
  model: 'gpt-4-turbo',
  messages: [{ role: 'user', content: 'Hello' }],
});

// Streaming chat
for await (const chunk of ai.chatStream(options)) {
  console.log(chunk);
}

// Image generation
const images = await ai.generateImage({ prompt: 'A sunset' });
```

## Environment Variables

Required variables by provider:

### Auth
- `AUTH_PROVIDER`: nextauth | supabase | betterauth
- NextAuth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, etc.

### Payments
- `PAYMENT_PROVIDER`: stripe | lemonsqueezy | polar
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- LemonSqueezy: `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`

### AI
- `AI_PROVIDER`: openrouter | vercel
- OpenRouter: `OPENROUTER_API_KEY`
- Vercel AI: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`

### Database
- `DATABASE_URL`: PostgreSQL connection string

## Avoid

- DO NOT use inline styles (use Tailwind classes)
- DO NOT use `any` type (use `unknown` and narrow)
- DO NOT mutate state directly (use immutable patterns)
- DO NOT use default exports for components (use named exports)
- DO NOT hardcode secrets (use environment variables)
- DO NOT skip error handling (wrap async code in try/catch)
- DO NOT create new files for one-time utilities (add to existing utils)
- DO NOT add comments for obvious code (code should be self-documenting)

## Database Schema

Key models:
- `User`: Authentication and profile
- `Organization`: Multi-tenancy
- `OrganizationMember`: Team membership
- `Subscription`: Payment subscriptions
- `CreditBalance` + `CreditLedger`: Usage-based billing
- `ApiKey`: User API keys
- `AIUsage`: AI usage tracking
- `BlogPost`, `NewsletterSubscriber`: Content
- `Referral`: Affiliate system
- `AuditLog`: Security audit trail

See `prisma/schema.prisma` for complete schema.

## Testing

- Unit tests: Vitest
- E2E tests: Playwright
- Run tests: `npm test`
- Run E2E: `npm run test:e2e`

## Deployment

- Primary: Vercel (recommended)
- Alternative: Docker Compose
- Database: Supabase / Neon / Railway

---

*This file is the single source of truth for AI assistants. Keep it updated when making architectural changes.*
