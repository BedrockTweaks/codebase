import type AdmZip from 'adm-zip';
import { type Archiver } from 'archiver';
import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { rename, rm } from 'node:fs/promises';

const RENAME_RETRY_DELAYS_MS = [10, 25, 50, 100];
const RENAME_CONTENTION_CODES = ['EPERM', 'EBUSY', 'EACCES'];

const isRenameContention = (error: unknown): boolean =>
  typeof error === 'object'
  && error !== null
  && 'code' in error
  && typeof error.code === 'string'
  && RENAME_CONTENTION_CODES.includes(error.code);

/**
 * POSIX replaces the destination atomically, but Windows rejects the rename
 * while another writer or reader still holds it, which concurrent assemblies of
 * the same cache key routinely do. Both writers produced the same content, so
 * retrying until one lands is enough.
 */
const renameWithRetry = async (from: string, to: string): Promise<void> => {
  for (const delayMs of RENAME_RETRY_DELAYS_MS) {
    try {
      await rename(from, to);

      return;
    } catch (error) {
      if (!isRenameContention(error)) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  await rename(from, to);
};

// Zip general purpose bit 3: the sizes and CRC follow the entry data in a
// descriptor instead of sitting in the local header.
const FLAG_DATA_DESCRIPTOR = 0x8;

/**
 * Writes the pack the user downloads.
 *
 * archiver streams the assembly and marks every entry with the data descriptor
 * flag, but adm-zip rewrites those entries with their sizes inline and emits no
 * descriptor. Carrying the flag over yields a zip that strict readers reject, so
 * clear it before writing.
 */
export const writeZipToFile = async (zip: AdmZip, outputPath: string): Promise<void> => {
  for (const entry of zip.getEntries()) {
    entry.header.flags &= ~FLAG_DATA_DESCRIPTOR;
  }

  const tmpPath = `${outputPath}.${randomUUID()}.tmp`;

  zip.writeZip(tmpPath);

  await renameWithRetry(tmpPath, outputPath);
};

export const finalizeZipToFile = (zip: Archiver, outputPath: string): Promise<void> => {
  // Unique per call: concurrent assemblies of the same cache key share an output
  // path, and a shared temp file would let them interleave into one broken zip.
  const tmpPath = `${outputPath}.${randomUUID()}.tmp`;

  return new Promise((resolve, reject) => {
    const output = createWriteStream(tmpPath);

    const fail = (err: Error): void => {
      void rm(tmpPath, { force: true }).finally(() => reject(err));
    };

    zip.on('warning', (err) => {
      if (err.code !== 'ENOENT') {
        fail(err);
      }
    });
    zip.on('error', err => fail(err));
    output.on('error', err => fail(err));
    output.on('close', () => {
      renameWithRetry(tmpPath, outputPath).then(resolve).catch(fail);
    });

    zip.pipe(output);

    void zip.finalize();
  });
};
