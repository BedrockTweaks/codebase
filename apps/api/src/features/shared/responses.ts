import type { GeneratedPackResponse, PacksJSON } from '@bt/types';
import type { TypedResponse } from 'hono';

export type PacksResponse = TypedResponse<PacksJSON, 200, 'json'>;

export type GeneratedPackErrorBody = {
  message: string;
  statusCode: number;
};

export type GeneratedPackErrorResponse = TypedResponse<GeneratedPackErrorBody, 500, 'json'>;
export type GeneratedPackResult = TypedResponse<GeneratedPackResponse, 200, 'json'> | GeneratedPackErrorResponse;
