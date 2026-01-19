import { useEffect, useState } from 'react';
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
 * Hook to manage Google AdSense script loading.
 * Handles client-side only execution to avoid SSR hydration issues.
 */
export function useAdSense(): UseAdSense {
  const { clientId } = useAdSenseContext();
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

    const scriptId = 'bt-adsbygoogle-script';

    // Check if script already exists
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      setIsLoaded(true);

      return;
    }

    // Create and append the script
    const script = document.createElement('script');

    script.id = scriptId;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.crossOrigin = 'anonymous';

    script.onload = (): void => {
      setIsLoaded(true);
    };

    script.onerror = (): void => {
      console.error('Failed to load AdSense script');
    };

    document.head.appendChild(script);

    return (): void => {
      // Cleanup: remove script if component unmounts
      const scriptToRemove = document.getElementById(scriptId);

      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [clientId, isMounted]);

  const pushAds = (options?: { auto: boolean }): void => {
    if (!isMounted || !isLoaded) {
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
      console.error('Error pushing auto ads:', error);
    }
  };

  return { isLoaded, pushAds };
}
