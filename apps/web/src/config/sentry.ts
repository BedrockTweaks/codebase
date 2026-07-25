/**
 * Sentry configuration
 * Central place to manage which browser errors are worth reporting.
 *
 * The site embeds AdSense and is visited with all kinds of extensions and
 * in-app webviews injected into the page. Those scripts throw constantly and
 * Sentry attributes the failures to us, which buries the errors we can act on.
 */

import type { ErrorEvent } from '@sentry/tanstackstart-react';

/**
 * Error messages that never originate from our own code.
 */
export const SENTRY_IGNORE_ERRORS: (string | RegExp)[] = [
  // Google AdSense internals
  'Accessing domItems after disposal',
  '__tcfapiCall',
  /googlesyndication\.com/,
  /contentDocument\.body/,

  // Extensions and injected globals
  /\b(LIDNotify|xbrowser|swbrowser)\b is not defined/,
  /window\.ethereum/,
  'Invalid call to runtime.sendMessage',
  'WKWebView API client did not respond to this postMessage',

  // Opaque cross-origin failures with no recoverable detail
  'Non-Error promise rejection captured',
  'ResizeObserver loop completed with undelivered notifications',
  'ResizeObserver loop limit exceeded',
];

/**
 * Script origins we never want to attribute errors to.
 */
export const SENTRY_DENY_URLS: RegExp[] = [
  // Ad and analytics providers
  /googlesyndication\.com/,
  /googletagservices\.com/,
  /googletagmanager\.com/,
  /google-analytics\.com/,
  /doubleclick\.net/,
  /\/pagead\//,

  // Affiliate banner
  /bisecthosting\.com/,

  // Browser extensions
  /^chrome-extension:\/\//,
  /^moz-extension:\/\//,
  /^safari-(web-)?extension:\/\//,
  /^webkit-masked-url:/,
];

/**
 * Drop events that carry no usable stack frames.
 *
 * These are the cross-origin `Script error.` class: a message, no file, no
 * line we can map back to a release. They are unactionable by definition, and
 * on this site they come from injected third-party scripts.
 * @param event - Event Sentry is about to send
 * @returns The event to send, or null to drop it
 */
export function dropUnactionableEvent(event: ErrorEvent): ErrorEvent | null {
  const values = event.exception?.values;

  if (!values?.length) {
    return event;
  }

  const hasUsableFrame = values.some(value =>
    value.stacktrace?.frames?.some(frame => Boolean(frame.filename) && frame.filename !== '<anonymous>'),
  );

  return hasUsableFrame ? event : null;
}
