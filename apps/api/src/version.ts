import { getConfig } from '@/config';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const GITHUB_REPO = 'BedrockTweaks/Files';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// GitHub allows 60 unauthenticated calls an hour per IP. Without a cooldown a
// failed lookup is retried on every pack generation, which burns the quota and
// keeps the failure going.
const FAILED_LOOKUP_RETRY_MS = 5 * 60 * 1000;

interface GitHubRelease {
  tag_name: string;
}

interface VersionCache {
  version: string;
  fetchedAt: number;
  fromFallback: boolean;
}

let versionCache: VersionCache | null = null;
let inFlightLookup: Promise<string> | null = null;

const getVersionFilePath = (): string => {
  const config = getConfig();
  const cacheDir = config.cacheDir ?? join(tmpdir(), 'bedrock-tweaks-cache');

  return join(cacheDir, '.version');
};

const readPersistedVersion = async (): Promise<string | null> => {
  try {
    const content = await fs.readFile(getVersionFilePath(), 'utf-8');

    return content.trim() || null;
  } catch {
    return null;
  }
};

const persistVersion = async (version: string): Promise<void> => {
  try {
    await fs.writeFile(getVersionFilePath(), version, 'utf-8');
  } catch (error) {
    console.warn('Failed to persist version to disk:', error);
  }
};

const isFresh = (cache: VersionCache): boolean =>
  Date.now() - cache.fetchedAt < (cache.fromFallback ? FAILED_LOOKUP_RETRY_MS : CACHE_TTL_MS);

const fallbackVersion = async (): Promise<string> => {
  const persisted = await readPersistedVersion();

  return persisted ?? versionCache?.version ?? 'unknown';
};

const lookupVersion = async (): Promise<string> => {
  let response: Response;

  try {
    response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
  } catch (error) {
    console.warn('Failed to reach GitHub for version, using persisted fallback:', error);

    const fallback = await fallbackVersion();

    versionCache = { version: fallback, fetchedAt: Date.now(), fromFallback: true };

    return fallback;
  }

  if (!response.ok) {
    console.warn(`Failed to fetch version from GitHub (status ${response.status}), using persisted fallback`);

    const fallback = await fallbackVersion();

    versionCache = { version: fallback, fetchedAt: Date.now(), fromFallback: true };

    return fallback;
  }

  // @ts-expect-error - tag_name is guaranteed by GitHub API
  const data: GitHubRelease = await response.json();

  const version = data.tag_name.replace(/^v/, '');

  versionCache = { version, fetchedAt: Date.now(), fromFallback: false };
  await persistVersion(version);

  return version;
};

/**
 * One GitHub lookup per process per day, shared by every request. Concurrent
 * callers join the lookup already running instead of starting their own.
 */
export async function fetchAppVersion(): Promise<string> {
  if (versionCache !== null && isFresh(versionCache)) {
    return versionCache.version;
  }

  inFlightLookup ??= lookupVersion().finally(() => {
    inFlightLookup = null;
  });

  return inFlightLookup;
}
