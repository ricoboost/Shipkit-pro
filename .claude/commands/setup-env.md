# Configure Environment Variables

Generate and configure your .env file with all required environment variables.

## Instructions

Run the environment setup script:

```bash
npx tsx scripts/setup/setup-env.ts
```

## Options

### Interactive Mode (default)
Prompts for each required variable:
```bash
npx tsx scripts/setup/setup-env.ts --interactive
```

### Quick Mode
Uses defaults and auto-generates secrets:
```bash
npx tsx scripts/setup/setup-env.ts --quick
```

## What This Script Does

1. Creates/updates your `.env` file
2. Auto-generates secure secrets (AUTH_SECRET)
3. Sets sensible defaults for optional variables
4. Creates `.env.example` for reference

## Environment Variables Configured

### Required
- `DATABASE_URL` - Database connection string
- `AUTH_SECRET` - Auth session encryption key (auto-generated)
- `NEXT_PUBLIC_APP_URL` - Your application URL

### Auth (pick one provider)
- NextAuth: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Payments
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

### AI
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GOOGLE_GENERATIVE_AI_API_KEY`

### Email
- `RESEND_API_KEY`, `EMAIL_FROM`
