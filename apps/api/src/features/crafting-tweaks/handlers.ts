import { getConfig } from '@/config';
import type { Context } from 'hono';
import { handleCreatePack } from '../shared/create-pack';
import { PACK_LISTING_CACHE_CONTROL } from '../shared/listing';
import { getPacksWithIcons } from '../shared/pack-icons';
import type { GeneratedPackResult, PacksResponse } from '../shared/responses';
import { assembleCraftingTweaks, finalizeCraftingTweaks } from './assembly';

export const handleGetCraftingTweaks = async (c: Context): Promise<PacksResponse> => {
  const config = getConfig();
  const packs = await getPacksWithIcons('crafting_tweaks', config);

  return c.json(packs, 200, {
    'Cache-Control': PACK_LISTING_CACHE_CONTROL,
  });
};

export const handleCreateCraftingTweak = async (c: Context): Promise<GeneratedPackResult> => handleCreatePack(c, 'crafting_tweaks', 'mcpack', assembleCraftingTweaks, finalizeCraftingTweaks);
