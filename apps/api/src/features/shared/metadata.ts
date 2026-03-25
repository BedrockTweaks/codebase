import { v4 as uuidv4 } from 'uuid';
import type { Config } from '@/config';
import type {
  CreatePackDto,
  PacksJSON,
  Section,
} from '@bt/types';
import { getPacks } from './listing';

export const generatePacksInfo = async (
  createPackDto: CreatePackDto,
  section: Section,
  config: Config,
): Promise<string> => {
  const packs = await getPacks(section, config);
  let packsInfo = 'Selected Packs:\n';

  createPackDto.categories.forEach((category) => {
    packsInfo += getCategoryName(packs, category.id);

    category.packs.forEach((packId) => {
      packsInfo += getPackName(packs, category.id, packId);
    });
  });

  // Collect all packs from all categories with their full paths
  const allPacks = createPackDto.categories.flatMap(category =>
    category.packs.map(pack => ({
      id: pack,
      path: `${category.id}/${pack}`,
    })),
  );

  let hasCombinations = false;

  for (const combination of packs.combinations) {
    // Check if all packs in the combination are present in the sorted packs list
    if (combination.combines.every(packPath => allPacks.some(pack => pack.path === packPath))) {
      if (!hasCombinations) {
        packsInfo += '\nCombinations:';
        hasCombinations = true;
      }

      // Add the combination to the combination paths
      packsInfo += `\n - ${combination.id}`;
    }
  }

  return packsInfo;
};

export const generateManifest = async (
  packName: string,
  packsInfo: string,
  section: Section,
  config: Config,
): Promise<string> => {
  const packs = await getPacks(section, config);
  let manifest;

  switch (section) {
    case 'resource_packs':
      manifest = generateBaseManifest(
        packName.replace('.mcpack', ''),
        `Bedrock Tweaks §aResource Packs§r\n${packsInfo}`,
        'resources',
        packs.version,
        config,
      );

      break;
    case 'crafting_tweaks':
      manifest = generateBaseManifest(
        packName.replace('.mcpack', ''),
        `Bedrock Tweaks §eCrafting Tweaks§r\n${packsInfo}`,
        'data',
        packs.version,
        config,
      );

      break;
    default:
      throw new Error(`Manifest generation not supported for section: ${section}`);
  }

  return JSON.stringify(manifest, null, '\t');
};

const getCategoryName = (packs: PacksJSON, categoryId: string): string => `- ${packs.categories.find(packCategory => packCategory.id === categoryId)?.name}:\n`;

const getPackName = (packs: PacksJSON, categoryId: string, packId: string): string => ` - ${packs.categories
  .find(packCategory => packCategory.id === categoryId)?.packs
  .find(pack => pack.id === packId)?.name}\n`;

const generateBaseManifest = (
  name: string,
  description: string,
  type: string,
  version: number[],
  config: Config,
): object => {
  const authors = config.metadataAuthors.split(', ');

  return {
    format_version: 2,
    header: {
      name,
      description,
      uuid: uuidv4(),
      version: [1, 0, 0],
      min_engine_version: version,
    },
    modules: [
      {
        type,
        uuid: uuidv4(),
        version: [1, 0, 0],
      },
    ],
    metadata: { authors },
  };
};
