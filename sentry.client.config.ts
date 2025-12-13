/**
 * Sentry Client-Side Configuration
 * This file configures the initialization of Sentry on the client.
 * The config you add here will be used whenever a page is visited.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Setting this option to true will print useful information to the console while setting up Sentry.
  debug: false,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will enable session replay
  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature
  integrations: [
    Sentry.replayIntegration({
      // Additional SDK configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Filter out certain errors
  beforeSend(event, hint) {
    const error = hint.originalException

    // Ignore certain errors
    if (error instanceof Error) {
      // Ignore ResizeObserver errors
      if (error.message?.includes('ResizeObserver')) {
        return null
      }

      // Ignore network errors
      if (error.message?.includes('NetworkError')) {
        return null
      }
    }

    return event
  },

  // Environment tag
  environment: process.env.NODE_ENV,
})
