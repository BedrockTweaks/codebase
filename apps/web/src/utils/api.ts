import type { DownloadRequest, SectionResponse } from '@/models';

// Support both client-side (import.meta.env) and server-side (process.env) runtime
export const API_URL = import.meta.env.SSR ? import.meta.env.VITE_API_URL : process.env.VITE_API_URL;
const GITHUB_REPO = 'BedrockTweaks/Files';

/**
 * Fetch section data (resource-packs, addons, or crafting-tweaks)
 * @param section - The section endpoint name
 */
export async function fetchSectionData(section: string): Promise<SectionResponse> {
  const response = await fetch(`${API_URL}/api/${section}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${section}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Download selected packs as a zip file
 * @param section - The section endpoint name
 * @param data - Download request with selected categories and packs
 */
export async function downloadPacks(section: string, data: DownloadRequest): Promise<Blob> {
  const response = await fetch(`${API_URL}/api/${section}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Handle blob error response
    const blob = await response.blob();

    if (blob.type === 'application/json') {
      const text = await blob.text();
      const errorJson = JSON.parse(text);

      throw errorJson;
    }

    throw new Error(`Failed to download ${section}: ${response.statusText}`);
  }

  return response.blob();
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
}

/**
 * Fetch the latest version from GitHub releases
 */
export async function fetchLatestVersion(): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch version');
  }

  const data: GitHubRelease = await response.json();

  // Remove 'v' prefix if present
  return data.tag_name.replace(/^v/, '');
}
