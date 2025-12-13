#!/usr/bin/env tsx
/**
 * API Route Generator Script
 *
 * Creates a new API route with authentication, validation, and error handling.
 *
 * Usage: npx tsx scripts/generators/generate-api.ts <route-path>
 * Example: npx tsx scripts/generators/generate-api.ts products
 * Example: npx tsx scripts/generators/generate-api.ts products/[id]
 */

import * as fs from 'fs';
import * as path from 'path';

const BASE_PATH = process.cwd();

function kebabToPascal(str: string): string {
  return str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function generateRouteContent(routePath: string, isDynamic: boolean): string {
  const resourceName = routePath.split('/')[0];
  const pascalName = kebabToPascal(resourceName);
  const schemaName = `${resourceName}Schema`;

  if (isDynamic) {
    return `/**
 * API Route: /api/${routePath}
 *
 * Handles CRUD operations for individual ${resourceName}.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Request validation schema
const updateSchema = z.object({
  // Add your update fields here
  name: z.string().min(1).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/${routePath} - Get single resource
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const item = await db.${resourceName}.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: '${pascalName} not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('GET /api/${routePath} error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/${routePath} - Update resource
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await db.${resourceName}.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PATCH /api/${routePath} error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/${routePath} - Delete resource
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db.${resourceName}.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: '${pascalName} deleted' });
  } catch (error) {
    console.error('DELETE /api/${routePath} error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
`;
  }

  return `/**
 * API Route: /api/${routePath}
 *
 * Handles CRUD operations for ${resourceName}.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, paginate } from '@/lib/db';
import { z } from 'zod';

// Request validation schemas
const createSchema = z.object({
  // Add your fields here
  name: z.string().min(1),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

// GET /api/${routePath} - List resources
export async function GET(req: NextRequest) {
  try {
    const session = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const query = querySchema.parse(searchParams);
    const { take, skip } = paginate(query.page, query.limit);

    // Build where clause
    const where = {
      userId: session.user.id,
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' as const },
      }),
    };

    // Fetch data with pagination
    const [items, total] = await Promise.all([
      db.${resourceName}.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      db.${resourceName}.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page: query.page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
        hasMore: query.page * take < total,
      },
    });
  } catch (error) {
    console.error('GET /api/${routePath} error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/${routePath} - Create resource
export async function POST(req: NextRequest) {
  try {
    const session = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const created = await db.${resourceName}.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/${routePath} error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx tsx scripts/generators/generate-api.ts <route-path>');
    console.error('Example: npx tsx scripts/generators/generate-api.ts products');
    console.error('Example: npx tsx scripts/generators/generate-api.ts products/[id]');
    process.exit(1);
  }

  const routePath = args[0];
  const isDynamic = routePath.includes('[') && routePath.includes(']');

  // Create API directory
  const apiDir = path.join(BASE_PATH, 'src/app/api', routePath);
  const routeFile = path.join(apiDir, 'route.ts');

  if (fs.existsSync(routeFile)) {
    console.error(`Error: Route already exists at ${routeFile}`);
    process.exit(1);
  }

  // Create directory
  fs.mkdirSync(apiDir, { recursive: true });

  // Write route file
  const routeContent = generateRouteContent(routePath, isDynamic);
  fs.writeFileSync(routeFile, routeContent);
  console.log(`Created: ${routeFile}`);

  console.log('\nAPI route generated successfully!');
  console.log(`\nNext steps:`);
  console.log(`1. Update the Zod schema with your fields`);
  console.log(`2. Replace 'MODEL' with your Prisma model name`);
  console.log(`3. Add any custom business logic`);
  console.log(`4. Test the endpoint with curl or Postman`);
}

main().catch(console.error);
