import type { Config } from '@/config';
import type {
  Category,
  Combination,
  CreatePackDto,
  PacksJSON,
  Section,
} from '@bt/types';
import { getPacks } from './listing';
import { generateManifest, generatePacksInfo } from './metadata';
import { createAddonsZip, createResourcePackZip, finalizeZipToFile } from './zip';

export const createPack = async (
  createPackDto: CreatePackDto,
  section: Section,
  outputPath: string,
  config: Config,
): Promise<{ packName: string }> => {
  const packsPaths = await getPacksPaths(createPackDto, section, config);
  const packsInfo = await generatePacksInfo(createPackDto, section, config);

  if (section === 'addons') {
    const zip = await createAddonsZip(section, packsPaths, config);

    zip.append(packsInfo, { name: 'packs.info' });
    zip.file('./assets/text/credits.txt', { name: 'credits.txt' });

    await finalizeZipToFile(zip, outputPath);

    return { packName: createPackDto.name };
  }

  // Resource Packs / Crafting Tweaks
  const manifest = await generateManifest(createPackDto.name, packsInfo, section, config);
  const zip = await createResourcePackZip(section, packsPaths, config);

  zip.append(manifest, { name: 'manifest.json' });
  zip.append(packsInfo, { name: 'packs.info' });
  zip.file('./assets/images/pack_icon.png', { name: 'pack_icon.png' });
  zip.file('./assets/text/credits.txt', { name: 'credits.txt' });

  await finalizeZipToFile(zip, outputPath);

  return { packName: createPackDto.name };
};

export const getRealPaths = (categories: Category[], combinations: Combination[]): string[] => {
  const finalPaths: string[] = [];

  // Collect all packs from all categories with their full paths and priorities
  const allPacks = categories.flatMap(category =>
    category.packs.map(pack => ({
      id: pack.id,
      path: `${category.id}/${pack.id}`,
      priority: pack.priority ?? 0,
    })),
  );

  // Sort all packs by their priority (higher priority first)
  allPacks.sort((a, b) => b.priority - a.priority);

  // Map the sorted packs to their paths
  const sortedPackPaths = allPacks.map(pack => `files/${pack.path}`);

  // Sort combinations by the number of packs they combine, in descending order
  const sortedCombinations = [...combinations].sort((a, b) => b.combines.length - a.combines.length);

  // Keep track of which combination packs have been added
  const combinationPaths: string[] = [];

  for (const combination of sortedCombinations) {
    // Check if all packs in the combination are present in the sorted packs list
    if (combination.combines.every(packPath => allPacks.some(pack => pack.path === packPath))) {
      combinationPaths.push(combination.id);
    }
  }

  // Add combination packs to the final paths
  finalPaths.push(...combinationPaths);

  // Add all sorted packs to the final paths
  finalPaths.push(...sortedPackPaths);

  return finalPaths;
};

export const getPacksPaths = async (
  createPackDto: CreatePackDto,
  section: Section,
  config: Config,
): Promise<string[]> => {
  const categories = await convertToCategories(createPackDto, section, config);
  const allCombinations = (await getPacks(section, config)).combinations;

  return getRealPaths(categories, allCombinations);
};

const convertToCategories = async (
  createPackDto: CreatePackDto,
  section: Section,
  config: Config,
): Promise<Category[]> => {
  const packsJSON: PacksJSON = await getPacks(section, config);

  return createPackDto.categories.map((categoryDto) => {
    const fullCategory = packsJSON.categories.find(category => category.id === categoryDto.id);

    if (!fullCategory) {
      throw new Error(`Category with id ${categoryDto.id} not found.`);
    }

    const filteredPacks = fullCategory.packs.filter(pack => categoryDto.packs.includes(pack.id));

    return {
      ...fullCategory,
      packs: filteredPacks,
    };
  });
};
