/**
 * Runs `callback` once the page has finished loading and the main thread is idle.
 *
 * Analytics has no effect on what the visitor sees, so its script competes with
 * first-party rendering for no user-visible gain. Holding it until after `load` keeps
 * the initial render window free.
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
