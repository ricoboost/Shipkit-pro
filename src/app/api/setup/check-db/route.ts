/**
 * Database Check API Route
 * Tests database connection and provides troubleshooting info
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface DbCheckResponse {
  connected: boolean;
  error?: string;
  provider?: string;
  troubleshooting?: string[];
}

export async function GET() {
  const response: DbCheckResponse = {
    connected: false,
  };

  // Check if DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    response.error = 'DATABASE_URL environment variable is not set';
    response.troubleshooting = [
      'Create a .env.local file in your project root',
      'Add DATABASE_URL="your-connection-string"',
      'Get a connection string from Supabase, Neon, or PlanetScale',
    ];
    return NextResponse.json(response, { status: 200 });
  }

  // Detect provider from connection string
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl.includes('supabase')) {
    response.provider = 'supabase';
  } else if (dbUrl.includes('neon')) {
    response.provider = 'neon';
  } else if (dbUrl.includes('planetscale')) {
    response.provider = 'planetscale';
  } else if (dbUrl.includes('postgres') || dbUrl.includes('postgresql')) {
    response.provider = 'postgresql';
  } else if (dbUrl.includes('mysql')) {
    response.provider = 'mysql';
  } else {
    response.provider = 'unknown';
  }

  // Test connection
  try {
    await db.$queryRaw`SELECT 1`;
    response.connected = true;
  } catch (err) {
    response.connected = false;

    const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
    response.error = errorMessage;

    // Provide specific troubleshooting based on error
    if (errorMessage.includes('ECONNREFUSED')) {
      response.troubleshooting = [
        'Database server is not running or unreachable',
        'Check if your database URL is correct',
        'Ensure your IP is allowlisted in your database provider',
      ];
    } else if (errorMessage.includes('authentication')) {
      response.troubleshooting = [
        'Database credentials are incorrect',
        'Check username and password in your DATABASE_URL',
        'Regenerate your database password if needed',
      ];
    } else if (errorMessage.includes('does not exist')) {
      response.troubleshooting = [
        'Database does not exist',
        'Run: npx prisma db push',
        'Or create the database manually in your provider dashboard',
      ];
    } else if (errorMessage.includes('SSL')) {
      response.troubleshooting = [
        'SSL connection issue',
        'Add ?sslmode=require to your DATABASE_URL',
        'Or check your provider SSL settings',
      ];
    } else {
      response.troubleshooting = [
        'Check your DATABASE_URL format',
        'Ensure the database exists and is accessible',
        'Run: npx prisma db push to create tables',
        'Check your database provider dashboard for issues',
      ];
    }
  }

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
