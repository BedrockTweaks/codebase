import { getConfig } from '@/config';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const GITHUB_REPO = 'BedrockTweaks/Files';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface GitHubRelease {
  tag_name: string;
}

interface VersionCache {
  version: string;
  fetchedAt: number;
}

let versionCache: VersionCache | null = null;

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

export async function fetchAppVersion(): Promise<string> {
  const now = Date.now();

  if (versionCache !== null && now - versionCache.fetchedAt < CACHE_TTL_MS) {
    return versionCache.version;
  }

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
  );

  if (!response.ok) {
    console.warn(`Failed to fetch version from GitHub (status ${response.status}), using cached or persisted fallback`);

    if (versionCache !== null) {
      return versionCache.version;
    }

    const persisted = await readPersistedVersion();

    if (persisted !== null) {
      return persisted;
    }

    return 'unknown';
  }

  // @ts-expect-error - tag_name is guaranteed by GitHub API
  const data: GitHubRelease = await response.json();

  const version = data.tag_name.replace(/^v/, '');

  versionCache = { version, fetchedAt: now };
  await persistVersion(version);

  return version;
}
