import type { Config } from '@/config';
import { packsJSONSchema, type PacksJSON, type Section } from '@bt/types';
import { promises as fs } from 'node:fs';

/**
 * Pack listings only change when the Files repo is redeployed, so a short shared
 * cache lets reloads be absorbed by the browser/CDN instead of re-fetching ~86 KB
 * of JSON. `no-store` made every visit pay for it.
 */
export const PACK_LISTING_CACHE_CONTROL = 'public, max-age=60, stale-while-revalidate=300';

export const packsFilePath = (section: Section, config: Config): string => `${config.storageUrl}/${section}/packs.json`;

export const getPacks = async (section: Section, config: Config): Promise<PacksJSON> => {
  const filePath = packsFilePath(section, config);
  const data = await fs.readFile(filePath, 'utf-8');
  const parsed: unknown = JSON.parse(data);

  return packsJSONSchema.parse(parsed);
};
