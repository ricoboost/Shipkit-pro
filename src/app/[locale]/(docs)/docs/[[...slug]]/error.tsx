'use client';

/**
 * Error Boundary for Localized Documentation Pages
 * Provides graceful error handling for doc page crashes with locale support
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function LocaleDocError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = params?.locale as string | undefined;

  useEffect(() => {
    // Log error for debugging (Sentry integration can be added here)
    console.error('[Docs] Page error:', error, { locale });
  }, [error, locale]);

  // Build locale-aware docs home URL
  const docsHomeUrl = locale && locale !== 'en' ? `/${locale}/docs` : '/docs';

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 rounded-full bg-destructive/10 p-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-semibold">Failed to load documentation</h2>
      <p className="mb-6 max-w-md text-muted-foreground">
        We encountered an error loading this page. This might be a temporary issue.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try again
        </button>
        <Link
          href={docsHomeUrl}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          Go to docs home
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
