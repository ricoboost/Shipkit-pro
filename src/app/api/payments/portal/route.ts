/**
 * Customer Portal API Route
 * Creates billing portal sessions for subscription management
 */

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { payments } from '@/lib/payments';
import { db } from '@/lib/db';

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const session = await auth.getSession();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return Response.json(
        { error: 'No billing account found' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/settings/billing`;

    const portal = await payments.createPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl,
    });

    return Response.json({ url: portal.url });
  } catch (error) {
    console.error('Portal error:', error);
    return Response.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
