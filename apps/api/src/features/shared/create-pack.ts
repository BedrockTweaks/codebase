import { getConfig } from '@/config';
import type { CreatePackDto, Section } from '@bt/types';
import type { Context } from 'hono';
import { type AssemblePackCallback, type FinalizePackCallback } from './assembly';
import {
  computeAssemblyCacheKey,
  evictAssemblyCacheIfNeeded,
  evictDownloadsIfNeeded,
  generateDownloadId,
  getAssembledPackPath,
  getCachedAssembly,
  prepareDownloadPath,
  runExclusiveAssembly,
  saveAssemblyCache,
} from './cache';
import { buildStaticDownloadUrl, sanitizeFileNameSegment } from './download-url';
import { getPacksPaths } from './generation';
import type { GeneratedPackResult } from './responses';
import { InvalidSelectionError } from './selection-error';

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
      const assemblyZipPath = getAssembledPackPath(assemblyKey, config);

      await runExclusiveAssembly(assemblyKey, async () => {
        await onAssemble(packsPaths, assemblyZipPath, config);
        await saveAssemblyCache(assemblyKey, packsPaths, config);
      });

      assembly = { zipPath: assemblyZipPath };
    }

    const downloadId = generateDownloadId();
    const safeName = sanitizeFileNameSegment(createPackDto.name);
    const filename = `${safeName}.${extension}`;
    const outputPath = await prepareDownloadPath(downloadId, filename, config);
    const forwardedProto = c.req.header('x-forwarded-proto');
    const downloadUrl = buildStaticDownloadUrl(c.req.url, section, downloadId, createPackDto.name, forwardedProto);

    await onFinalize(createPackDto, assembly.zipPath, outputPath, downloadUrl, config);

    // Both run after finalize so eviction cannot delete the assembly it reads.
    void evictAssemblyCacheIfNeeded(config);
    void evictDownloadsIfNeeded(config);

    return c.json(
      {
        downloadUrl,
        packName: createPackDto.name,
      },
      200,
    );
  } catch (error) {
    // The client sent a selection packs.json does not offer, so this is not
    // something a Discord ticket can help with.
    if (error instanceof InvalidSelectionError) {
      return c.json(
        {
          message: error.message,
          statusCode: 400,
        },
        400,
      );
    }

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
