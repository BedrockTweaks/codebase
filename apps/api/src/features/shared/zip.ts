import { join, relative, basename } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { readdir, stat, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import archiver, { type Archiver } from 'archiver';
import type { Config } from '@/config';
import type { Section } from '@bt/types';
import { deepMerge } from './combiner';
import { getPacks } from './listing';

const SKIP_FILES = ['pack_icon.png', 'pack_icon.gif'];

// Helper function to check if path exists
const pathExists = async (path: string): Promise<boolean> => {
  try {
    await access(path, constants.F_OK);

    return true;
  } catch {
    return false;
  }
};

export const createResourcePackZip = async (
  section: Section,
  packsPaths: string[],
  config: Config,
): Promise<Archiver> => {
  const zip = archiver('zip');
  const { deepMergeFiles } = await getPacks(section, config);

  // Handle warnings and errors
  zip.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn(err);
    } else {
      throw err;
    }
  });

  zip.on('error', (err) => {
    throw err;
  });

  // Map to keep track of the files that are added to the zip
  const fileMap = new Set<string>();

  // Helper function to recursively scan and add files
  const addDirectoryToArchive = async (dirPath: string, basePath: string): Promise<void> => {
    const items = await readdir(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const relativePath = relative(basePath, fullPath);

      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        // If it's a directory, recurse
        await addDirectoryToArchive(fullPath, basePath);
      } else {
        // If it's a file, check if it's already added
        if (
          !fileMap.has(relativePath)
          && !SKIP_FILES.includes(basename(relativePath))
          && !deepMergeFiles.some(file => file.filename === basename(relativePath))
        ) {
          // Add to zip and mark as added
          zip.file(fullPath, { name: relativePath });
          fileMap.add(relativePath);
        }
      }
    }
  };

  // Loop through all directories provided in the parameter
  for (const packPath of packsPaths) {
    const fullPath = `${config.storageUrl}/${section}/${packPath}`;

    if (await pathExists(fullPath)) {
      await addDirectoryToArchive(fullPath, fullPath);
    } else {
      console.error(`Directory ${fullPath} does not exist.`);
    }
  }

  // Deep merge the special JSON files and add them to the zip
  deepMergeFiles.forEach((file) => {
    if (file.filepath.endsWith('.json')) {
      const mergedJson = deepMergeJson(section, file.filepath, packsPaths, config);

      // Check if the mergedJson object is not empty
      if (Object.keys(mergedJson).length > 0) {
        zip.append(JSON.stringify(mergedJson), { name: file.filepath });
      }
    } else if (file.filepath.endsWith('.lang')) {
      const lang = mergeLang(section, file.filepath, packsPaths, config);

      // Check if lang is not empty
      if (lang.length) {
        zip.append(lang, { name: file.filepath });
      }
    }
  });

  return zip;
};

export const createAddonsZip = async (
  section: Section,
  packsPaths: string[],
  config: Config,
): Promise<Archiver> => {
  const zip = archiver('zip');

  zip.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn(err);
    } else {
      throw err;
    }
  });

  zip.on('error', (err) => {
    throw err;
  });

  for (const packPath of packsPaths) {
    const buildDir = join(config.storageUrl, section, packPath, 'build');

    if (!(await pathExists(buildDir))) {
      console.error(`Build directory missing for addon pack: ${buildDir}`);

      continue;
    }

    const entries = await readdir(buildDir);

    for (const entry of entries) {
      const fullEntry = join(buildDir, entry);
      const stats = await stat(fullEntry);

      if (stats.isDirectory() && (entry.endsWith('_bp') || entry.endsWith('_rp'))) {
        zip.directory(fullEntry, entry);
      }
    }
  }

  return zip;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deepMergeJson = (section: string, filePath: string, packsPaths: string[], config: Config): any => {
  let mergedJson = {};

  for (const packPath of packsPaths) {
    const fullFilePath = join(config.storageUrl, section, packPath, filePath);

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

const mergeLang = (section: string, filePath: string, packsPaths: string[], config: Config): string => {
  let mergedLang = '';

  for (const packPath of packsPaths) {
    const fullFilePath = join(config.storageUrl, section, packPath, filePath);

    if (existsSync(fullFilePath)) {
      const fileContent = readFileSync(fullFilePath, 'utf8');

      mergedLang = `${mergedLang}\n${fileContent}`;
    }
  }

  return mergedLang;
};

export const zipToBuffer = (zip: Archiver): Promise<Buffer> => new Promise((resolve, reject) => {
  const chunks: Buffer[] = [];

  zip.on('warning', (err) => {
    if (err.code !== 'ENOENT') {
      reject(err);
    }
  });
  zip.on('error', err => reject(err));
  zip.on('data', (data) => {
    chunks.push(data);
  });
  zip.on('end', () => {
    resolve(Buffer.concat(chunks));
  });

  void zip.finalize();
});
