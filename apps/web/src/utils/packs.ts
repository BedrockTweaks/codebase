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

/**
 * Derive the file name to put on the download anchor from a generated pack URL.
 * Parsing must never throw: a missing `download` attribute is a cosmetic problem,
 * but an exception here aborts the click that actually starts the download.
 * @param downloadUrl - URL returned by the API, possibly relative or malformed
 * @param fallbackName - Pack name to use when no file name can be recovered
 */
export function resolveDownloadFileName(downloadUrl: string | undefined, fallbackName: string): string {
  if (!downloadUrl) {
    return fallbackName;
  }

  const base = typeof window === 'undefined' ? undefined : window.location.href;

  let pathname: string;

  try {
    pathname = new URL(downloadUrl, base).pathname;
  } catch {
    // Not resolvable as a URL, fall back to the raw string minus query and fragment
    pathname = downloadUrl.split(/[?#]/)[0];
  }

  const segment = pathname.split('/').pop();

  return segment ? decodeUriComponentSafe(segment) : fallbackName;
}

function decodeUriComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    // Malformed percent-encoding, keep the raw segment
    return value;
  }
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
