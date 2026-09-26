const STORAGE_KEY = 'bt-anonymous-id';

/**
 * A random identifier with no link to anything the visitor does elsewhere. It exists
 * so Sentry can count how many people an issue affects: without it every issue reports
 * zero users impacted, and 1000 events from one visitor in a reload loop looks the same
 * as 1000 visitors hitting the bug once.
 */
function createId(): string {
  if (typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Older in-app webviews — a large share of this site's mobile traffic — expose
  // getRandomValues but not randomUUID.
  if (typeof crypto?.getRandomValues === 'function') {
    const bytes = crypto.getRandomValues(new Uint8Array(16));

    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
}

/**
 * Returns the visitor's anonymous id, creating and persisting one on first visit.
 *
 * Reading and writing localStorage throws outright in some privacy modes and in
 * webviews with storage disabled, so every access is guarded. A visitor whose storage
 * is unavailable still gets an id for the life of the page; their events just do not
 * group with their next visit, which is better than reporting no user at all.
 */
export function getAnonymousId(): string {
  let stored: string | null;

  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return createId();
  }

  if (stored) {
    return stored;
  }

  const id = createId();

  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Storage is readable but not writable; the id lasts for this page only.
  }

  return id;
}
