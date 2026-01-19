import { useEffect, useState } from 'react';
import { useAdSense } from '../hooks/useAdSense';

/**
 * Component to enable Google AdSense Auto Ads across the application.
 * Place this component once in your root layout to enable auto ads.
 * Handles SSR hydration and refreshes on route changes.
 */
export function AdSenseAutoAds(): null {
  const { isLoaded, pushAds } = useAdSense();
  const [isMounted, setIsMounted] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Ensure client-side only
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize auto ads once when script loads
  useEffect(() => {
    if (!isMounted || !isLoaded || hasInitialized) {
      return;
    }

    pushAds({ auto: true });
    setHasInitialized(true);
  }, [isLoaded, isMounted, hasInitialized, pushAds]);

  return null;
}
