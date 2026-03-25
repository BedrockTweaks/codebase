import { OpenAPIHono } from '@hono/zod-openapi';
import { handleDownloadFile } from './handlers';
import { downloadFileRoute } from './routes';

export const downloadApp = new OpenAPIHono();

downloadApp.openapi(downloadFileRoute, handleDownloadFile);
