import archiver, { type Archiver } from 'archiver';
import { createWriteStream } from 'node:fs';
import { rename } from 'node:fs/promises';

export const createZipFromAssembledDirectory = (assemblyDir: string): Archiver => {
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

  zip.directory(assemblyDir, false);

  return zip;
};

export const finalizeZipToFile = (zip: Archiver, outputPath: string): Promise<void> => {
  const tmpPath = `${outputPath}.tmp`;

  return new Promise((resolve, reject) => {
    const output = createWriteStream(tmpPath);

    zip.on('warning', (err) => {
      if (err.code !== 'ENOENT') {
        reject(err);
      }
    });
    zip.on('error', err => reject(err));
    output.on('error', err => reject(err));
    output.on('close', () => {
      rename(tmpPath, outputPath).then(resolve).catch(reject);
    });

    zip.pipe(output);

    void zip.finalize();
  });
};
