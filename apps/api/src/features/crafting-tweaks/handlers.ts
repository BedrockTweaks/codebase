import { getConfig } from '@/config';
import type { CreatePackDto } from '@bt/types';
import type { Context } from 'hono';
import { computeCacheKey, getCachedPack, getPackOutputPath, saveCachedPack } from '../shared/cache';
import { buildStaticDownloadUrl } from '../shared/download-url';
import { createPack, getPacksPaths } from '../shared/generation';
import { getPacks } from '../shared/listing';

export const handleGetCraftingTweaks = async (c: Context) => {
  const config = getConfig();
  const packs = await getPacks('crafting_tweaks', config);

  return c.json(packs, 200, {
    'Cache-Control': 'no-store',
  });
};

export const handleCreateCraftingTweak = async (c: Context) => {
  const config = getConfig();
  const createPackDto: CreatePackDto = await c.req.json();

  try {
    const filename = `${createPackDto.name}.mcpack`;

    const cacheKey = computeCacheKey('crafting_tweaks', createPackDto);
    const packsPaths = await getPacksPaths(createPackDto, 'crafting_tweaks', config);
    const cached = await getCachedPack(cacheKey, packsPaths, 'crafting_tweaks', config);

    if (cached) {
      const downloadUrl = buildStaticDownloadUrl(c.req.url, 'crafting_tweaks', cacheKey, createPackDto.name);

      return c.json(
        {
          downloadUrl,
          packName: createPackDto.name,
        },
        200,
      );
    }

    const outputPath = getPackOutputPath(cacheKey, config);
    const { packName } = await createPack(createPackDto, 'crafting_tweaks', outputPath, config);

    await saveCachedPack(cacheKey, filename, packsPaths, config);

    const downloadUrl = buildStaticDownloadUrl(c.req.url, 'crafting_tweaks', cacheKey, packName);

    return c.json(
      {
        downloadUrl,
        packName,
      },
      200,
    );
  } catch (error) {
    console.error('Error creating crafting tweak:', error);

    return c.json(
      {
        message: 'Failed to generate pack. Please contact us on Discord',
        statusCode: 500,
      },
      500,
    );
  }
};
