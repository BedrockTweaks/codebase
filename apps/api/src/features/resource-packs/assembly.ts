import AdmZip from 'adm-zip';
import archiver from 'archiver';
import { createReadStream } from 'node:fs';
import { readFile, readdir, rename, stat } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import type { AssemblePackCallback, FinalizePackCallback } from '../shared/assembly';
import { deepMergeJson, mergeLang, pathExists, SKIP_FILES } from '../shared/assembly';
import { getPacks } from '../shared/listing';
import { generateManifest } from '../shared/metadata';
import { finalizeZipToFile } from '../shared/zip';

export const assembleResourcePacks: AssemblePackCallback = async (
  packsPaths,
  assemblyZipPath,
  config,
) => {
  const { deepMergeFiles } = await getPacks('resource_packs', config);
  const zip = archiver('zip');
  const writtenFiles = new Set<string>();
  let hasContent = false;

  const addDirectoryToZip = async (dirPath: string, basePath: string): Promise<void> => {
    const items = await readdir(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const relativePath = relative(basePath, fullPath);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await addDirectoryToZip(fullPath, basePath);
      } else {
        if (
          writtenFiles.has(relativePath)
          || SKIP_FILES.includes(basename(relativePath))
          || deepMergeFiles.some(file => file.filepath === relativePath)
        ) {
          continue;
        }

        zip.append(createReadStream(fullPath), { name: relativePath });
        writtenFiles.add(relativePath);
        hasContent = true;
      }
    }
  };

  for (const packPath of packsPaths) {
    const fullPath = `${config.storageUrl}/resource_packs/${packPath}`;

    if (await pathExists(fullPath)) {
      await addDirectoryToZip(fullPath, fullPath);
    } else {
      console.error(`Directory ${fullPath} does not exist.`);
    }
  }

  for (const file of deepMergeFiles) {
    if (file.filepath.endsWith('.json')) {
      const mergedJson = deepMergeJson(file.filepath, packsPaths, config.storageUrl, 'resource_packs');

      if (Object.keys(mergedJson).length > 0) {
        zip.append(Buffer.from(JSON.stringify(mergedJson)), { name: file.filepath });
        hasContent = true;
      }
    } else if (file.filepath.endsWith('.lang')) {
      const lang = mergeLang(file.filepath, packsPaths, config.storageUrl, 'resource_packs');

      if (lang.length) {
        zip.append(Buffer.from(lang), { name: file.filepath });
        hasContent = true;
      }
    }
  }

  if (!hasContent) {
    throw new Error('No resource pack outputs were found for the selected packs.');
  }

  await finalizeZipToFile(zip, assemblyZipPath);
};

export const finalizeResourcePacks: FinalizePackCallback = async (
  createPackDto,
  assemblyZipPath,
  outputPath,
  downloadUrl,
  config,
) => {
  const manifest = await generateManifest(createPackDto, downloadUrl, 'resource_packs', config);
  const [packIconBuffer, creditsBuffer] = await Promise.all([
    readFile('./assets/images/pack_icon.png'),
    readFile('./assets/text/credits.txt'),
  ]);
  const zip = new AdmZip(assemblyZipPath);

  zip.addFile('manifest.json', Buffer.from(manifest));
  zip.addFile('pack_icon.png', packIconBuffer);
  zip.addFile('credits.txt', creditsBuffer);

  const tmpPath = `${outputPath}.tmp`;

  zip.writeZip(tmpPath);
  await rename(tmpPath, outputPath);
};
