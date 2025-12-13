# Configure Authentication

Set up your authentication provider for ShipKit.

## Instructions

Run the auth setup script:

```bash
npx tsx scripts/setup/setup-auth.ts
```

## Supported Auth Providers

### 1. NextAuth.js (default)
Full-featured auth with multiple providers, sessions, and JWT support.

```bash
npx tsx scripts/setup/setup-auth.ts --provider next-auth
```

Required env vars:
- `AUTH_SECRET` (auto-generated)
- `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` (for Google OAuth)
- `AUTH_GITHUB_ID` + `AUTH_GITHUB_SECRET` (for GitHub OAuth)

### 2. Supabase Auth
Auth powered by Supabase with Row Level Security.

```bash
npx tsx scripts/setup/setup-auth.ts --provider supabase
```

Required env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Better Auth
Modern, type-safe authentication library.

```bash
npx tsx scripts/setup/setup-auth.ts --provider better-auth
```

Required env vars:
- `AUTH_SECRET`
- OAuth credentials for your chosen providers

## OAuth Provider Setup

### Google OAuth
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `{APP_URL}/api/auth/callback/google`
4. Copy Client ID and Secret to `.env`

### GitHub OAuth
1. Go to https://github.com/settings/applications/new
2. Create OAuth Application
3. Set callback URL: `{APP_URL}/api/auth/callback/github`
4. Copy Client ID and Secret to `.env`

## What This Script Does

1. Lets you choose an auth provider
2. Updates `AUTH_PROVIDER` in `.env`
3. Shows required environment variables
4. Helps configure missing credentials
5. Provides setup instructions for OAuth
