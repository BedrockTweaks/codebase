import type { DownloadRequest, SectionResponse } from '@/models';
import type { GeneratedPackResponse } from '@bt/types';

export function getApiUrl(publicOnly: boolean = false): string {
  if (!publicOnly && typeof window === 'undefined') {
    // Server / SSR
    return process.env.API_URL!;
  }

  // Browser / public-facing
  return import.meta.env.VITE_API_URL!;
}

/**
 * Fetch section data (resource-packs, addons, or crafting-tweaks)
 * @param section - The section endpoint name
 */
export async function fetchSectionData(section: string): Promise<SectionResponse> {
  const response = await fetch(`${getApiUrl()}/api/${section}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${section}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a pack and return its static download URL
 * @param section - The section endpoint name
 * @param data - Download request with selected categories and packs
 * @returns Download URL and generated pack metadata
 */
export async function downloadPacks(
  section: string,
  data: DownloadRequest,
): Promise<GeneratedPackResponse> {
  const response = await fetch(`${getApiUrl()}/api/${section}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Handle JSON error response
    const errorJson = await response.json();

    throw new Error(errorJson.message || `Failed to download ${section}: ${response.statusText}`);
  }

  return response.json();
}

interface VersionResponse {
  version: string;
}

/**
 * Fetch the latest released version.
 *
 * The API caches the upstream GitHub lookup for a day and serves it with a
 * cache header, so visitors never call GitHub themselves and the release API's
 * unauthenticated rate limit is never a factor.
 */
export async function fetchLatestVersion(): Promise<string> {
  const response = await fetch(`${getApiUrl()}/api/version`);

  if (!response.ok) {
    throw new Error('Failed to fetch version');
  }

  const data: VersionResponse = await response.json();

  return data.version;
}
