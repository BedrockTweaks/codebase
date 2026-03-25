import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Temporary file metadata stored in memory
 */
interface TempFileInfo {
  filePath: string;
  fileName: string;
  expiresAt: Date;
}

/**
 * In-memory storage for temporary file mappings
 * Key: fileId (16-char hex), Value: file metadata
 */
const tempFileStorage = new Map<string, TempFileInfo>();

/**
 * Base directory for temporary downloads
 */
const TEMP_DIR = join(tmpdir(), 'bedrock-tweaks-downloads');

/**
 * Time-to-live for temporary files (15 minutes)
 */
const TTL_MINUTES = 15;

/**
 * Initialize temp directory if it doesn't exist
 */
export const initTempStorage = async (): Promise<void> => {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });

    console.info('Temp storage initialized:', TEMP_DIR);
  } catch (error) {
    console.error('Failed to initialize temp storage:', error);

    throw error;
  }
};

/**
 * Clean up all files in temp directory (used on startup)
 */
export const cleanupAllTempFiles = async (): Promise<void> => {
  try {
    const files = await fs.readdir(TEMP_DIR);

    await Promise.all(
      files.map(async (file) => {
        const filePath = join(TEMP_DIR, file);

        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.error(`Failed to delete temp file ${file}:`, error);
        }
      }),
    );

    tempFileStorage.clear();

    console.info(`Cleaned up ${files.length} temp files on startup`);
  } catch (error) {
    // Directory doesn't exist yet, that's fine
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return;
    }

    console.error('Failed to cleanup temp files:', error);
  }
};

/**
 * Generate a random file ID (16-character hex string)
 */
const generateFileId = (): string => randomBytes(8).toString('hex');

/**
 * Save a buffer to temporary storage and return download info
 */
export const saveTempFile = async (
  buffer: Buffer,
  fileName: string,
  baseUrl: string,
): Promise<{
  fileId: string;
  downloadUrl: string;
  expiresAt: Date;
}> => {
  const fileId = generateFileId();
  const filePath = join(TEMP_DIR, `${fileId}_${fileName}`);
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60 * 1000);

  try {
    // Write file to disk
    await fs.writeFile(filePath, buffer);

    // Store metadata in memory
    tempFileStorage.set(fileId, {
      filePath,
      fileName,
      expiresAt,
    });

    const downloadUrl = `${baseUrl}/api/download/${fileId}`;

    console.info(`Saved temp file: ${fileId} (expires: ${expiresAt.toISOString()})`);

    return {
      fileId,
      downloadUrl,
      expiresAt,
    };
  } catch (error) {
    console.error(`Failed to save temp file ${fileId}:`, error);

    throw new Error('Failed to save temporary file');
  }
};

/**
 * Get temporary file info by fileId
 * Returns null if file doesn't exist or is expired
 */
export const getTempFile = (fileId: string): TempFileInfo | null => {
  const fileInfo = tempFileStorage.get(fileId);

  if (!fileInfo) {
    return null;
  }

  // Check if file is expired
  if (Date.now() > fileInfo.expiresAt.getTime()) {
    // Remove expired entry
    tempFileStorage.delete(fileId);

    // Try to delete the file (async, don't await)
    void fs.unlink(fileInfo.filePath).catch((error) => {
      console.error(`Failed to delete expired file ${fileId}:`, error);
    });

    return null;
  }

  return fileInfo;
};

/**
 * Clean up expired temporary files
 * Called lazily after each download (fire-and-forget)
 */
export const cleanupExpiredFiles = async (): Promise<void> => {
  const now = Date.now();
  const expiredEntries: Array<[string, TempFileInfo]> = [];

  // Find expired entries
  for (const [fileId, fileInfo] of tempFileStorage.entries()) {
    if (now > fileInfo.expiresAt.getTime()) {
      expiredEntries.push([fileId, fileInfo]);
    }
  }

  if (expiredEntries.length === 0) {
    return;
  }

  console.info(`Cleaning up ${expiredEntries.length} expired temp files`);

  // Delete files and remove from storage
  await Promise.all(
    expiredEntries.map(async ([fileId, fileInfo]) => {
      try {
        await fs.unlink(fileInfo.filePath);

        tempFileStorage.delete(fileId);
      } catch (error) {
        console.error(`Failed to delete expired file ${fileId}:`, error);
      }
    }),
  );

  console.info('Cleanup completed');
};
