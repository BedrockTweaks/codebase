import { JSX, useEffect, useState } from 'react';
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

  // Ensure client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Push ad to the specific ins element when script loads
  useEffect(() => {
    if (!isMounted || !isLoaded) {
      return;
    }

    try {
      pushAds();
    } catch (error) {
      console.error('Error initializing ad:', error);
    }
  }, [isLoaded, isMounted, pushAds]);

  // Don't render during SSR
  if (!isMounted) {
    return null;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ins
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
