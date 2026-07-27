import { useCallback } from 'react';
import { useAdSenseContext } from '../contexts/AdSenseContext';

declare global {
  interface Window {
    adsbygoogle?: { loaded?: boolean; push?: (obj: PushAdsOptions) => void };
  }
}

interface PushAdsOptions {
  google_ad_client?: string;
  enable_page_level_ads?: boolean;
}

interface UseAdSense {
  isLoaded: boolean;
  pushAds: (options?: { auto: boolean }) => void;
}

/**
 * Reads AdSense state from the provider, which owns the script tag, and returns a
 * stable `pushAds`. Stability matters: `pushAds` sits in effect dependency arrays, and
 * a new identity every render re-fired the push on every render.
 */
export function useAdSense(): UseAdSense {
  const { clientId, isLoaded } = useAdSenseContext();

  const pushAds = useCallback((options?: { auto: boolean }): void => {
    if (!isLoaded) {
      return;
    }

    try {
      const w = window;

      w.adsbygoogle = w.adsbygoogle || {};

      if (options?.auto) {
      // Hard stop if AdSense already initialized auto ads
        if (w.adsbygoogle?.loaded) {
          return;
        }

        w.adsbygoogle.push?.({
          google_ad_client: clientId,
          enable_page_level_ads: true,
        });
      } else {
        w.adsbygoogle.push?.({});
      }
    } catch (error) {
      console.error('Error pushing ads:', error);
    }
  }, [clientId, isLoaded]);

  return { isLoaded, pushAds };
}
