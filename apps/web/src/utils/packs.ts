import { Section } from '@/models';

interface GeneratedPackName {
  prefix: string;
  fileName: string;
  packName: string;
  isValid: boolean;
}

export function generatePackName(section: Section, inputName: string | undefined): GeneratedPackName {
  // Check if input is valid
  const isValid = inputName?.trim() !== '' && !hasNonAsciiCharacters(inputName);

  // Generate sanitized name
  const sanitizedName = isValid && inputName ? inputName : generateRandomNumber();

  // Get prefix and extension based on section
  let prefix: string;
  let extension: string;

  switch (section) {
    case Section.ResourcePacks:
      prefix = 'BTRP';
      extension = 'mcpack';
      break;
    case Section.Addons:
      prefix = 'BTAD';
      extension = 'mcaddon';
      break;
    case Section.CraftingTweaks:
      prefix = 'BTCT';
      extension = 'mcpack';
      break;
  }

  const packName = (inputName && isValid) ? sanitizedName : `${prefix}-${sanitizedName}`;
  const fileName = `${packName}.${extension}`;

  return {
    prefix,
    fileName,
    packName,
    isValid,
  };
}

function hasNonAsciiCharacters(text: string | undefined): boolean {
  if (!text) {
    return false;
  }

  // eslint-disable-next-line no-control-regex
  const nonAsciiRegex = /[^\x00-\x7F]/;

  return nonAsciiRegex.test(text);
}

function generateRandomNumber(): string {
  return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
}
