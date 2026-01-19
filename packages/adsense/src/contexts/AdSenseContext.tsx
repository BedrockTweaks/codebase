import { createContext, JSX, ReactNode, useContext } from 'react';

interface AdSenseContextValue {
  clientId: string;
}

const AdSenseContext = createContext<AdSenseContextValue | null>(null);

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
  return (
    <AdSenseContext value={{ clientId }}>
      {children}
    </AdSenseContext>
  );
}
