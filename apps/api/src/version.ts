const GITHUB_REPO = 'BedrockTweaks/Files';

interface GitHubRelease {
  tag_name: string;
}

export async function fetchAppVersion(): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch version');
  }

  // @ts-expect-error - tag_name is guaranteed by GitHub API
  const data: GitHubRelease = await response.json();

  // Remove 'v' prefix if present
  return data.tag_name.replace(/^v/, '');
}
