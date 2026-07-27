import { JSX, useEffect, useRef, useState } from 'react';
import { useAdSenseContext } from '../contexts/AdSenseContext';
import { useAdSense } from '../hooks/useAdSense';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | undefined;
  responsive?: boolean;
  style?: React.CSSProperties;
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
  style = { display: 'block' },
}: AdSenseProps): JSX.Element | null {
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

  // Don't render during SSR
  if (!isMounted) {
    return null;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ins
        ref={insRef}
        className={'adsbygoogle'}
        style={style}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}
