import type { Config } from '@/config';
import type {
  Category,
  Combination,
  CreatePackDto,
  Pack,
  PacksJSON,
  Section,
} from '@bt/types';
import { getPacks } from './listing';
import { InvalidSelectionError } from './selection-error';

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

/**
 * Resolves the selection against packs.json, collecting every problem rather
 * than failing on the first, so one response tells the client everything that
 * drifted after a packs.json update.
 */
const convertToCategories = async (
  createPackDto: CreatePackDto,
  section: Section,
  config: Config,
): Promise<Category[]> => {
  const packsJSON: PacksJSON = await getPacks(section, config);
  const unknownCategories: string[] = [];
  const unknownPacks: string[] = [];
  const disabledPacks: string[] = [];
  const categories: Category[] = [];

  for (const categoryDto of createPackDto.categories) {
    const fullCategory = packsJSON.categories.find(category => category.id === categoryDto.id);

    if (!fullCategory) {
      unknownCategories.push(categoryDto.id);

      continue;
    }

    const packs: Pack[] = [];

    for (const packId of categoryDto.packs) {
      const pack = fullCategory.packs.find(candidate => candidate.id === packId);

      if (!pack) {
        unknownPacks.push(`${categoryDto.id}/${packId}`);
      } else if (pack.disabled) {
        disabledPacks.push(`${categoryDto.id}/${packId}`);
      } else {
        packs.push(pack);
      }
    }

    categories.push({ ...fullCategory, packs });
  }

  const requestedPacks = createPackDto.categories.reduce((total, category) => total + category.packs.length, 0);

  if (requestedPacks === 0 || unknownCategories.length > 0 || unknownPacks.length > 0 || disabledPacks.length > 0) {
    throw new InvalidSelectionError({
      unknownCategories,
      unknownPacks,
      disabledPacks,
      empty: requestedPacks === 0,
    });
  }

  return categories;
};
