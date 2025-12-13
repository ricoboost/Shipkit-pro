/**
 * Health Check API Route
 * Used by Docker, Kubernetes, and load balancers to verify app health
 *
 * SECURITY: Rate limited to prevent abuse
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withRateLimit, rateLimitPresets } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime: number
  checks: {
    database: 'ok' | 'error'
    memory: 'ok' | 'warning' | 'error'
  }
  version?: string
  environment?: string
}

export async function GET(req: NextRequest) {
  // SECURITY: Rate limit to 120 requests per minute to prevent abuse
  const { allowed, headers: rateLimitHeaders } = await withRateLimit(req, {
    ...rateLimitPresets.api,
    maxRequests: 120, // Higher limit for health checks
  });

  if (!allowed) {
    return NextResponse.json(
      { status: 'rate_limited', error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  const startTime = Date.now()
  const checks: HealthStatus['checks'] = {
    database: 'error',
    memory: 'ok',
  }

  // Check database connection
  try {
    await db.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch {
    checks.database = 'error'
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage()
  const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024
  const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024
  const memoryUsagePercent = (heapUsedMB / heapTotalMB) * 100

  if (memoryUsagePercent > 90) {
    checks.memory = 'error'
  } else if (memoryUsagePercent > 75) {
    checks.memory = 'warning'
  }

  // Determine overall status
  let status: HealthStatus['status'] = 'healthy'
  if (checks.database === 'error') {
    status = 'unhealthy'
  } else if (checks.memory === 'warning') {
    status = 'degraded'
  } else if (checks.memory === 'error') {
    status = 'unhealthy'
  }

  const response: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    // SECURITY: Removed version and environment to prevent info disclosure
  }

  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Response-Time': `${Date.now() - startTime}ms`,
    },
  })
}
