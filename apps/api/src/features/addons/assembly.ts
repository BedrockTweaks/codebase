import AdmZip from 'adm-zip';
import archiver from 'archiver';
import { readFile, readdir, rename } from 'node:fs/promises';
import { join } from 'node:path';
import type { AssemblePackCallback, FinalizePackCallback } from '../shared/assembly';
import { pathExists } from '../shared/assembly';
import { generateManifest, type ManifestDependency } from '../shared/metadata';
import { finalizeZipToFile } from '../shared/zip';

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

const getAddonPackDependencies = (zip: AdmZip): ManifestDependency[] => {
  const bpManifestEntries = zip.getEntries()
    .filter(e => !e.isDirectory && /^[^/]+_bp\/manifest\.json$/.test(e.entryName))
    .sort((a, b) => a.entryName.localeCompare(b.entryName));

  const dependencies: ManifestDependency[] = [];

  for (const entry of bpManifestEntries) {
    const content = entry.getData().toString('utf8');
    const dep = extractDependencyFromManifest(content);

    if (!dep) {
      console.warn(`Addon pack manifest at ${entry.entryName} is invalid. Skipping dependency entry.`);

      continue;
    }

    dependencies.push(dep);
  }

  return dependencies;
};

export const assembleAddons: AssemblePackCallback = async (
  packsPaths,
  assemblyZipPath,
  config,
) => {
  const zip = archiver('zip');
  const writtenDirs = new Set<string>();

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

      if (writtenDirs.has(entry.name)) {
        throw new Error(`Duplicate addon output folder ${entry.name} found while assembling addons.`);
      }

      const sourcePath = join(builtPackRootPath, entry.name);

      zip.directory(sourcePath, entry.name);
      writtenDirs.add(entry.name);
    }
  }

  if (writtenDirs.size === 0) {
    throw new Error('No addon outputs were found for the selected packs.');
  }

  await finalizeZipToFile(zip, assemblyZipPath);
};

export const finalizeAddons: FinalizePackCallback = async (
  createPackDto,
  assemblyZipPath,
  outputPath,
  downloadUrl,
  config,
) => {
  const addonPackFolderName = sanitizePackNameForFolder(createPackDto.name);
  const zip = new AdmZip(assemblyZipPath);
  const dependencies = getAddonPackDependencies(zip);

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
  const [packIconBuffer, creditsBuffer] = await Promise.all([
    readFile('./assets/images/pack_icon.png'),
    readFile('./assets/text/credits.txt'),
  ]);

  zip.addFile(`${addonPackFolderName}/manifest.json`, Buffer.from(manifest));
  zip.addFile(`${addonPackFolderName}/pack_icon.png`, packIconBuffer);
  zip.addFile('credits.txt', creditsBuffer);

  const tmpPath = `${outputPath}.tmp`;

  zip.writeZip(tmpPath);
  await rename(tmpPath, outputPath);
};
