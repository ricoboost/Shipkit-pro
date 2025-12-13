# ShipKit Setup Wizard

Run the interactive setup wizard to configure your ShipKit application.

## Instructions

Run the following command to start the setup wizard:

```bash
npx tsx scripts/setup/wizard.ts
```

The wizard will guide you through:

1. **Environment Variables** - Generate .env file with required configuration
2. **Database** - Configure database connection and run migrations
3. **Authentication** - Set up auth provider (NextAuth, Supabase, or Better Auth)
4. **Payments** - Configure payment provider (Stripe, Lemon Squeezy, Polar)
5. **AI Provider** - Set up AI/LLM provider for AI features
6. **Admin User** - Create your first admin user

## Quick Mode

For a faster setup with defaults:

```bash
npx tsx scripts/setup/wizard.ts --quick
```

## Skip Optional Steps

To only configure required features:

```bash
npx tsx scripts/setup/wizard.ts --skip-optional
```

## Individual Setup Scripts

You can also run individual setup scripts:

- `npx tsx scripts/setup/setup-env.ts` - Environment variables
- `npx tsx scripts/setup/setup-db.ts` - Database configuration
- `npx tsx scripts/setup/setup-auth.ts` - Authentication setup
- `npx tsx scripts/setup/setup-payments.ts` - Payment provider
- `npx tsx scripts/setup/setup-ai.ts` - AI provider
- `npx tsx scripts/setup/create-admin.ts` - Create admin user
