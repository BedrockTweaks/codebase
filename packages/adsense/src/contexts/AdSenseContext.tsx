import { createContext, JSX, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

interface AdSenseContextValue {
  clientId: string;
  /** True once Google's adsbygoogle.js has executed; pushing before then is a no-op. */
  isLoaded: boolean;
}

const AdSenseContext = createContext<AdSenseContextValue | null>(null);

const SCRIPT_ID = 'bt-adsbygoogle-script';

export function useAdSenseContext(): AdSenseContextValue {
  const context = useContext(AdSenseContext);

  if (!context) {
    throw new Error('useAdSenseContext must be used within AdSenseProvider');
  }

  return context;
}

interface AdSenseProviderProps {
  clientId: string;
  children: ReactNode;
}

/**
 * Provider component for AdSense configuration.
 * Wrap your application with this provider to avoid passing clientId to each component.
 *
 * @example
 * ```tsx
 * <AdSenseProvider clientId="ca-pub-xxxxxxxxxxxxxxxx">
 *   <App />
 * </AdSenseProvider>
 * ```
 */
export function AdSenseProvider({ clientId, children }: AdSenseProviderProps): JSX.Element {
  const [isLoaded, setIsLoaded] = useState(false);

  // The provider owns the script element. This used to live in useAdSense, which three
  // components call, so each of them created-or-adopted the same element *and* removed
  // it on unmount: the first slot to unmount tore the script out from under the others.
  useEffect(() => {
    const existing = document.getElementById(SCRIPT_ID);

    if (existing) {
      setIsLoaded(true);

      return;
    }

    const script = document.createElement('script');

    script.id = SCRIPT_ID;
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

    // Deliberately no cleanup: adsbygoogle.js has already patched window.adsbygoogle by
    // the time it runs, so removing the tag undoes nothing and only breaks consumers
    // that mount later.
  }, [clientId]);

  const value = useMemo(() => ({ clientId, isLoaded }), [clientId, isLoaded]);

  return (
    <AdSenseContext value={value}>
      {children}
    </AdSenseContext>
  );
}
