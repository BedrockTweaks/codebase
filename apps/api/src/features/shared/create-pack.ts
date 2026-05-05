import { getConfig } from '@/config';
import type { CreatePackDto, Section } from '@bt/types';
import type { Context } from 'hono';
import { type AssemblePackCallback, type FinalizePackCallback } from './assembly';
import {
  computeAssemblyCacheKey,
  evictDownloadsIfNeeded,
  generateDownloadId,
  getAssembledPackPath,
  getCachedAssembly,
  prepareDownloadPath,
  saveAssemblyCache,
} from './cache';
import { buildStaticDownloadUrl } from './download-url';
import { getPacksPaths } from './generation';
import type { GeneratedPackResult } from './responses';

type FileExtension = 'mcaddon' | 'mcpack';

export const handleCreatePack = async (
  c: Context,
  section: Section,
  extension: FileExtension,
  onAssemble: AssemblePackCallback,
  onFinalize: FinalizePackCallback,
): Promise<GeneratedPackResult> => {
  const config = getConfig();
  const createPackDto: CreatePackDto = await c.req.json();

  try {
    const assemblyKey = computeAssemblyCacheKey(section, createPackDto);
    const packsPaths = await getPacksPaths(createPackDto, section, config);

    let assembly = await getCachedAssembly(assemblyKey, packsPaths, section, config);

    if (!assembly) {
      const assemblyDir = getAssembledPackPath(assemblyKey, config);

      await onAssemble(packsPaths, assemblyDir, config);
      await saveAssemblyCache(assemblyKey, packsPaths, config);

      assembly = { dirPath: assemblyDir };
    }

    const downloadId = generateDownloadId();
    const filename = `${createPackDto.name}.${extension}`;
    const outputPath = await prepareDownloadPath(downloadId, filename, config);
    const forwardedProto = c.req.header('x-forwarded-proto');
    const downloadUrl = buildStaticDownloadUrl(c.req.url, section, downloadId, createPackDto.name, forwardedProto);

    await onFinalize(createPackDto, assembly.dirPath, outputPath, downloadUrl, config);

    void evictDownloadsIfNeeded(config);

    return c.json(
      {
        downloadUrl,
        packName: createPackDto.name,
      },
      200,
    );
  } catch (error) {
    console.error(`Error creating ${section} pack:`, error);

    return c.json(
      {
        message: 'Failed to generate pack. Please contact us on Discord',
        statusCode: 500,
      },
      500,
    );
  }
};
