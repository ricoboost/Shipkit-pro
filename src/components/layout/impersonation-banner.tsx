'use client';

/**
 * Impersonation Banner Component
 * Displays when an admin is impersonating another user
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserX, AlertTriangle, Loader2 } from 'lucide-react';

interface ImpersonationBannerProps {
  impersonatedUser: {
    name?: string;
    email: string;
  };
  adminUser: {
    name?: string;
    email: string;
  };
}

export function ImpersonationBanner({
  impersonatedUser,
  adminUser,
}: ImpersonationBannerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = async () => {
    setIsExiting(true);

    try {
      const response = await fetch('/api/admin/impersonate/stop', {
        method: 'POST',
      });

      if (response.ok) {
        startTransition(() => {
          router.refresh();
          // Redirect to admin users page
          router.push('/admin/users');
        });
      }
    } catch (error) {
      console.error('Failed to stop impersonation:', error);
    } finally {
      setIsExiting(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">
            You are viewing as{' '}
            <strong>{impersonatedUser.name || impersonatedUser.email}</strong>
          </span>
          <span className="text-sm opacity-75">
            (logged in as {adminUser.name || adminUser.email})
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExit}
          disabled={isExiting || isPending}
          className="bg-yellow-600 hover:bg-yellow-700 text-white border-none"
        >
          {isExiting || isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exiting...
            </>
          ) : (
            <>
              <UserX className="h-4 w-4 mr-2" />
              Exit Impersonation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
