import { sendPageView } from '@bt/analytics';
import { useRouterState } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

/**
 * Configuring the GA tag already reports the URL the visitor landed on, so the
 * first href is skipped and only later navigations are reported.
 */
export function usePageViewTracking(): void {
  const href = useRouterState({ select: state => state.location.href });
  const reportedHref = useRef<string | null>(null);

  useEffect(() => {
    if (reportedHref.current === null) {
      reportedHref.current = href;

      return;
    }

    if (reportedHref.current === href) {
      return;
    }

    reportedHref.current = href;

    sendPageView(window.location.href);
  }, [href]);
}
