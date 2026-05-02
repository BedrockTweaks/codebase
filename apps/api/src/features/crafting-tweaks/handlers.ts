import { getConfig } from '@/config';
import type { Context } from 'hono';
import { handleCreatePack } from '../shared/create-pack';
import { getPacks } from '../shared/listing';
import type { GeneratedPackResult, PacksResponse } from '../shared/responses';
import { assembleCraftingTweaks, finalizeCraftingTweaks } from './assembly';

export const handleGetCraftingTweaks = async (c: Context): Promise<PacksResponse> => {
  const config = getConfig();
  const packs = await getPacks('crafting_tweaks', config);

  return c.json(packs, 200, {
    'Cache-Control': 'no-store',
  });
};

export const handleCreateCraftingTweak = async (c: Context): Promise<GeneratedPackResult> => handleCreatePack(c, 'crafting_tweaks', 'mcpack', assembleCraftingTweaks, finalizeCraftingTweaks);
