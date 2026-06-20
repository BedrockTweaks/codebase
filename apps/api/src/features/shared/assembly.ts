import type { Config } from '@/config';
import type { CreatePackDto } from '@bt/types';
import { constants, existsSync, readFileSync } from 'node:fs';
import { access, copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { deepMerge } from './combiner';

export type AssemblePackCallback = (
  packsPaths: string[],
  assemblyZipPath: string,
  config: Config,
) => Promise<void>;

export type FinalizePackCallback = (
  createPackDto: CreatePackDto,
  assemblyZipPath: string,
  outputPath: string,
  downloadUrl: string,
  config: Config,
) => Promise<void>;

export const SKIP_FILES = ['pack_icon.png', 'pack_icon.gif'];

export const pathExists = async (path: string): Promise<boolean> => {
  try {
    await access(path, constants.F_OK);

    return true;
  } catch {
    return false;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deepMergeJson = (filePath: string, packsPaths: string[], storageUrl: string, section: string): any => {
  let mergedJson = {};

  for (const packPath of packsPaths) {
    const fullFilePath = join(storageUrl, section, packPath, filePath);

    if (existsSync(fullFilePath)) {
      const fileContent = readFileSync(fullFilePath, 'utf8');
      const jsonContent = JSON.parse(fileContent);

      if (Array.isArray(jsonContent) && !Array.isArray(mergedJson) && Object.keys(mergedJson).length === 0) {
        mergedJson = [];
      }

      mergedJson = deepMerge(mergedJson, jsonContent);
    }
  }

  return mergedJson;
};

export const mergeLang = (filePath: string, packsPaths: string[], storageUrl: string, section: string): string => {
  let mergedLang = '';

  for (const packPath of packsPaths) {
    const fullFilePath = join(storageUrl, section, packPath, filePath);

    if (existsSync(fullFilePath)) {
      const fileContent = readFileSync(fullFilePath, 'utf8');

      mergedLang = `${mergedLang}\n${fileContent}`;
    }
  }

  return mergedLang;
};

export const copyDirectoryRecursive = async (src: string, dest: string): Promise<void> => {
  const items = await readdir(src);

  for (const item of items) {
    const srcPath = join(src, item);
    const destPath = join(dest, item);
    const stats = await stat(srcPath);

    if (stats.isDirectory()) {
      await mkdir(destPath, { recursive: true });
      await copyDirectoryRecursive(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
};
