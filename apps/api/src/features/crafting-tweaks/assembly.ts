import { copyFile, mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import type { AssemblePackCallback, FinalizePackCallback } from '../shared/assembly';
import { deepMergeJson, mergeLang, pathExists, SKIP_FILES } from '../shared/assembly';
import { getPacks } from '../shared/listing';
import { generateManifest } from '../shared/metadata';
import { createZipFromAssembledDirectory, finalizeZipToFile } from '../shared/zip';

export const assembleCraftingTweaks: AssemblePackCallback = async (
  packsPaths,
  assemblyDir,
  config,
) => {
  const { deepMergeFiles } = await getPacks('crafting_tweaks', config);
  const writtenFiles = new Set<string>();

  const copyDirectoryToAssembly = async (dirPath: string, basePath: string): Promise<void> => {
    const items = await readdir(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const relativePath = relative(basePath, fullPath);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await copyDirectoryToAssembly(fullPath, basePath);
      } else {
        if (
          writtenFiles.has(relativePath)
          || SKIP_FILES.includes(basename(relativePath))
          || deepMergeFiles.some(file => file.filename === basename(relativePath))
        ) {
          continue;
        }

        const destPath = join(assemblyDir, relativePath);

        await mkdir(join(destPath, '..'), { recursive: true });
        await copyFile(fullPath, destPath);
        writtenFiles.add(relativePath);
      }
    }
  };

  for (const packPath of packsPaths) {
    const fullPath = `${config.storageUrl}/crafting_tweaks/${packPath}`;

    if (await pathExists(fullPath)) {
      await copyDirectoryToAssembly(fullPath, fullPath);
    } else {
      console.error(`Directory ${fullPath} does not exist.`);
    }
  }

  for (const file of deepMergeFiles) {
    if (file.filepath.endsWith('.json')) {
      const mergedJson = deepMergeJson(file.filepath, packsPaths, config.storageUrl, 'crafting_tweaks');

      if (Object.keys(mergedJson).length > 0) {
        const destPath = join(assemblyDir, file.filepath);

        await mkdir(join(destPath, '..'), { recursive: true });
        await writeFile(destPath, JSON.stringify(mergedJson));
      }
    } else if (file.filepath.endsWith('.lang')) {
      const lang = mergeLang(file.filepath, packsPaths, config.storageUrl, 'crafting_tweaks');

      if (lang.length) {
        const destPath = join(assemblyDir, file.filepath);

        await mkdir(join(destPath, '..'), { recursive: true });
        await writeFile(destPath, lang);
      }
    }
  }
};

export const finalizeCraftingTweaks: FinalizePackCallback = async (
  createPackDto,
  assemblyDir,
  outputPath,
  downloadUrl,
  config,
) => {
  const manifest = await generateManifest(createPackDto, downloadUrl, 'crafting_tweaks', config);
  const zip = createZipFromAssembledDirectory(assemblyDir);

  zip.append(manifest, { name: 'manifest.json' });
  zip.file('./assets/images/pack_icon.png', { name: 'pack_icon.png' });
  zip.file('./assets/text/credits.txt', { name: 'credits.txt' });

  await finalizeZipToFile(zip, outputPath);
};
