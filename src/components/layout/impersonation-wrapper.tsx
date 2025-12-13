/**
 * Impersonation Wrapper Component
 * Server component that checks for impersonation and renders the banner
 */

import { auth } from '@/lib/auth';
import { ImpersonationBanner } from './impersonation-banner';

export async function ImpersonationWrapper() {
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
}
