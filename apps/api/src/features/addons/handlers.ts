import { getConfig } from '@/config';
import type { Context } from 'hono';
import { handleCreatePack } from '../shared/create-pack';
import { getPacks } from '../shared/listing';
import type { GeneratedPackResult, PacksResponse } from '../shared/responses';
import { assembleAddons, finalizeAddons } from './assembly';

export const handleGetAddons = async (c: Context): Promise<PacksResponse> => {
  const config = getConfig();
  const packs = await getPacks('addons', config);

  return c.json(packs, 200, {
    'Cache-Control': 'no-store',
  });
};

export const handleCreateAddon = async (c: Context): Promise<GeneratedPackResult> => handleCreatePack(c, 'addons', 'mcaddon', assembleAddons, finalizeAddons);
