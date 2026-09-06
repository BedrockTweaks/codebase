import { fetchAppVersion } from '@/version';
import type { Context } from 'hono';
import type { TypedResponse } from 'hono';

export type VersionResponse = TypedResponse<{ version: string }, 200, 'json'>;

// The lookup behind this is cached for a day, so the response can be held for
// an hour by browsers and stay well ahead of the upstream refresh.
const VERSION_CACHE_CONTROL = 'public, max-age=3600, stale-while-revalidate=86400';

export const handleGetVersion = async (c: Context): Promise<VersionResponse> => {
  const version = await fetchAppVersion();

  return c.json({ version }, 200, {
    'Cache-Control': VERSION_CACHE_CONTROL,
  });
};
