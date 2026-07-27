import { getConfig } from '@/config';
import type { Context } from 'hono';
import { handleCreatePack } from '../shared/create-pack';
import { PACK_LISTING_CACHE_CONTROL } from '../shared/listing';
import { getPacksWithIcons } from '../shared/pack-icons';
import type { GeneratedPackResult, PacksResponse } from '../shared/responses';
import { assembleResourcePacks, finalizeResourcePacks } from './assembly';

export const handleGetResourcePacks = async (c: Context): Promise<PacksResponse> => {
  const config = getConfig();
  const packs = await getPacksWithIcons('resource_packs', config);

  return c.json(packs, 200, {
    'Cache-Control': PACK_LISTING_CACHE_CONTROL,
  });
};

export const handleCreateResourcePack = async (c: Context): Promise<GeneratedPackResult> => handleCreatePack(c, 'resource_packs', 'mcpack', assembleResourcePacks, finalizeResourcePacks);
