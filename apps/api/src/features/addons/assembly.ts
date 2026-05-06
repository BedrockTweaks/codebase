import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { AssemblePackCallback, FinalizePackCallback } from '../shared/assembly';
import { copyDirectoryRecursive, pathExists } from '../shared/assembly';
import { generateManifest, type ManifestDependency } from '../shared/metadata';
import { createZipFromAssembledDirectory, finalizeZipToFile } from '../shared/zip';

const DEFAULT_VERSION = [1, 0, 0] as const;

interface Manifest {
  header: {
    uuid: string;
    version?: number[];
  };
}

const sanitizePackNameForFolder = (name: string): string => {
  const sanitizedName = name
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (sanitizedName.length === 0) {
    return 'addon';
  }

  return sanitizedName;
};

const extractDependencyFromManifest = (manifestContent: string): ManifestDependency | null => {
  try {
    const manifest = JSON.parse(manifestContent) satisfies Manifest;

    if (!manifest.header.uuid) {
      return null;
    }

    return {
      uuid: manifest.header.uuid,
      version: manifest.header.version || [...DEFAULT_VERSION],
    };
  } catch {
    return null;
  }
};

const getAddonPackDependencies = async (assemblyDir: string): Promise<ManifestDependency[]> => {
  const entries = await readdir(assemblyDir, { withFileTypes: true });
  const behaviorPackDirs = entries
    .filter(entry => entry.isDirectory() && entry.name.endsWith('_bp'))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const dependencies: ManifestDependency[] = [];

  for (const behaviorPackDir of behaviorPackDirs) {
    const manifestPath = join(assemblyDir, behaviorPackDir, 'manifest.json');

    if (!(await pathExists(manifestPath))) {
      console.warn(`Addon pack manifest not found at ${manifestPath}. Skipping dependency entry.`);

      continue;
    }

    const manifestContent = await readFile(manifestPath, 'utf8');
    const dependency = extractDependencyFromManifest(manifestContent);

    if (!dependency) {
      console.warn(`Addon pack manifest at ${manifestPath} is invalid. Skipping dependency entry.`);

      continue;
    }

    dependencies.push(dependency);
  }

  return dependencies;
};

export const assembleAddons: AssemblePackCallback = async (
  packsPaths,
  assemblyDir,
  config,
) => {
  for (const packPath of packsPaths) {
    if (!packPath.startsWith('files/')) {
      continue;
    }

    const builtPackRootPath = join(
      config.storageUrl,
      'addons',
      packPath,
      'build',
      'bedrock-tweaks',
    );

    if (!(await pathExists(builtPackRootPath))) {
      console.warn(`Addon build directory ${builtPackRootPath} does not exist. Skipping.`);

      continue;
    }

    const builtEntries = await readdir(builtPackRootPath, { withFileTypes: true });

    for (const entry of builtEntries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const sourcePath = join(builtPackRootPath, entry.name);
      const destinationPath = join(assemblyDir, entry.name);

      if (await pathExists(destinationPath)) {
        throw new Error(`Duplicate addon output folder ${entry.name} found while assembling addons.`);
      }

      await copyDirectoryRecursive(sourcePath, destinationPath);
    }
  }

  if (!(await pathExists(assemblyDir))) {
    throw new Error('No addon outputs were found for the selected packs.');
  }
};

export const finalizeAddons: FinalizePackCallback = async (
  createPackDto,
  assemblyDir,
  outputPath,
  downloadUrl,
  config,
) => {
  const addonPackFolderName = sanitizePackNameForFolder(createPackDto.name);
  const dependencies = await getAddonPackDependencies(assemblyDir);

  if (dependencies.length === 0) {
    throw new Error('No addon pack dependencies were found in assembled output.');
  }

  const manifest = await generateManifest(
    createPackDto,
    downloadUrl,
    'addons',
    config,
    { dependencies },
  );
  const zip = createZipFromAssembledDirectory(assemblyDir);

  zip.append(manifest, { name: `${addonPackFolderName}/manifest.json` });
  zip.file('./assets/images/pack_icon.png', { name: `${addonPackFolderName}/pack_icon.png` });
  zip.file('./assets/text/credits.txt', { name: 'credits.txt' });

  await finalizeZipToFile(zip, outputPath);
};
