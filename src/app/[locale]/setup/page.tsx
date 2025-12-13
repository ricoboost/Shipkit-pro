/**
 * Setup Page
 * Entry point for the setup wizard
 */

import { redirect } from 'next/navigation';
import { SetupWizard } from '@/components/setup-wizard';
import { DemoProvider } from '@/components/providers/demo-provider';
import { isDatabaseConfigured } from '@/lib/setup-mode';

// Check if setup is already complete
async function checkSetupComplete(): Promise<boolean> {
  // Skip database check if not configured (placeholder or missing)
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    // Dynamically import db to avoid errors when DATABASE_URL is not set
    const { db } = await import('@/lib/db');

    // Check if at least one admin user exists
    const adminUser = await db.user.findFirst({
      where: { role: 'ADMIN' },
    });

    return !!adminUser;
  } catch {
    // If database query fails, setup is not complete
    return false;
  }
}

export default async function SetupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const setupComplete = await checkSetupComplete();

  // If setup is complete, redirect to homepage
  if (setupComplete) {
    redirect(`/${locale}`);
  }

  return (
    <DemoProvider>
      <SetupWizard />
    </DemoProvider>
  );
}
