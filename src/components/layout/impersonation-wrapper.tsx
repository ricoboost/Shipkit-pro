/**
 * Impersonation Wrapper Component
 * Server component that checks for impersonation and renders the banner
 */

import { isAuthConfigured } from '@/lib/setup-mode';
import { ImpersonationBanner } from './impersonation-banner';

export async function ImpersonationWrapper() {
  // Skip if auth is not configured (setup mode)
  if (!isAuthConfigured()) {
    return null;
  }

  // Dynamically import auth to avoid initialization errors
  const { auth } = await import('@/lib/auth');

  try {
    const session = await auth.getSession();

    if (!session?.impersonation?.isImpersonating) {
      return null;
    }

    return (
      <ImpersonationBanner
        impersonatedUser={{
          name: session.user.name,
          email: session.user.email,
        }}
        adminUser={{
          name: session.impersonation.impersonatedBy?.name,
          email: session.impersonation.impersonatedBy?.email || '',
        }}
      />
    );
  } catch {
    // Auth not ready, skip impersonation check
    return null;
  }
}
