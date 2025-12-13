/**
 * Onboarding System
 * User onboarding flow and progress tracking
 */

import { db } from '@/lib/db';

/**
 * Onboarding step definition
 */
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  href: string;
  isRequired: boolean;
}

/**
 * User onboarding progress
 */
export interface OnboardingProgress {
  completedSteps: string[];
  currentStep: string | null;
  isComplete: boolean;
  percentComplete: number;
}

/**
 * Default onboarding steps
 */
export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your name and profile picture',
    href: '/settings/profile',
    isRequired: true,
  },
  {
    id: 'subscription',
    title: 'Choose a Plan',
    description: 'Select a subscription plan that fits your needs',
    href: '/pricing',
    isRequired: false,
  },
  {
    id: 'first-project',
    title: 'Create Your First Project',
    description: 'Get started by creating your first project',
    href: '/dashboard',
    isRequired: false,
  },
  {
    id: 'api-key',
    title: 'Generate an API Key',
    description: 'Create an API key to integrate with your apps',
    href: '/settings/api-keys',
    isRequired: false,
  },
  {
    id: 'team',
    title: 'Invite Your Team',
    description: 'Collaborate with your team members',
    href: '/settings/team',
    isRequired: false,
  },
];

export const onboarding = {
  /**
   * Get onboarding progress for a user
   */
  async getProgress(userId: string): Promise<OnboardingProgress> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        image: true,
        onboardingCompleted: true,
        subscription: { select: { status: true } },
        apiKeys: { select: { id: true }, take: 1 },
        memberships: { select: { id: true }, take: 1 },
      },
    });

    if (!user) {
      return {
        completedSteps: [],
        currentStep: 'profile',
        isComplete: false,
        percentComplete: 0,
      };
    }

    const completedSteps: string[] = [];

    // Check profile completion
    if (user.name && user.name.length > 0) {
      completedSteps.push('profile');
    }

    // Check subscription
    if (user.subscription?.status === 'ACTIVE' || user.subscription?.status === 'TRIALING') {
      completedSteps.push('subscription');
    }

    // Check API key
    if (user.apiKeys.length > 0) {
      completedSteps.push('api-key');
    }

    // Check team membership (besides own organizations)
    if (user.memberships.length > 1) {
      completedSteps.push('team');
    }

    const requiredSteps = defaultOnboardingSteps.filter((s) => s.isRequired);
    const requiredComplete = requiredSteps.every((s) =>
      completedSteps.includes(s.id)
    );

    // Find current step (first incomplete required step)
    const currentStep = defaultOnboardingSteps.find(
      (s) => s.isRequired && !completedSteps.includes(s.id)
    )?.id || null;

    const percentComplete = Math.round(
      (completedSteps.length / defaultOnboardingSteps.length) * 100
    );

    return {
      completedSteps,
      currentStep,
      isComplete: requiredComplete || user.onboardingCompleted,
      percentComplete,
    };
  },

  /**
   * Mark onboarding as complete
   */
  async markComplete(userId: string): Promise<void> {
    await db.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });
  },

  /**
   * Reset onboarding progress
   */
  async reset(userId: string): Promise<void> {
    await db.user.update({
      where: { id: userId },
      data: { onboardingCompleted: false },
    });
  },

  /**
   * Check if user should see onboarding
   */
  async shouldShowOnboarding(userId: string): Promise<boolean> {
    const progress = await this.getProgress(userId);
    return !progress.isComplete;
  },

  /**
   * Get onboarding steps with completion status
   */
  async getStepsWithStatus(
    userId: string
  ): Promise<(OnboardingStep & { isComplete: boolean })[]> {
    const progress = await this.getProgress(userId);

    return defaultOnboardingSteps.map((step) => ({
      ...step,
      isComplete: progress.completedSteps.includes(step.id),
    }));
  },
};
