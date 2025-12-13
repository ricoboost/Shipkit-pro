/**
 * Stop Impersonation API Route
 * POST /api/admin/impersonate/stop
 */

import { NextResponse } from 'next/server';
import { stopImpersonation } from '@/lib/impersonation';

export async function POST() {
  try {
    const result = await stopImpersonation();

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to stop impersonation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Impersonation ended. Refresh the page to return to your account.',
    });
  } catch (error) {
    console.error('Stop impersonation error:', error);
    return NextResponse.json(
      { error: 'Failed to stop impersonation' },
      { status: 500 }
    );
  }
}
