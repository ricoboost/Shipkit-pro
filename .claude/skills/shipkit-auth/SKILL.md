# ShipKit Auth - Authentication Patterns Skill

Guide authentication implementation following ShipKit Pro patterns. Includes social login, 2FA, role-based access, and multi-tenant permissions.

## Capabilities

### Authentication Patterns
- **Social login**: OAuth with Google, GitHub, Discord
- **Magic links**: Passwordless email authentication
- **2FA/TOTP**: Two-factor with authenticator apps
- **API keys**: Programmatic API access

### Authorization Patterns
- **RBAC**: Role-based access control
- **Organization permissions**: Multi-tenant access
- **Resource-level access**: Per-resource permissions

## Supported Providers

ShipKit Pro supports 3 auth providers (switchable via env):

| Provider | Use Case |
|----------|----------|
| NextAuth | Traditional apps, OAuth focus |
| Supabase | Real-time apps, Postgres auth |
| Better Auth | Modern apps, full TypeScript |

## Code Standards

```typescript
// 1. Always verify session on protected routes
// 2. Use middleware for route protection
// 3. Check organization membership for multi-tenant
// 4. Validate permissions before actions
// 5. Log authentication events
// 6. Handle session expiry gracefully
```

## Usage Examples

### Add Social Login
```
"Add Google and GitHub login to the auth form"
```

### Implement 2FA
```
"Add TOTP two-factor authentication to user settings"
```

### Create Role Guard
```
"Create a component that only renders for admin users"
```

## Templates Available

| Template | Description |
|----------|-------------|
| `social-login.tsx` | OAuth provider buttons |
| `magic-link.tsx` | Passwordless auth flow |
| `two-factor.tsx` | 2FA setup and verify |
| `role-guard.tsx` | Role-based component wrapper |

## Patterns Available

| Pattern | Description |
|---------|-------------|
| `session-management.md` | Session best practices |
| `api-key-auth.md` | API authentication |
| `organization-access.md` | Multi-tenant permissions |

## Role-Based Access Control

```typescript
// Define roles
type Role = 'owner' | 'admin' | 'member' | 'viewer';

// Check role in component
function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  if (user?.role !== 'admin' && user?.role !== 'owner') {
    return null;
  }
  return <>{children}</>;
}

// Check role in API route
if (!['admin', 'owner'].includes(user.role)) {
  return errorResponse('Forbidden', 'FORBIDDEN', 403);
}
```

## Organization Permissions

```typescript
// Check organization membership
const membership = await prisma.organizationMember.findFirst({
  where: {
    userId: session.user.id,
    organizationId: orgId,
  },
});

if (!membership) {
  return errorResponse('Not a member', 'FORBIDDEN', 403);
}

// Check org-level role
if (membership.role !== 'admin') {
  return errorResponse('Admin required', 'FORBIDDEN', 403);
}
```

## 2FA Implementation

```typescript
// Generate secret
import { authenticator } from 'otplib';
const secret = authenticator.generateSecret();

// Verify token
const isValid = authenticator.verify({
  token: userInput,
  secret: user.twoFactorSecret,
});

// Generate backup codes
const backupCodes = Array.from({ length: 10 }, () =>
  crypto.randomBytes(4).toString('hex')
);
```

## Integration with ShipKit

Works with provider abstraction:
1. Auth provider selected via `AUTH_PROVIDER` env
2. Consistent session shape across providers
3. Organization membership in session
4. API key authentication for programmatic access
