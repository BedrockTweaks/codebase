import type { DownloadRequest, SectionResponse } from '@/models';

const API_URL = import.meta.env.VITE_API_URL || '';

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
