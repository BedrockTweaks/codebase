import * as Sentry from '@sentry/tanstackstart-react';
import handler, { createServerEntry } from '@tanstack/react-start/server-entry';

const sentryDsn = import.meta.env?.VITE_SENTRY_DSN ?? process.env.VITE_SENTRY_DSN;

if (!sentryDsn) {
  console.warn('VITE_SENTRY_DSN is not defined. Sentry is not running.');
} else {
  Sentry.init({
    dsn: sentryDsn,
  });
}

export default createServerEntry({
  fetch(request) {
    return handler.fetch(request);
  },
});
