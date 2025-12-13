'use client';

/**
 * Demo Mode Entry Point
 * This page enables demo mode and redirects to dashboard
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { enableDemoMode, isDemoMode } from '@/lib/demo';

export default function DemoPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Enabling demo mode...');

  useEffect(() => {
    // Enable demo mode directly in localStorage
    enableDemoMode();

    // Verify it was written
    const isEnabled = isDemoMode();
    console.log('Demo mode enabled:', isEnabled);

    if (isEnabled) {
      setStatus('Demo mode enabled! Redirecting...');
      // Use window.location for a full page navigation to ensure fresh state
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 300);
    } else {
      setStatus('Error enabling demo mode');
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
