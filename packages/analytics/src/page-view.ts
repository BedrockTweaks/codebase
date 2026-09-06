/**
 * Reports a page view to GA4.
 *
 * Configuring the tag sends a page view for the URL the visitor landed on, but
 * a client-side router changes the URL without reconfiguring it, so every
 * navigation after the first goes unrecorded unless it is reported here.
 */
export function sendPageView(pageLocation: string, pageTitle?: string): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', 'page_view', {
    page_location: pageLocation,
    page_title: pageTitle ?? document.title,
  });
}
