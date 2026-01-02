'use client';

/**
 * Dashboard Guard
 * Protects dashboard routes - allows access in demo mode or with real auth
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useDemoContext } from '@/components/providers/demo-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface DashboardGuardProps {
  children: React.ReactNode;
}

export function DashboardGuard({ children }: DashboardGuardProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { disable } = useDemoContext();
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const [demoChecked, setDemoChecked] = useState(false);
  const [isDemoEnabled, setIsDemoEnabled] = useState(false);

  // Check demo mode on mount (client-side only)
  useEffect(() => {
    const rawValue = localStorage.getItem('shipkit-demo-mode');
    const demoEnabled = rawValue === 'true';
    console.log('DashboardGuard demo check:', { demoEnabled, rawValue });
    setIsDemoEnabled(demoEnabled);
    setDemoChecked(true);
  }, []);

  // Handle auth redirect
  useEffect(() => {
    if (!demoChecked) return; // Wait for demo check
    if (isDemoEnabled) return; // Demo mode, no redirect needed
    if (status === 'loading') return; // Wait for session to load

    console.log('DashboardGuard session check:', { session, status });

    if (!session) {
      console.log('Redirecting to login - no session');
      router.push('/login?callbackUrl=/dashboard');
    } else {
      console.log('Authenticated via NextAuth!');
    }
  }, [demoChecked, isDemoEnabled, session, status, router]);

  // Determine auth state
  const isLoading = !demoChecked || (!isDemoEnabled && status === 'loading');
  const isAllowed = isDemoEnabled || (status === 'authenticated' && session);

  const handleExitDemo = () => {
    disable();
    router.push('/');
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not allowed (will redirect)
  if (!isAllowed) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Redirecting...</div>
      </div>
    );
  }

  return (
    <>
      {/* Demo Mode Banner */}
      {isDemoEnabled && showDemoBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2">
          <div className="container flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Demo Mode - Data is stored locally and will be lost when you clear browser data
              </span>
              <Badge variant="outline" className="border-amber-700 text-amber-900">
                No Database Required
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-900 hover:text-amber-950 hover:bg-amber-400"
                onClick={handleExitDemo}
              >
                Exit Demo
              </Button>
              <button
                onClick={() => setShowDemoBanner(false)}
                className="p-1 hover:bg-amber-400 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={isDemoEnabled && showDemoBanner ? 'pt-10' : ''}>
        {children}
      </div>
    </>
  );
}
