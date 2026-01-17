import * as Sentry from '@sentry/tanstackstart-react';

const sentryDsn = import.meta.env?.VITE_SENTRY_DSN ?? process.env.VITE_SENTRY_DSN;

if (!sentryDsn) {
  console.warn('VITE_SENTRY_DSN is not defined. Sentry is not running.')
} else {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 1.0,
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /^https:\/\/bedrocktweaks\.net\/api/],
    ignoreErrors: [
      'adsbygoogle.push() error: No slot size for availableWidth=0',
    ],
  })
}
