# ShipKit API - Backend Development Skill

Generate production-ready Next.js API routes following ShipKit Pro patterns. Includes authentication, validation, error handling, and database integration.

## Capabilities

### API Route Generation
- **CRUD endpoints**: Full create, read, update, delete with pagination
- **Authenticated routes**: Routes protected by session or API key
- **Webhook handlers**: Stripe, LemonSqueezy, and custom webhooks
- **File upload routes**: Secure file upload with validation
- **AI endpoints**: Credit-tracked AI API routes

### Built-in Features
- Zod schema validation on all inputs
- Consistent error response format
- Rate limiting middleware
- Request logging and audit trails
- Credit system integration

## Code Standards

```typescript
// 1. Always validate input with Zod
// 2. Use NextResponse for responses
// 3. Wrap handlers in try-catch
// 4. Return consistent error format
// 5. Use proper HTTP status codes
// 6. Include rate limiting for public endpoints
// 7. Log important operations
```

## Usage Examples

### Create a CRUD API
```
"Create an API for managing user projects with CRUD operations"
```

### Create an Authenticated Endpoint
```
"Generate an endpoint that requires authentication and returns user data"
```

### Create a Webhook Handler
```
"Build a Stripe webhook handler for subscription events"
```

## Templates Available

| Template | Description |
|----------|-------------|
| `crud-route.ts` | Full CRUD with pagination and filtering |
| `auth-route.ts` | Session-protected endpoint |
| `webhook-route.ts` | Webhook handler with signature verification |
| `upload-route.ts` | File upload with validation |
| `ai-route.ts` | AI endpoint with credit tracking |

## Error Response Format

All errors follow this structure:

```typescript
{
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    details?: { field: 'email', issue: 'Invalid format' }
  }
}
```

## Standard HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Created (POST) |
| 400 | Bad request / validation error |
| 401 | Unauthorized (no auth) |
| 403 | Forbidden (no permission) |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error |

## Middleware Available

- `auth.ts` - Session and API key authentication
- `rate-limit.ts` - Request rate limiting
- `validation.ts` - Zod schema validation helper

## Integration with ShipKit

Generated API routes automatically:
1. Use the configured auth provider (NextAuth/Supabase/BetterAuth)
2. Connect to Prisma database
3. Track usage in credits system
4. Log to audit trail
5. Handle errors consistently
