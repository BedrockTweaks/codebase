import { getConfig } from '@/config';
import type { Context } from 'hono';
import { handleCreatePack } from '../shared/create-pack';
import { PACK_LISTING_CACHE_CONTROL } from '../shared/listing';
import { getPacksWithIcons } from '../shared/pack-icons';
import type { GeneratedPackResult, PacksResponse } from '../shared/responses';
import { assembleAddons, finalizeAddons } from './assembly';

export const handleGetAddons = async (c: Context): Promise<PacksResponse> => {
  const config = getConfig();
  const packs = await getPacksWithIcons('addons', config);

  return c.json(packs, 200, {
    'Cache-Control': PACK_LISTING_CACHE_CONTROL,
  });
};

export const handleCreateAddon = async (c: Context): Promise<GeneratedPackResult> => handleCreatePack(c, 'addons', 'mcaddon', assembleAddons, finalizeAddons);
