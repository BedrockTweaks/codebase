import { createContext, JSX, ReactNode, useContext } from 'react';

interface GoogleAnalyticsContextValue {
  measurementId: string;
}

const GoogleAnalyticsContext = createContext<GoogleAnalyticsContextValue | null>(null);

export function useGoogleAnalyticsContext(): GoogleAnalyticsContextValue {
  const context = useContext(GoogleAnalyticsContext);

  if (!context) {
    throw new Error('useGoogleAnalyticsContext must be used within GoogleAnalyticsProvider');
  }

  return context;
}

interface GoogleAnalyticsProviderProps {
  measurementId: string;
  children: ReactNode;
}

/**
 * Provider component for Google Analytics configuration.
 * Wrap your application with this provider to configure the measurement ID.
 *
 * @example
 * ```tsx
 * <GoogleAnalyticsProvider measurementId={'G-XXXXXXXXXX'}>
 *   <App />
 * </GoogleAnalyticsProvider>
 * ```
 */
export function GoogleAnalyticsProvider({ measurementId, children }: GoogleAnalyticsProviderProps): JSX.Element {
  return (
    <GoogleAnalyticsContext value={{ measurementId }}>
      {children}
    </GoogleAnalyticsContext>
  );
}
