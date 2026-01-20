import { useEffect, useState } from 'react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';

/**
 * Component to load and initialize Google Analytics (gtag.js).
 * Place this component once in your root layout to enable analytics.
 * Handles SSR hydration issues by only rendering on the client side.
 *
 * @example
 * ```tsx
 * <GoogleAnalyticsProvider measurementId={'G-XXXXXXXXXX'}>
 *   <GoogleAnalytics />
 *   <App />
 * </GoogleAnalyticsProvider>
 * ```
 */
export function GoogleAnalytics(): null {
  const { isLoaded } = useGoogleAnalytics();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side only
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Log when analytics is loaded (optional, for debugging)
  useEffect(() => {
    if (isMounted && isLoaded) {
      console.info('Google Analytics loaded successfully');
    }
  }, [isMounted, isLoaded]);

  return null;
}
