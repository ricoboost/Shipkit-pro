/**
 * CRUD Route Template
 * A complete CRUD API endpoint with pagination, filtering, and validation.
 *
 * Usage: Copy this template and customize for your resource.
 *
 * File structure for a "projects" resource:
 *   - src/app/api/projects/route.ts (list + create)
 *   - src/app/api/projects/[id]/route.ts (get + update + delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

// =============================================================================
// SCHEMAS
// =============================================================================

// Schema for creating a new resource
const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  // Add more fields as needed
});

// Schema for updating a resource
const updateSchema = createSchema.partial();

// Schema for query parameters
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// =============================================================================
// HELPERS
// =============================================================================

function errorResponse(
  message: string,
  code: string,
  status: number,
  details?: unknown
) {
  return NextResponse.json(
    { error: { code, message, details } },
    { status }
  );
}

// =============================================================================
// LIST + CREATE (src/app/api/[resource]/route.ts)
// =============================================================================

/**
 * GET /api/[resource]
 * List resources with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    // 2. Parse query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = querySchema.safeParse(searchParams);

    if (!query.success) {
      return errorResponse(
        'Invalid query parameters',
        'VALIDATION_ERROR',
        400,
        query.error.flatten()
      );
    }

    const { page, limit, search, sortBy, sortOrder } = query.data;

    // 3. Build where clause
    const where = {
      userId: session.user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // 4. Execute queries
    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        // include: { /* related data */ },
      }),
      prisma.project.count({ where }),
    ]);

    // 5. Return paginated response
    return NextResponse.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error('GET /api/[resource] error:', error);
    return errorResponse('Internal server error', 'SERVER_ERROR', 500);
  }
}

/**
 * POST /api/[resource]
 * Create a new resource
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    // 2. Parse and validate body
    const body = await request.json();
    const validation = createSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        'Invalid input',
        'VALIDATION_ERROR',
        400,
        validation.error.flatten()
      );
    }

    // 3. Create resource
    const item = await prisma.project.create({
      data: {
        ...validation.data,
        userId: session.user.id,
      },
    });

    // 4. Return created resource
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    console.error('POST /api/[resource] error:', error);
    return errorResponse('Internal server error', 'SERVER_ERROR', 500);
  }
}

// =============================================================================
// GET + UPDATE + DELETE (src/app/api/[resource]/[id]/route.ts)
// =============================================================================

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/[resource]/[id]
 * Get a single resource by ID
 */
export async function GET_BY_ID(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const item = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!item) {
      return errorResponse('Resource not found', 'NOT_FOUND', 404);
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error('GET /api/[resource]/[id] error:', error);
    return errorResponse('Internal server error', 'SERVER_ERROR', 500);
  }
}

/**
 * PUT /api/[resource]/[id]
 * Update a resource
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    // Check ownership
    const existing = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return errorResponse('Resource not found', 'NOT_FOUND', 404);
    }

    // Validate input
    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        'Invalid input',
        'VALIDATION_ERROR',
        400,
        validation.error.flatten()
      );
    }

    // Update
    const item = await prisma.project.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error('PUT /api/[resource]/[id] error:', error);
    return errorResponse('Internal server error', 'SERVER_ERROR', 500);
  }
}

/**
 * DELETE /api/[resource]/[id]
 * Delete a resource
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    // Check ownership
    const existing = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return errorResponse('Resource not found', 'NOT_FOUND', 404);
    }

    // Delete (or soft delete)
    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/[resource]/[id] error:', error);
    return errorResponse('Internal server error', 'SERVER_ERROR', 500);
  }
}
