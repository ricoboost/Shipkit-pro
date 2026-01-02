<p align="center">
  <img src="public/shipkitlogo.svg" alt="ShipKit Logo" width="80" height="80">
</p>

<h1 align="center">ShipKit Pro</h1>

<p align="center">
  <strong>The AI-Native SaaS Boilerplate for Vibecoding</strong>
</p>

<p align="center">
  Ship production-ready SaaS apps in hours, not weeks.<br>
  Built for developers who build with AI.
</p>

<p align="center">
  <a href="https://shipkit.pro">Website</a> &bull;
  <a href="https://shipkit.pro/docs">Documentation</a> &bull;
  <a href="https://shipkit.pro/demo">Live Demo</a>
</p>

---

## Why ShipKit?

ShipKit is designed from the ground up for **vibecoding** - the practice of building software collaboratively with AI assistants. Every file is documented, every pattern is consistent, and AI agents can understand and modify the codebase with confidence.

- **Multi-Provider Architecture** - Switch auth, payments, or AI providers with a single env var
- **Self-Documenting Codebase** - AI context files (CLAUDE.md, AGENTS.md, PATTERNS.md) stay in sync
- **Visual Customization** - Theme builder with live preview
- **Production-Ready** - Security, organizations, credits system included
- **7 Languages Built-in** - English, Spanish, French, German, Portuguese, Japanese, Chinese

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Language** | TypeScript 5 (strict mode) |
| **UI** | React 19 + Tailwind CSS 4 + shadcn/ui |
| **Database** | Prisma ORM + PostgreSQL |
| **Auth** | NextAuth / Supabase / Better Auth |
| **Payments** | Stripe / LemonSqueezy / Polar |
| **AI** | Vercel AI SDK + OpenAI / Anthropic / Google |
| **State** | Zustand + React Query |
| **Email** | Resend |
| **i18n** | next-intl |
| **Testing** | Vitest + Playwright |
| **Monitoring** | Sentry |

---

## Vibecoding Tools

ShipKit includes a complete suite of AI-powered development tools:

### Claude Code Commands

```
/setup              # Interactive project setup wizard
/setup-env          # Configure environment variables
/setup-db           # Initialize database with Prisma
/setup-auth         # Configure authentication provider
/setup-payments     # Configure payment provider
/setup-ai           # Configure AI provider
/create-admin       # Create an admin user

/scaffold-page      # Generate a new page with i18n
/scaffold-api       # Generate a new API route with validation
/scaffold-component # Generate a new component
/add-test           # Add tests for existing code
```

### Claude Code Skills

| Skill | Description |
|-------|-------------|
| `shipkit-ui` | UI components, styling, and design system patterns |
| `shipkit-api` | API routes, validation, and backend patterns |
| `shipkit-db` | Database queries, migrations, and Prisma patterns |
| `shipkit-auth` | Authentication flows and authorization |
| `shipkit-i18n` | Internationalization and translation management |
| `shipkit-marketing` | Landing pages, blog, and marketing components |

### NPM Scripts

```bash
npm run setup         # Interactive setup wizard
npm run setup:quick   # Quick setup with defaults
npm run setup:stack   # Configure full stack at once

npm run dev           # Start development server
npm run build         # Production build
npm run test          # Run unit tests
npm run test:e2e      # Run E2E tests

npm run generate:page      # Generate page via CLI
npm run generate:api       # Generate API route via CLI
npm run generate:component # Generate component via CLI
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/ricoboost/Shipkit-pro.git my-saas
cd my-saas
npm install
```

### 2. Setup with AI

Open in Claude Code and run:

```
/setup
```

Or use the CLI:

```bash
npm run setup
```

### 3. Start Building

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Provider Support

ShipKit supports multiple providers for each service. Switch providers by changing a single environment variable.

### Authentication

| Provider | Env Value | Features |
|----------|-----------|----------|
| **NextAuth** | `nextauth` | OAuth, Credentials, Magic Link |
| **Supabase** | `supabase` | OAuth, Magic Link, Phone |
| **Better Auth** | `betterauth` | OAuth, Credentials, 2FA |

### Payments

| Provider | Env Value | Features |
|----------|-----------|----------|
| **Stripe** | `stripe` | Subscriptions, One-time, Usage |
| **LemonSqueezy** | `lemonsqueezy` | Subscriptions, License Keys |
| **Polar** | `polar` | Subscriptions, GitHub Sponsors |

### AI

| Provider | Env Value | Models |
|----------|-----------|--------|
| **OpenAI** | `openai` | GPT-4, GPT-4o, o1 |
| **Anthropic** | `anthropic` | Claude 3.5, Claude 4 |
| **Google** | `google` | Gemini Pro, Gemini Flash |

---

## Project Structure

