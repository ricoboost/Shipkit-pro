/**
 * Onboarding Page
 * Entry point for the production onboarding wizard
 */

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { OnboardingWizard } from '@/components/onboarding';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('onboarding');
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function OnboardingPage() {
  // Check if setup is already complete (admin exists)
  let setupComplete = false;

  try {
    const admin = await db.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    setupComplete = !!admin;
  } catch {
    // Database might not be connected yet, continue to onboarding
    setupComplete = false;
  }

  // If setup is complete, redirect to homepage
  if (setupComplete) {
    redirect('/');
  }

  return <OnboardingWizard />;
}
