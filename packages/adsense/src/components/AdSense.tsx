import { JSX, useEffect, useRef, useState } from 'react';
import { useAdSenseContext } from '../contexts/AdSenseContext';
import { useAdSense } from '../hooks/useAdSense';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | undefined;
  responsive?: boolean;
  style?: React.CSSProperties;
  /**
   * Height held for the slot before Google fills it. Must be at least as tall as the
   * tallest creative the slot serves, or the difference shifts the page when the ad
   * arrives; a shorter creative only leaves whitespace.
   */
  reservedHeight?: number | string;
}

/**
 * Reusable Google AdSense component that handles SSR hydration issues.
 * Automatically refreshes ads on route changes.
 *
 * @example
 * ```tsx
 * <AdSense
 *   slot="1234567890"
 *   format="auto"
 *   responsive={true}
 * />
 * ```
 */
export function AdSense({
  slot,
  format = 'auto',
  responsive = true,
  reservedHeight = 280,
  style,
}: AdSenseProps): JSX.Element {
  const { clientId } = useAdSenseContext();
  const { isLoaded, pushAds } = useAdSense();
  const [isMounted, setIsMounted] = useState(false);
  const insRef = useRef<HTMLModElement>(null);

  // Ensure client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Push ad to the specific ins element when script loads
  useEffect(() => {
    if (!isMounted || !isLoaded) {
      return;
    }

    // AdSense stamps data-adsbygoogle-status on a slot once it claims it, and logs
    // "All 'ins' elements ... already have ads in them" if the same slot is pushed
    // twice. A re-mount gets a fresh <ins>, so this only suppresses the redundant push.
    if (insRef.current?.dataset['adsbygoogleStatus']) {
      return;
    }

    pushAds();
  }, [isLoaded, isMounted, pushAds]);

  // The box is rendered on the server and stays the same size through hydration and
  // through the ad arriving, so none of those three steps moves the content below it.
  // Only the <ins> is client-only: adsbygoogle.js mutates it, which would not survive
  // hydration.
  return (
    <div style={{ display: 'block', width: '100%', minHeight: reservedHeight, ...style }}>
      {isMounted && (
        <ins
          ref={insRef}
          className={'adsbygoogle'}
          style={{ display: 'block', width: '100%' }}
          data-ad-client={clientId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive.toString()}
        />
      )}
    </div>
  );
}
