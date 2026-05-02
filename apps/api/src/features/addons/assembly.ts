import type { AssemblePackCallback, FinalizePackCallback } from '../shared/assembly';
import { createZipFromAssembledDirectory, finalizeZipToFile } from '../shared/zip';

export const assembleAddons: AssemblePackCallback = async (
  packsPaths,
  assemblyDir,
  config,
) => {
  void packsPaths;
  void assemblyDir;
  void config;

  // TODO Packs should be built at the moment of release
  // Copy all packs to cache dir and zip the whole directory without merging files
  // Since addons should be independent
};

export const finalizeAddons: FinalizePackCallback = async (
  _,
  assemblyDir,
  outputPath,
) => {
  const zip = createZipFromAssembledDirectory(assemblyDir);

  zip.file('./assets/text/credits.txt', { name: 'credits.txt' });

  await finalizeZipToFile(zip, outputPath);
};
