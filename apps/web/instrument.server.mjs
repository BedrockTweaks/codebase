import * as Sentry from '@sentry/tanstackstart-react';
import { config } from 'dotenv';

config();

const sentryDsn = process.env.VITE_SENTRY_DSN;

if (!sentryDsn) {
  console.warn('VITE_SENTRY_DSN is not defined. Sentry is not running.')
} else {
  Sentry.init({
    dsn: sentryDsn,
  })
}
