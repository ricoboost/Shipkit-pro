# Scaffold API Route

Create a new API route with proper validation, authentication, and error handling.

## Arguments
- `$ARGUMENTS` - The API route path (e.g., "products" or "users/[id]")

## Instructions

Create a new API route at `src/app/api/$ARGUMENTS/route.ts` following ShipKit patterns.

## Template

```typescript
/**
 * API Route: /api/$ARGUMENTS
 *
 * Description of what this API does.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Request validation schema
const requestSchema = z.object({
  // Add your fields here
  name: z.string().min(1),
});

// GET - Fetch resource(s)
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Your logic here
    const data = await db.MODEL.findMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET /api/$ARGUMENTS error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create resource
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Create resource
    const created = await db.MODEL.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/$ARGUMENTS error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## For Dynamic Routes ([id])

If creating a dynamic route like `api/products/[id]`, use this pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  // Use id for lookup
}
```

## Patterns to Follow

1. **Authentication**: Always check `auth.getSession()`
2. **Validation**: Use Zod schemas for request body
3. **Error Handling**: Wrap in try/catch with proper error responses
4. **Response Format**: Use `{ success: true, data }` or `{ error: string }`
5. **HTTP Status Codes**:
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 500: Server Error

## Checklist
- [ ] Create route file
- [ ] Add Zod validation schema
- [ ] Add authentication check
- [ ] Implement CRUD operations needed
- [ ] Add error handling
- [ ] Test with Postman/curl