```
shipkit/
├── .claude/
│   ├── commands/        # Claude Code slash commands
│   └── skills/          # Claude Code skills
├── prisma/
│   └── schema.prisma    # Database schema
├── public/              # Static assets
├── scripts/
│   ├── generators/      # Code generators
│   └── setup/           # Setup scripts
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── [locale]/    # Localized pages
│   │   └── api/         # API routes
│   ├── components/      # React components
│   │   ├── ui/          # shadcn/ui primitives
│   │   └── layout/      # Layout components
│   ├── hooks/           # Custom React hooks
│   ├── i18n/            # Internationalization
│   │   └── messages/    # Translation files
│   ├── lib/             # Core libraries
│   │   ├── auth/        # Auth abstraction
│   │   ├── payments/    # Payments abstraction
│   │   └── ai/          # AI abstraction
│   ├── stores/          # Zustand stores
│   └── types/           # TypeScript types
├── tests/               # Test files
├── AGENTS.md            # AI agent context
├── CLAUDE.md            # Claude-specific context
└── PATTERNS.md          # Coding patterns guide
```

---

## Features

### Core

- **Authentication** - OAuth, credentials, magic link, 2FA
- **Authorization** - Role-based access control (User, Admin)
- **Organizations** - Multi-tenancy with teams
- **Subscriptions** - Recurring billing with multiple tiers
- **Credits System** - Usage-based billing
- **API Keys** - User-managed API access

### AI

- **Chat Completions** - Streaming and non-streaming
- **Image Generation** - DALL-E, Stable Diffusion
- **Usage Tracking** - Per-user AI usage metrics
- **Model Selection** - User-configurable models

### Marketing

- **Landing Page** - Conversion-optimized hero, features, pricing
- **Blog** - MDX-powered with syntax highlighting
- **Documentation** - Fumadocs integration
- **Newsletter** - Email capture and management

### Developer Experience

- **Type Safety** - Strict TypeScript throughout
- **Testing** - Unit (Vitest) and E2E (Playwright)
- **Error Tracking** - Sentry integration
- **Rate Limiting** - Upstash Redis

---

## Documentation

- **[Getting Started](https://shipkit.pro/docs/getting-started)** - Installation and first steps
- **[Architecture](https://shipkit.pro/docs/architecture)** - How ShipKit is structured
- **[Providers](https://shipkit.pro/docs/providers)** - Configuring auth, payments, AI
- **[Customization](https://shipkit.pro/docs/customization)** - Theming and branding
- **[Deployment](https://shipkit.pro/docs/deployment)** - Vercel, Docker, and more
- **[AI Development](https://shipkit.pro/docs/ai-development)** - Vibecoding best practices

---

## AI Context Files

ShipKit includes comprehensive documentation for AI assistants:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Internationalization patterns and i18n rules |
| `AGENTS.md` | Architecture overview and code standards |
| `PATTERNS.md` | Database, API, component, and testing patterns |

These files ensure AI assistants can understand and modify the codebase correctly.

---

## Environment Variables

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://...

# Auth Provider (nextauth | supabase | betterauth)
AUTH_PROVIDER=nextauth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Payment Provider (stripe | lemonsqueezy | polar)
PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# AI Provider
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=

# Email
RESEND_API_KEY=

# Rate Limiting (optional)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Error Tracking (optional)
SENTRY_DSN=
```

---

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ricoboost/Shipkit-pro.git)

### Docker

```bash
docker build -t shipkit .
docker run -p 3000:3000 shipkit
```

---

## License

This software is licensed under the **ShipKit Commercial License** by Webscalers LLC.

### License Grant

Upon purchase, you receive a **non-exclusive, perpetual, worldwide, non-transferable** license.

### What You CAN Do

- Use in **unlimited** personal and commercial projects
- Create end products for clients (freelance/agency work)
- Modify and customize source code
- Build SaaS applications without per-project fees
- Charge users for products built with the software
- Combine with other code and libraries

### What You CANNOT Do

- Redistribute source code publicly or privately
- Share with unlicensed individuals
- Post to public repositories (GitHub, GitLab, etc.)
- Include in open-source projects
- Resell, sublicense, lease, or white-label
- Create competing products
- Remove copyright notices or claim ownership
- Transfer the license to another party

### GitHub Access

- One GitHub account per license
- Account linking is permanent (changeable via support)
- Team members need individual licenses

### Support & Updates

- Lifetime access to updates, bug fixes, and security patches
- Documentation and community support included

### Refund Policy

30-day money-back guarantee on first purchase (if terms not violated).

For full license terms, visit: [shipkit.pro/license](https://www.shipkit.pro/license)

---

<p align="center">
  <strong>Built for developers who ship with or without AI.</strong><br>
  <a href="https://shipkit.pro">shipkit.pro</a>
</p>
