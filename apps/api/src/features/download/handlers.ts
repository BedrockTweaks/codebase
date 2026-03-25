import { readFile } from 'node:fs/promises';
import type { Context } from 'hono';
import { cleanupExpiredFiles, getTempFile } from '../shared/temp-storage';

export const handleDownloadFile = async (c: Context): Promise<Response> => {
  const { fileId } = c.req.param();

  if (!fileId || fileId.length !== 16) {
    return c.json(
      {
        message: 'Invalid file ID',
        statusCode: 400,
      },
      400,
    );
  }

  // Get file info from storage
  const fileInfo = getTempFile(fileId);

  if (!fileInfo) {
    return c.json(
      {
        message: 'File not found or has expired',
        statusCode: 404,
      },
      404,
    );
  }

  try {
    // Read file into buffer
    const fileBuffer = await readFile(fileInfo.filePath);

    // Lazy cleanup: remove expired files after successful download
    void cleanupExpiredFiles();

    // Return file with proper headers
    return c.body(fileBuffer, 200, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': fileBuffer.length.toString(),
      'Content-Disposition': `attachment; filename="${fileInfo.fileName}"`,
      'Cache-Control': 'no-store',
    });
  } catch (error) {
    console.error(`Error downloading file ${fileId}:`, error);

    return c.json(
      {
        message: 'Failed to download file',
        statusCode: 500,
      },
      500,
    );
  }
};
