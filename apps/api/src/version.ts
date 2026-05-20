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

export async function fetchAppVersion(): Promise<string> {
  const now = Date.now();

  if (versionCache !== null && now - versionCache.fetchedAt < CACHE_TTL_MS) {
    return versionCache.version;
  }

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
  );

  if (!response.ok) {
    console.warn(`Failed to fetch version from GitHub (status ${response.status}), using fallback version`);

    // Temporal should be fixed once we are out of rate limits
    return '5.2.4';
  }

  // @ts-expect-error - tag_name is guaranteed by GitHub API
  const data: GitHubRelease = await response.json();

  // Remove 'v' prefix if present
  const version = data.tag_name.replace(/^v/, '');

  versionCache = { version, fetchedAt: now };

  return version;
}
