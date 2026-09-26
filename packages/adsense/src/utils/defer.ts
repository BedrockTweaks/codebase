/**
 * Runs `callback` once the page has finished loading and the main thread is idle.
 *
 * Ad and consent scripts are the heaviest third parties on the page and they paint
 * over it, so loading them during the initial render window makes the consent dialog
 * the Largest Contentful Paint. Holding them until after `load` keeps the LCP window
 * to first-party content.
 *
 * Returns a function that cancels the pending callback.
 */
export function runWhenIdle(callback: () => void): () => void {
  let cancelled = false;

  const run = (): void => {
    if (cancelled) {
      return;
    }

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => {
        if (!cancelled) {
          callback();
        }
      }, { timeout: 3000 });

      return;
    }

    window.setTimeout(() => {
      if (!cancelled) {
        callback();
      }
    }, 1000);
  };

  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run, { once: true });
  }

  return (): void => {
    cancelled = true;
    window.removeEventListener('load', run);
  };
}
