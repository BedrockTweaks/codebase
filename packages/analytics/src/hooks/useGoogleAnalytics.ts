import { useEffect, useState } from 'react';
import { useGoogleAnalyticsContext } from '../contexts/GoogleAnalyticsContext';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

interface UseGoogleAnalytics {
  isLoaded: boolean;
}

/**
 * Hook to manage Google Analytics (gtag.js) script loading.
 * Handles client-side only execution to avoid SSR hydration issues.
 */
export function useGoogleAnalytics(): UseGoogleAnalytics {
  const { measurementId } = useGoogleAnalyticsContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we only run on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const scriptId = 'bt-gtag-script';

    // Check if script already exists
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      setIsLoaded(true);

      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Define gtag function
    window.gtag = function gtag(...args: unknown[]): void {
      window.dataLayer?.push(args);
    };

    // Initialize with current date
    window.gtag('js', new Date());

    // Configure with measurement ID
    window.gtag('config', measurementId);

    // Create and append the script
    const script = document.createElement('script');

    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;

    script.onload = (): void => {
      setIsLoaded(true);
    };

    script.onerror = (): void => {
      console.error('Failed to load Google Analytics script');
    };

    document.head.appendChild(script);

    return (): void => {
      // Cleanup: remove script if component unmounts
      const scriptToRemove = document.getElementById(scriptId);

      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [measurementId, isMounted]);

  return { isLoaded };
}
